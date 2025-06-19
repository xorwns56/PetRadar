import { useState, createContext, useContext } from "react";
const LoginUserContext = createContext();
export const LoginUserProvider = ({ children }) => {
  const storedId = sessionStorage.getItem("loginUserId");
  const [loginUserId, setLoginUserId] = useState(storedId ? storedId : null);
  const login = (id) => {
    setLoginUserId(id);
    sessionStorage.setItem("loginUserId", id);
  };
  const logout = () => {
    setLoginUserId(null);
    sessionStorage.removeItem("loginUserId");
  };
  return (
    <LoginUserContext.Provider value={{ loginUserId, login, logout }}>
      {children}
    </LoginUserContext.Provider>
  );
};

export const useLoginUser = () => {
  const context = useContext(LoginUserContext);
  if (context === undefined) {
    throw new Error("useLoginUser Error");
  }
  return context;
};
