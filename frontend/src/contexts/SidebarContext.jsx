import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {useAuth} from "./AuthContext.jsx";
import { fetchMyNotifications } from "../api/notification";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const toggleSidebar = () => setIsActive((prev) => !prev);
  const location = useLocation(); //url 경로 정보
  const [alerts, setAlerts] = useState([]);
  const { isAuthenticated, onNotification, streamEpoch } = useAuth();

  // streamEpoch는 스트림이 열릴 때마다 바뀐다. 재연결된 뒤 목록을 다시 받아
  // 끊긴 사이에 온 알림을 메운다 — 서버는 그 구간을 재전송하지 않는다
  useEffect(() => {
    if (!isAuthenticated) {
      setAlerts([]);
      return;
    }
    fetchMyNotifications()
      .then(setAlerts)
      .catch((error) => console.error("Failed to fetch notification:", error));
  }, [isAuthenticated, streamEpoch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return onNotification((notification) => setAlerts((prev) => [notification, ...prev]));
  }, [isAuthenticated, onNotification]);

  useEffect(() => {
    setIsActive(false); // 경로가 바뀔 때마다 사이드바 닫힘
  }, [location.pathname]);

  return <SidebarContext.Provider value={{ isActive, toggleSidebar, alerts, setAlerts }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
