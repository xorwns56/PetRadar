import { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const toggleSidebar = () => setIsActive((prev) => !prev);
  const location = useLocation(); //url 경로 정보

  useEffect(() => {
    setIsActive(false); // 경로가 바뀔 때마다 사이드바 닫힘
  }, [location.pathname]);

  return <SidebarContext.Provider value={{ isActive, toggleSidebar }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
