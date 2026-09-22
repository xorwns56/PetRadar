import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { onUnauthorized } from "../api/client";
import { logout as logoutRequest } from "../api/auth";

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
    const [socket, setSocket] = useState(null);

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

    // 마운트 시 자동 소켓 연결 (새로고침 포함)
    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        if(!token){
            if(socket){
                socket.deactivate();
                setSocket(null);
            }
            return;
        }
        if(socket) return;
        const newSocket = new SockJS(`/api/ws?token=Bearer ${token}`);
        const stompClient = new Client({
            webSocketFactory: () => newSocket,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            //reconnectDelay: 5000, // 끊겼을 때 자동 재연결
        });

        stompClient.onConnect = () => {
            console.log("STOMP 소켓 연결됨");
            setSocket(stompClient);
        };

        stompClient.onDisconnect = () => {
            console.log("STOMP 소켓 연결 해제됨");
            setSocket(null);
        };

        stompClient.onStompError = (frame) => console.error("STOMP 오류:", frame.body);

        stompClient.activate();
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, socket }}>
            {children}
        </AuthContext.Provider>
    );
};
