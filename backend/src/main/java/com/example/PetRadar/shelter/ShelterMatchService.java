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
     *               화면이 좌표에서 구해 보내면 그걸 쓰고, 없으면 글에 저장된 값을 쓴다.
     *               스케줄러처럼 화면이 없는 곳은 저장된 값만 쓸 수 있다.
     */
    public List<ShelterAnimalDTO> findCandidates(Long missingId, String region) {
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        return findCandidates(missing, region);
    }

    public List<ShelterAnimalDTO> findCandidates(Missing missing, String region) {
        String area = (region != null && !region.isBlank()) ? region : missing.getRegion();

        String kind = KIND.get(missing.getPetType());
        String missingDate = digitsOnly(missing.getPetMissingDate());

        return shelterService.getAllAnimals().stream()
                .filter(a -> kind == null || kind.equals(a.getKindType()))
                .filter(a -> inRegion(a.getOrgNm(), area))
                .filter(a -> foundAfter(a.getFoundDate(), missingDate))
                .sorted(Comparator
                        .comparingInt((ShelterAnimalDTO a) -> score(a, missing, area)).reversed()
                        // 점수가 같으면 최근에 들어온 아이를 먼저 본다
                        .thenComparing(ShelterAnimalDTO::getFoundDate,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(LIMIT)
                .toList();
    }

    /**
     * 주어진 개체 중 이 신고와 알릴 만큼 맞는 것만 점수 높은 순으로 고른다.
     * 화면용 후보(findCandidates)와 달리 기준을 넘지 못하면 아예 빼낸다 —
     * 밀어서 보내는 알림은 틀리면 헛된 기대를 주기 때문이다.
     */
    public List<ShelterAnimalDTO> rank(Missing missing, List<ShelterAnimalDTO> animals) {
        String area = missing.getRegion();
        /* 지역을 모르는 글에는 알리지 않는다.
           화면의 후보 목록은 지역이 없으면 전국으로 넓히는데, 그건 사용자가
           직접 들어와 훑는 자리라 넓어도 괜찮다. 밀어서 보내는 알림까지
           전국으로 넓히면 "서울에서 잃어버린 개" 신고에 제주 유기견이 간다. */
        if (area == null || area.isBlank()) return List.of();

        String kind = KIND.get(missing.getPetType());
        String missingDate = digitsOnly(missing.getPetMissingDate());
        int threshold = ShelterWatchService.thresholdFor(missing);

        return animals.stream()
                .filter(a -> kind == null || kind.equals(a.getKindType()))
                .filter(a -> inRegion(a.getOrgNm(), area))
                .filter(a -> foundAfter(a.getFoundDate(), missingDate))
                .filter(a -> score(a, missing, area) >= threshold)
                .sorted(Comparator.comparingInt(
                        (ShelterAnimalDTO a) -> score(a, missing, area)).reversed())
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

    int score(ShelterAnimalDTO animal, Missing missing, String area) {
        int score = breedScore(animal.getBreed(), missing.getPetBreed());

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

        score += foundPlaceBonus(animal.getFoundPlace(), area);
        return score;
    }

    /**
     * 발견장소가 실종 지역을 가리키면 한 칸 올린다.
     *
     * 지역을 거르는 기준은 관할 지자체(orgNm)다. 발견장소 문자열이 의미상으로는
     * 더 정확하지만 "초계면소방서"·"보호센터 내 출산"처럼 자유롭게 적혀 있어
     * 시군구를 알아볼 수 있는 건 30%뿐이다. 거름으로 쓰면 나머지가 다 떨어진다.
     * 그래서 알아볼 수 있을 때만 가점으로 쓴다.
     *
     * 관할과 발견장소가 어긋나 보이는 16%는 대부분 "처인구 금학로"처럼
     * 행정구만 적고 시 이름을 생략한 경우라, 시군구 이름이 들어 있는지만 본다.
     */
    private int foundPlaceBonus(String foundPlace, String area) {
        if (foundPlace == null || area == null) return 0;
        String[] parts = area.split(" ");
        if (parts.length < 2) return 0;
        return foundPlace.contains(parts[1]) ? 1 : 0;
    }

    /**
     * 품종 점수.
     *
     * 한쪽이 다른 쪽을 포함하면 맞다고 본다. 신고 폼은 큰 분류("푸들")를 쓰고
     * 보호소는 세부 품종("토이 푸들")을 쓰는 일이 잦은데, 완전 일치로 보면
     * 이런 짝이 전부 어긋난다. 보호소가 상위 이름만 적는 경우도 있어
     * (106마리가 그냥 "푸들") 방향을 한쪽으로 고정할 수 없다.
     *
     * 믹스는 따로 센다. 보호 중인 개의 84%가 "믹스견"이라 품종이 사실상
     * 정보가 없는 값인데, 그렇다고 0점을 주면 믹스견을 잃어버린 사람은
     * 품종 신호를 영영 못 쓴다. 양쪽 다 믹스면 약한 점수만 준다.
     */
    private int breedScore(String shelterBreed, String missingBreed) {
        if (shelterBreed == null || missingBreed == null) return 0;

        boolean shelterMix = isMixed(shelterBreed);
        boolean missingMix = isMixed(missingBreed);
        if (shelterMix || missingMix) {
            return shelterMix && missingMix ? 1 : 0;
        }

        String a = shelterBreed.replace(" ", "");
        String b = missingBreed.replace(" ", "");
        return a.contains(b) || b.contains(a) ? 3 : 0;
    }

    /** 공공 데이터는 "믹스견"·"믹스묘"로, 신고 폼도 같은 말을 쓴다 */
    private boolean isMixed(String breed) {
        return breed.contains("믹스");
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
