import axios from "axios";

// axios 인스턴스 생성 및 HttpOnly 쿠키 자동 포함 설정
const api = axios.create({
  withCredentials: true,
});

api.isAuthenticated = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  return !!accessToken;
};

api.login = (token) => {
  sessionStorage.setItem("accessToken", token);
};

api.logout = () => {
  sessionStorage.removeItem("accessToken");
};

//request 인터셉터: 모든 요청 헤더에 Access Token 추가
api.interceptors.request.use((config) => {
  // sessionStorage에서 토큰을 가져옴
  const accessToken = sessionStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

//response 인터셉터: 401 에러 발생 시 토큰 재발급 로직
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401 에러이고, 토큰 재발급을 시도한 적이 없다면
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh Token으로 새로운 Access Token 요청
        const res = await api.post("/api/auth/refresh-token");
        const newAccessToken = res.data.accessToken;
        // 새로운 Access Token을 sessionStorage에 저장
        sessionStorage.setItem("accessToken", newAccessToken);
        // 실패했던 원래 요청의 헤더를 수정하고 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token 재발급 실패 시, 로그아웃 처리
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login"; // 로그인 페이지로 리다이렉트
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;