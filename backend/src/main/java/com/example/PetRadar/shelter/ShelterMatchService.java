package com.example.PetRadar.shelter;

import com.example.PetRadar.global.error.NotFoundException;
import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 실종 신고와 보호 중인 유기동물을 맞춰 본다.
 *
 * 무엇으로 거르고 무엇으로 점수만 주는지는 공공 데이터의 실제 품질로 정했다.
 *
 *   거름  축종      개 4,469 / 고양이 2,436 / 기타 147로 깔끔하게 나뉜다
 *   거름  지역      관할 지자체(orgNm)가 모든 레코드에 있다. 발견 지점의 좌표는
 *                   없고 발견장소는 "초계면소방서"처럼 자유 문자열이라 못 쓴다.
 *                   유기동물은 발견된 지자체로 접수되므로 이것이 발견 지역이다
 *   거름  날짜      잃어버리기 전에 들어온 개체는 내 아이일 수 없다
 *
 *   점수  품종      절반 이상이 "믹스견"·"한국 고양이"다. 신고자는 "말티즈"라
 *                   적는데 보호소는 "믹스견"으로 적으니, 거름으로 쓰면
 *                   진짜 매칭을 대부분 놓친다
 *   점수  출생년도  보호소 추정치라 정확하지 않다
 *   점수  성별      미상(Q)이 9%다. 거름으로 쓰면 그만큼 날아간다
 *
 * 색상은 쓰지 않는다. "검정색"·"검은색흰색황토색조합"·"흰색/검은색 얼룩무늬"처럼
 * 표기가 제각각이라 맞춰볼 수가 없다.
 */
@Service
@RequiredArgsConstructor
public class ShelterMatchService {

    /** 실종 신고의 종류 코드 → 공공 API의 축종 이름 */
    private static final Map<String, String> KIND = Map.of(
            "dog", "개",
            "cat", "고양이",
            "etc", "기타"
    );

    /** "2023(년생)" 앞머리의 연도 */
    private static final Pattern BIRTH_YEAR = Pattern.compile("^(\\d{4})");

    private static final int LIMIT = 12;

    private final MissingRepository missingRepository;
    private final ShelterService shelterService;

    /**
     * @param region 실종 지점의 관할 지자체 ("경기도 화성시").
     *               좌표를 지역명으로 바꾸는 일은 카카오 SDK를 쓸 수 있는 화면이 한다.
     *               비어 있으면 지역으로 좁히지 않는다
     */
    public List<ShelterAnimalDTO> findCandidates(Long missingId, String region) {
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));

        String kind = KIND.get(missing.getPetType());
        String missingDate = digitsOnly(missing.getPetMissingDate());

        return shelterService.getAllAnimals().stream()
                .filter(a -> kind == null || kind.equals(a.getKindType()))
                .filter(a -> inRegion(a.getOrgNm(), region))
                .filter(a -> foundAfter(a.getFoundDate(), missingDate))
                .sorted(Comparator
                        .comparingInt((ShelterAnimalDTO a) -> score(a, missing)).reversed()
                        // 점수가 같으면 최근에 들어온 아이를 먼저 본다
                        .thenComparing(ShelterAnimalDTO::getFoundDate,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(LIMIT)
                .toList();
    }

    /**
     * 시군구까지 같으면 가장 좋고, 아니면 시도까지만 같아도 남긴다.
     * 동물은 시군구 경계를 넘어 다니고, 접수 지자체가 발견 지점과 어긋나는 일도 있다.
     */
    private boolean inRegion(String orgNm, String region) {
        if (region == null || region.isBlank() || orgNm == null) return true;
        if (orgNm.equals(region)) return true;
        String sido = region.split(" ")[0];
        return orgNm.startsWith(sido);
    }

    /** 실종일보다 뒤에 발견된 개체만 남긴다. 둘 다 yyyyMMdd라 문자열 비교로 충분하다 */
    private boolean foundAfter(String foundDate, String missingDate) {
        if (foundDate == null || missingDate == null || missingDate.length() != 8) return true;
        return foundDate.compareTo(missingDate) >= 0;
    }

    private int score(ShelterAnimalDTO animal, Missing missing) {
        int score = 0;

        // 보호소가 품종을 구체적으로 적은 경우에만 값이 있다
        String breed = animal.getBreed();
        if (breed != null && missing.getPetBreed() != null && !breed.contains("믹스")
                && breed.replace(" ", "").contains(missing.getPetBreed().replace(" ", ""))) {
            score += 3;
        }

        Integer animalYear = birthYear(animal.getAge());
        Integer missingYear = birthYear(missing.getPetAge());
        if (animalYear != null && missingYear != null
                && Math.abs(animalYear - missingYear) <= 1) {
            score += 2;
        }

        // Q(미상)는 맞다고도 아니라고도 할 수 없으므로 점수를 주지 않는다
        if (animal.getSex() != null && animal.getSex().equals(missing.getPetGender())) {
            score += 1;
        }

        // 같은 지자체면 한 칸 위로. 시도만 같은 경우와 구분해 준다
        if (animal.getOrgNm() != null && missing.getPetMissingPlace() != null
                && animal.getOrgNm().equals(missing.getPetMissingPlace())) {
            score += 1;
        }

        return score;
    }

    private Integer birthYear(String value) {
        if (value == null) return null;
        Matcher m = BIRTH_YEAR.matcher(value.trim());
        return m.find() ? Integer.parseInt(m.group(1)) : null;
    }

    private String digitsOnly(String value) {
        return value == null ? null : value.replaceAll("\\D", "");
    }
}
