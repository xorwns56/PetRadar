import { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const toggleSidebar = () => setIsActive((prev) => !prev);
  const location = useLocation(); //url 경로 정보
  const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!socket) return;
        const subscription = socket.subscribe("/user/queue/notification", (message) => {
          const data = JSON.parse(message.body);
          console.log("새 알림:", data);
          setAlerts((prev) => (prev || 0) + 1); // Update alerts in the context
        });

        return () => {
            console.log("구독 해제");
          subscription.unsubscribe();
        };
      }, [socket]);

  useEffect(() => {
    setIsActive(false); // 경로가 바뀔 때마다 사이드바 닫힘
  }, [location.pathname]);

  return <SidebarContext.Provider value={{ isActive, toggleSidebar, alerts }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
