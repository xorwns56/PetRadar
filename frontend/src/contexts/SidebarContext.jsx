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
  const { socket, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setAlerts([]);
      return;
    }
    fetchMyNotifications()
      .then(setAlerts)
      .catch((error) => console.error("Failed to fetch notification:", error));
    if (socket) {
      const subscription = socket.subscribe("/user/queue/notification", (message) => {
        const data = JSON.parse(message.body);
        setAlerts((prev) => [data, ...prev]);
      });
      return () => subscription.unsubscribe();
    }
  }, [isAuthenticated, socket]);

  useEffect(() => {
    setIsActive(false); // 경로가 바뀔 때마다 사이드바 닫힘
  }, [location.pathname]);

  return <SidebarContext.Provider value={{ isActive, toggleSidebar, alerts, setAlerts }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
