import axios from "axios";

/**
 * 모든 API 호출이 쓰는 axios 인스턴스.
 *
 * 예전에는 AuthContext 안에서 useMemo로 만들어 context로 내려줬다. 그래서
 * API를 부르는 쪽이 전부 useAuth()로 인스턴스를 꺼내야 했고, URL도 부르는
 * 자리마다 적혔다(pages 14곳, components 4곳, hooks 1곳).
 * 인스턴스를 모듈로 옮겨 api/ 아래 함수들이 직접 쓰게 한다.
 */
export const client = axios.create({ withCredentials: true });

// 요청마다 액세스 토큰을 싣는다
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 서버가 새 토큰을 헤더로 내려주면 바로 교체한다
client.interceptors.response.use((response) => {
  const newToken = response.headers.authorization;
  if (newToken) sessionStorage.setItem("accessToken", newToken);
  return response;
});

/**
 * 401 처리만은 "로그아웃이 무엇인지"를 알아야 해서 AuthProvider가 붙인다.
 * 반환값을 부르면 떼어낸다 (effect의 cleanup에서 쓴다).
 */
export const onUnauthorized = (handler) => {
  const id = client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) handler();
      return Promise.reject(error);
    }
  );
  return () => client.interceptors.response.eject(id);
};
