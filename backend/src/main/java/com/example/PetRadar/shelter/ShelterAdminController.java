package com.example.PetRadar.shelter;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 보호소 감시를 손으로 한 번 돌린다.
 *
 * 평소에는 스케줄러가 한 시간마다 돌지만, 새로 들어온 아이가 있는지 바로
 * 확인하거나 알림이 왜 안 갔는지 살펴볼 때 쓴다.
 * /api/internal/ 경로는 nginx가 외부 요청을 막으므로 컨테이너 안에서만 호출된다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/internal/shelter")
public class ShelterAdminController {

    private final ShelterWatchService watchService;

    @PostMapping("/watch")
    public ResponseEntity<Map<String, Object>> watch() {
        return ResponseEntity.ok(watchService.runWatch());
    }
}
