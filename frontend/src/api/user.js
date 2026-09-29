import { client } from "./client";

export const fetchMe = () => client.get("/api/user/me").then((r) => r.data);

/**
 * 회원 정보 수정.
 * newPw를 비우면 비밀번호는 건드리지 않는다. 바꿀 때만 currentPw가 필요하다 —
 * 연락처만 고치는 데 현재 비밀번호를 물을 이유가 없다.
 */
export const updateMe = ({ hp, newPw, currentPw }) =>
  client.patch("/api/user/me", { hp, newPw, currentPw });

export const deleteMe = () => client.delete("/api/user/me");
