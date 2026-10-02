import React, { createContext, useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { onUnauthorized } from "../api/client";
import { logout as logoutRequest } from "../api/auth";
import { NOTIFICATION_STREAM_URL } from "../api/notification";

/**
 * 스트림이 영구히 닫혔을 때 다시 붙기까지의 간격과 시도 횟수.
 *
 * EventSource는 네트워크가 끊긴 경우엔 알아서 다시 붙지만, 응답이 200이 아니면
 * 규격상 재연결을 **포기한다**. 배포 중에 잠깐 502가 나는 경우가 그에 해당해서,
 * 그때만 직접 몇 번 더 두드린다. 끝까지 실패하면 포기한다 — 로그아웃된 상태라면
 * 영원히 두드리게 되고, 알림 목록은 어차피 REST로 받아오므로 화면은 멀쩡하다
 */
const RETRY_DELAY_MS = 10_000;
const MAX_RETRIES = 5;

// AuthContext 생성
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("accessToken"));

    /**
     * 스트림이 열린 횟수. 재연결될 때마다 늘어난다.
     *
     * 끊긴 사이에 온 알림은 스트림으로 다시 오지 않으므로(서버가 재전송하지 않는다)
     * 받는 쪽이 이 값을 보고 목록을 다시 받아온다. 알림의 진실은 DB에 있다
     */
    const [streamEpoch, setStreamEpoch] = useState(0);

    // 구독자 목록은 ref에 둔다. state로 두면 구독할 때마다 Provider가 다시 그려진다
    const handlersRef = useRef(new Set());

    // 로그인 함수
    const login = (token) => {
        sessionStorage.setItem("accessToken", token);
        setIsAuthenticated(true);
    };

    // 로그아웃 함수
    const logout = useCallback(() => {
        logoutRequest()
            .catch(() => { /* 서버 정리에 실패해도 클라이언트 세션은 종료한다 */ })
            .finally(() => {
                sessionStorage.removeItem("accessToken");
                setIsAuthenticated(false);
                navigate("/login");
            });
    }, [navigate]);

    // userId 추출
    const userId = useMemo(() => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return -1;
        try {
            const decoded = jwtDecode(token);
            return Number(decoded.sub) || -1;
        } catch (e) {
            console.error("JWT decode 실패:", e);
            return -1;
        }
    }, [isAuthenticated]);

    // 토큰이 만료되면(401) 로그아웃시킨다.
    // 인스턴스 자체와 나머지 인터셉터는 api/client.js에 있고, 여기서는
    // "로그아웃이 무엇인지"를 아는 이 처리만 붙인다
    useEffect(() => onUnauthorized(logout), [logout]);

    /**
     * 알림 구독. 등록한 핸들러를 떼는 함수를 돌려준다.
     *
     * 의존성이 없어 호출마다 같은 함수다 — 받는 쪽 effect가 이것 때문에 다시 돌지 않는다
     */
    const onNotification = useCallback((handler) => {
        handlersRef.current.add(handler);
        return () => handlersRef.current.delete(handler);
    }, []);

    // 로그인 상태면 알림 스트림에 붙는다 (새로고침 포함).
    // 토큰을 URL에 싣지 않는다 — 인증은 HttpOnly 쿠키가 자동으로 실려 처리된다
    useEffect(() => {
        if (!isAuthenticated) return;

        let source = null;
        let retries = 0;
        let retryTimer = null;

        const connect = () => {
            source = new EventSource(NOTIFICATION_STREAM_URL);

            source.onopen = () => {
                retries = 0;
                setStreamEpoch((epoch) => epoch + 1);
            };

            source.addEventListener("notification", (event) => {
                const notification = JSON.parse(event.data);
                handlersRef.current.forEach((handler) => handler(notification));
            });

            source.onerror = () => {
                // 아직 CONNECTING이면 EventSource가 스스로 다시 붙는 중이다. 건드리지 않는다
                if (source.readyState !== EventSource.CLOSED) return;
                if (retries >= MAX_RETRIES) return;
                retries += 1;
                retryTimer = setTimeout(connect, RETRY_DELAY_MS);
            };
        };

        connect();
        return () => {
            clearTimeout(retryTimer);
            source?.close();
        };
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, onNotification, streamEpoch }}>
            {children}
        </AuthContext.Provider>
    );
};
