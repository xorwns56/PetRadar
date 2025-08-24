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

// 요청 인터셉터: 모든 요청 헤더에 Access Token 추가
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

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 서버 응답 헤더에서 새 토큰이 발급되었다면
    const newAccessToken = response.headers.authorization;
    if (newAccessToken) {
      // 새로운 토큰으로 로컬 스토리지 업데이트
      sessionStorage.setItem("accessToken", newAccessToken);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
        sessionStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  }
);

export default api;