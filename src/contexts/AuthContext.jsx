import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// AuthContext 생성
const AuthContext = createContext();

/**
 * useAuth 커스텀 훅
 * AuthContext를 사용하여 인증 상태와 함수에 접근합니다.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * AuthProvider 컴포넌트
 * 자식 컴포넌트들에게 인증 상태, 로그인/로그아웃 함수, API 인스턴스를 제공합니다.
 */
export const AuthProvider = ({ children }) => {
    // sessionStorage에서 accessToken과 userId를 초기 상태로 설정
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('accessToken'));
    const [userId, setUserId] = useState(Number(sessionStorage.getItem('userId')) || -1);
    const navigate = useNavigate();

    /**
     * 로그인 함수
     * 토큰과 사용자 ID를 sessionStorage에 저장하고 상태를 업데이트합니다.
     * @param {string} token - 서버로부터 받은 JWT 토큰
     * @param {string} id - 서버로부터 받은 사용자 ID
     */
    const login = (token, id) => {
        sessionStorage.setItem('accessToken', token);
        sessionStorage.setItem('userId', id);
        setIsAuthenticated(true);
        setUserId(id);
    };

    /**
     * 로그아웃 함수
     * sessionStorage에서 토큰과 ID를 삭제하고 상태를 업데이트한 후 로그인 페이지로 이동합니다.
     */
    const logout = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userId');
        setIsAuthenticated(false);
        setUserId(-1);
        navigate('/login');
    };

    /**
     * axios API 인스턴스 생성 및 설정
     * useMemo를 사용하여 인스턴스가 한 번만 생성되도록 합니다.
     * 요청 시 토큰을 헤더에 추가하고, 응답 시 토큰을 갱신하거나 401 에러를 처리합니다.
     */
    const api = useMemo(() => {
        const instance = axios.create({ withCredentials: true });

        // 요청 인터셉터: 모든 요청에 Authorization 헤더를 추가
        instance.interceptors.request.use((config) => {
            const accessToken = sessionStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        });

        // 응답 인터셉터: 401 Unauthorized 에러 처리
        instance.interceptors.response.use(
            (response) => {
                const newAccessToken = response.headers.authorization;
                if (newAccessToken) {
                    console.log("새 토큰 등록");
                    sessionStorage.setItem('accessToken', newAccessToken);
                }
                return response;
            },
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.error("401 Unauthorized: Logging out due to invalid or expired token.");
                    logout();
                }
                return Promise.reject(error);
            }
        );
        // logout 함수가 변경될 때마다 api 인스턴스를 재생성합니다.
        return instance;
    }, []);

    // AuthContext의 값
    const value = { isAuthenticated, userId, login, logout, api };

    // 컴포넌트 마운트 시, 인증 상태를 한번 더 확인합니다.
    useEffect(() => {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken && isAuthenticated) {
            setIsAuthenticated(false);
            setUserId(-1);
        }
    }, [isAuthenticated]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
