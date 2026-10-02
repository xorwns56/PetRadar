import { client } from "./client";

export const fetchMyNotifications = () =>
  client.get("/api/notification/me").then((r) => r.data);

export const deleteNotification = (id) =>
  client.delete(`/api/notification/${id}`);

/**
 * 알림 스트림(SSE) 주소.
 *
 * axios가 아니라 브라우저의 EventSource가 직접 여는 연결이라 client를 타지 않는다.
 * 그래도 주소는 이 폴더 밖에 두지 않는다.
 *
 * 인증은 HttpOnly 쿠키가 알아서 실려 처리된다 — EventSource는 헤더를 붙일 수
 * 없어서 Authorization을 쓸 수 없고, 토큰을 쿼리 파라미터로 실으면 nginx
 * 액세스 로그와 브라우저 히스토리에 남는다.
 */
export const NOTIFICATION_STREAM_URL = "/api/notification/stream";
