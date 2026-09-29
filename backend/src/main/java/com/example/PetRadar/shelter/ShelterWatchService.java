package com.example.PetRadar.shelter;

import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingRepository;
import com.example.PetRadar.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 보호소에 새로 들어온 아이가 누군가의 실종 신고와 맞는지 지켜본다.
 *
 * 상세 화면의 후보 목록은 신고자가 들어와야 보인다. 공고 기간이 보통
 * 열흘이라 늦게 알면 손쓰기 어려우므로, 새로 들어온 개체는 밀어서 알린다.
 *
 * 공공 API는 "지금 보호 중인 목록"만 주기 때문에 어제와 비교해야 새 개체를
 * 알 수 있다. 그래서 본 적 있는 유기번호를 남겨 둔다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShelterWatchService {

    /**
     * 알림을 보낼 점수 기준.
     *
     * 축종·지역·날짜만 맞으면 "서울에서 발견된 개"는 하루에도 여러 마리다.
     * 다 알리면 신고자가 지쳐 알림을 꺼버리고, 그러면 진짜 매칭도 놓친다.
     * 3점은 "품종이 맞거나, 나이와 성별이 둘 다 맞는" 경우다.
     */
    private static final int NOTIFY_SCORE = 3;

    /**
     * 믹스로 신고한 글은 기준을 낮춘다.
     *
     * 보호 중인 개의 84%가 "믹스견"이라 품종으로 좁힐 수가 없다. 같은 기준을
     * 적용하면 믹스견을 잃어버린 사람만 알림을 거의 못 받는다.
     */
    private static final int NOTIFY_SCORE_MIXED = 2;

    /** 한 글에 대해 한 번에 보낼 최대 건수 */
    private static final int MAX_PER_MISSING = 3;

    /**
     * 한 사람에게 한 번에 보낼 최대 건수.
     *
     * 글마다만 제한하면 신고를 여러 건 올린 사람에게 그 배수로 쌓인다.
     * 받는 사람 기준으로도 막아야 서랍이 한 번에 넘치지 않는다.
     */
    private static final int MAX_PER_RECEIVER = 5;

    private final ShelterService shelterService;
    private final ShelterMatchService matchService;
    private final MissingRepository missingRepository;
    private final SeenShelterAnimalRepository seenRepository;
    private final NotifiedShelterMatchRepository notifiedRepository;
    private final NotificationService notificationService;

    /**
     * 공공 API가 하루 내내 갱신되므로 한 시간마다 본다.
     * 캐시 주기와 맞춰 두어 불필요한 외부 호출이 겹치지 않게 한다.
     */
    @Scheduled(fixedDelayString = "${app.shelter.watch-interval-ms:3600000}",
            initialDelayString = "${app.shelter.watch-initial-delay-ms:120000}")
    @Transactional
    public void watch() {
        runWatch();
    }

    /** 수동 실행에서 결과를 보려고 값을 돌려준다 */
    @Transactional
    public Map<String, Object> runWatch() {
        List<ShelterAnimalDTO> animals;
        try {
            animals = shelterService.getAllAnimals();
        } catch (Exception e) {
            // 공공 API가 잠깐 죽은 것까지 장애로 볼 필요는 없다. 다음 주기에 다시 본다
            log.warn("보호동물을 받아오지 못해 이번 주기는 건너뛴다", e);
            return Map.of("skipped", true);
        }

        Set<String> seen = new HashSet<>(seenRepository.findAllDesertionNos());
        List<ShelterAnimalDTO> arrived = animals.stream()
                .filter(a -> a.getDesertionNo() != null && !seen.contains(a.getDesertionNo()))
                .toList();

        if (arrived.isEmpty()) {
            log.info("보호소에 새로 들어온 아이 없음");
            return Map.of("arrived", 0, "notified", 0);
        }

        boolean first = firstRun(seen);
        int sent = first ? 0 : notifyMatches(arrived);

        // 알림을 보냈든 아니든 "봤다"는 사실은 남긴다
        seenRepository.saveAll(arrived.stream().map(a -> new SeenShelterAnimal(a.getDesertionNo())).toList());
        log.info("새로 들어온 아이 {}마리, 알림 {}건", arrived.size(), sent);
        return Map.of("arrived", arrived.size(), "notified", sent, "firstRun", first);
    }

    /**
     * 처음 도는 회차는 알리지 않는다.
     *
     * 본 적 있는 개체가 하나도 없으면 지금 보호 중인 4천여 마리가 전부
     * "새로 들어온 것"이 된다. 그대로 돌리면 신고자마다 수십 건이 한꺼번에 간다.
     */
    private boolean firstRun(Set<String> seen) {
        if (seen.isEmpty()) {
            log.info("첫 회차라 현재 목록을 기준점으로만 저장한다");
            return true;
        }
        return false;
    }

    private int notifyMatches(List<ShelterAnimalDTO> arrived) {
        List<Missing> openReports = missingRepository.findAllWithUser();
        Map<Long, Integer> sentPerReceiver = new HashMap<>();
        int sent = 0;

        for (Missing missing : openReports) {
            Long receiverId = missing.getUser().getId();
            int sentForThis = 0;
            for (ShelterAnimalDTO animal : matchService.rank(missing, arrived)) {
                if (sentForThis >= MAX_PER_MISSING) break;
                if (sentPerReceiver.getOrDefault(receiverId, 0) >= MAX_PER_RECEIVER) break;
                if (notifiedRepository.existsByMissingIdAndDesertionNo(
                        missing.getId(), animal.getDesertionNo())) continue;

                notificationService.createNotificationToUser(
                        null, receiverId, "shelter", missing.getId(), animal.getDesertionNo());
                notifiedRepository.save(
                        new NotifiedShelterMatch(missing.getId(), animal.getDesertionNo()));
                sentPerReceiver.merge(receiverId, 1, Integer::sum);
                sentForThis++;
                sent++;
            }
        }
        return sent;
    }

    /** 신고 글의 품종이 믹스면 기준을 낮춘다 */
    static int thresholdFor(Missing missing) {
        String breed = missing.getPetBreed();
        return breed != null && breed.contains("믹스") ? NOTIFY_SCORE_MIXED : NOTIFY_SCORE;
    }
}
