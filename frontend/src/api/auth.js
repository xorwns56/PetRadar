import axios from "axios";
import { client } from "./client";

/** 이미 쓰고 있는 아이디인지 */
export const checkIdExists = (id) =>
  client.get("/api/auth/check-exist", { params: { id } }).then((r) => r.data);

/** 로그인. 실패하면 예외가 난다 */
export const login = (id, pw) =>
  client.post("/api/auth/login", { id, pw }).then((r) => r.data);

export const register = (id, pw, hp) =>
  client.post("/api/auth/register", { id, pw, hp });

/**
 * 로그아웃. 서버에 저장된 Refresh Token까지 지워야 실제로 무효화된다
 * (액세스 토큰만 지우면 쿠키의 Refresh Token으로 재발급이 된다).
 *
 * client가 아니라 순수 axios로 부른다 — 이 요청이 401을 받으면
 * client의 인터셉터가 다시 로그아웃을 불러 맞물리기 때문이다.
 */
export const logout = () =>
  axios.post("/api/auth/logout", null, { withCredentials: true });
