import { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext.jsx";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const toggleSidebar = () => setIsActive((prev) => !prev);
  const location = useLocation(); //url 경로 정보
  const [alerts, setAlerts] = useState([]);
  const { socket, api, isAuthenticated } = useAuth();

    useEffect(() => {
        if(!isAuthenticated){
            setAlerts([]);
            return;
        }
        const fetchNotification = async () => {
            try{
                const response = await api.get("/api/notification/me");
                setAlerts(response.data);
            } catch (error) {
                console.error("Failed to fetch notification : ", error);
            }
        };
        fetchNotification();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!socket) return;
        const subscription = socket.subscribe("/user/queue/notification", (message) => {
          const data = JSON.parse(message.body);
          setAlerts(prevAlerts => [...prevAlerts, data]);
        });

        return () => {
            console.log("구독 해제");
          subscription.unsubscribe();
        };
      }, [socket]);

  useEffect(() => {
    setIsActive(false); // 경로가 바뀔 때마다 사이드바 닫힘
  }, [location.pathname]);
////
  return <SidebarContext.Provider value={{ isActive, toggleSidebar, alerts }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
