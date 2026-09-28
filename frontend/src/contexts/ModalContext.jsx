import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ModalContext = createContext();

/**
 * 열린 모달이 하나뿐이라는 전제로 두는 전역 스위치.
 *
 * toggleModal만 있던 때는 모달을 연 채 다른 화면으로 넘어가면 isActive가
 * true로 남았다. 모달 자체는 화면과 함께 사라지는데 스위치만 켜져 있어,
 * 다음 화면에서 무언가를 누르면 toggle이 "열기"가 아니라 "닫기"로 동작해
 * 아무 반응이 없는 것처럼 보였다.
 *
 * 그래서 두 가지를 둔다.
 *   - openModal / closeModal : 지금 무엇을 하려는지 분명히 적는다
 *   - 경로가 바뀌면 자동으로 끈다 : 넘어간 화면에 스위치를 물려주지 않는다
 */
export const ModalProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setIsActive(false);
  }, [pathname]);

  const openModal = () => setIsActive(true);
  const closeModal = () => setIsActive(false);
  const toggleModal = () => setIsActive((prev) => !prev);

  return (
    <ModalContext.Provider
      value={{ isActive, openModal, closeModal, toggleModal }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
