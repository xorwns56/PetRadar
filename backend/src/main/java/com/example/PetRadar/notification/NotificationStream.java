package com.example.PetRadar.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 접속해 있는 사용자에게 알림을 밀어 넣는 SSE 연결 보관소.
 *
 * STOMP 브로커를 걷어내면서 "누가 접속해 있는가"를 직접 들게 됐다. 트래픽이
 * 서버→클라이언트 한 방향뿐이라(받는 핸들러가 하나도 없었다) 브로커의
 * destination·구독 모델이 하는 일이 없었다.
 *
 * 한 사용자에 연결이 여럿일 수 있다 — 탭을 두 개 열면 두 개다. 그래서 값이 리스트다.
 */
@Component
public class NotificationStream {

    private static final Logger log = LoggerFactory.getLogger(NotificationStream.class);

    /**
     * 연결 수명. 끝나면 브라우저가 알아서 다시 붙으므로(EventSource) 끊기는 것 자체는
     * 사고가 아니다. 무한(0)으로 두지 않는 이유는 TCP가 죽은 줄 모르는 연결을
     * 영구히 들고 있지 않게 하기 위해서다 — 아래 하트비트와 이중 안전망이다.
     */
    private static final long TIMEOUT_MS = 30 * 60 * 1000L;

    /**
     * 하트비트 주기.
     *
     * SSE는 끝나지 않는 평범한 HTTP 응답이라 "오래 갈 연결"이라고 선언하는 수단이
     * 없다. 중간의 nginx·로드밸런서는 그냥 느린 응답으로 보고 각자의 유휴 타임아웃을
     * 적용한다(nginx proxy_read_timeout 기본 60초, ALB 기본 60초). 그래서 조용할 때도
     * 주석 줄을 흘려보내 연결이 살아 있음을 알린다.
     *
     * STOMP는 이 역할을 프로토콜이 해줬다(heartbeatIncoming/Outgoing). 직접 쓰는 쪽으로
     * 바뀐 대가가 이 메서드다.
     */
    private static final long HEARTBEAT_MS = 15_000L;

    private final Map<Long, List<SseEmitter>> connections = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        connections.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>()).add(emitter);

        // 세 콜백이 모두 같은 일을 한다. 끊긴 연결을 맵에 남기면 보낼 때마다
        // 실패하고, 사용자가 다녀간 만큼 키가 쌓인다
        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(e -> remove(userId, emitter));

        // 첫 이벤트를 즉시 보낸다. 바이트가 한 번 나가야 응답 헤더가 플러시되어
        // 브라우저의 onopen이 뜨고, 첫 바이트를 기다리는 중간 버퍼도 풀린다
        write(userId, emitter, SseEmitter.event().name("open").data("ok"));
        return emitter;
    }

    /** 받는 사람이 접속해 있지 않으면 아무 일도 하지 않는다 — 알림은 DB에 이미 저장돼 있다 */
    public void send(Long userId, NotificationDTO notification) {
        List<SseEmitter> targets = connections.get(userId);
        if (targets == null) {
            return;
        }
        for (SseEmitter emitter : targets) {
            write(userId, emitter, SseEmitter.event().name("notification").data(notification));
        }
    }

    @Scheduled(fixedDelay = HEARTBEAT_MS)
    public void heartbeat() {
        connections.forEach((userId, targets) -> {
            for (SseEmitter emitter : targets) {
                // 주석 줄(":ping")은 클라이언트의 이벤트 핸들러를 거치지 않는다.
                // 연결에 바이트를 흘리는 것이 목적이다
                write(userId, emitter, SseEmitter.event().comment("ping"));
            }
        });
    }

    /**
     * 쓰기 실패는 "상대가 사라졌다"는 뜻이다. 브라우저를 닫거나 네트워크가 끊기면
     * 콜백보다 쓰기 실패가 먼저 알려주는 경우가 있어 여기서도 정리한다.
     */
    private void write(Long userId, SseEmitter emitter, SseEmitter.SseEventBuilder event) {
        try {
            emitter.send(event);
        } catch (IOException | IllegalStateException e) {
            log.debug("SSE 전송 실패, 연결을 정리한다 (userId={})", userId);
            remove(userId, emitter);
        }
    }

    private void remove(Long userId, SseEmitter emitter) {
        connections.computeIfPresent(userId, (key, targets) -> {
            targets.remove(emitter);
            // 빈 리스트를 남기면 다녀간 사용자 수만큼 키가 쌓인다
            return targets.isEmpty() ? null : targets;
        });
    }
}
