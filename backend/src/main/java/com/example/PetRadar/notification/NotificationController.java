package com.example.PetRadar.notification;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {
    private final NotificationService notificationService;
    private final NotificationStream notificationStream;

    /**
     * 알림 스트림(SSE).
     *
     * 브라우저의 EventSource는 요청에 헤더를 붙일 수 없어 Authorization을 쓸 수 없다.
     * 그래서 이 경로만 HttpOnly 쿠키(refreshToken)로 인증한다 — JwtAuthenticationFilter
     * 참고. 액세스 토큰을 쿼리 파라미터로 받던 예전 방식은 그 값이 nginx 액세스
     * 로그·브라우저 히스토리에 남아서 걷어냈다.
     *
     * 끊긴 사이에 온 알림은 재전송하지 않는다. 알림의 진실은 DB에 있고
     * (GET /api/notification/me) 스트림은 "지금 보라"고 찌르는 수단일 뿐이다.
     * 그래서 Last-Event-ID도 쓰지 않는다 — 다시 붙은 쪽이 목록을 새로 받으면 된다.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal UserDetails userDetails, HttpServletResponse response) {
        // nginx 쪽에도 proxy_buffering off를 두지만, 경로 설정을 빠뜨린 프록시가
        // 중간에 끼어도 이벤트가 버퍼에 갇히지 않게 응답으로도 알린다
        response.setHeader("X-Accel-Buffering", "no");
        return notificationStream.subscribe(Long.parseLong(userDetails.getUsername()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotificationDTO>> getNotificationsForUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long receiverId = Long.parseLong(userDetails.getUsername());
        List<NotificationDTO> notifications = notificationService.findByReceiverId(receiverId);
        return ResponseEntity.ok(notifications);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId, @AuthenticationPrincipal UserDetails userDetails) {
        Long receiverId = Long.parseLong(userDetails.getUsername());
        notificationService.deleteNotification(receiverId, notificationId);
        return ResponseEntity.ok().build();
    }
}
