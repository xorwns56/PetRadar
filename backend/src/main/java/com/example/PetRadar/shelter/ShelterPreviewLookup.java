package com.example.PetRadar.shelter;

import com.example.PetRadar.notification.NotificationDTO;
import com.example.PetRadar.notification.ShelterPreviewProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/** 유기번호로 알림에 띄울 요약을 찾는다. 보호소 캐시에서 보므로 비용이 거의 없다 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShelterPreviewLookup implements ShelterPreviewProvider {

    private final ShelterService shelterService;

    @Override
    public Optional<NotificationDTO.Preview> find(String desertionNo) {
        try {
            return shelterService.getAllAnimals().stream()
                    .filter(a -> desertionNo.equals(a.getDesertionNo()))
                    .findFirst()
                    .map(a -> new NotificationDTO.Preview(
                            a.getBreed(), a.getOrgNm(), a.getThumbnailUrl()));   // 품종 · 관할
        } catch (Exception e) {
            // 공공 API가 잠깐 죽었다고 알림 목록까지 못 보게 할 이유는 없다
            log.warn("알림 요약을 찾지 못했다: {}", desertionNo, e);
            return Optional.empty();
        }
    }
}
