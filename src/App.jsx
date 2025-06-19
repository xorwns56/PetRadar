import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPage from "./pages/Mypage";

import MissingReport from "./pages/MissingReport";
import MissingList from "./pages/MissingList";

import ShelterList from "./pages/ShelterList";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "./hooks/SidebarContext";
import SideBar from "./components/SideBar";

import { UsersProvider } from "./contexts/UsersContext";
import { LoginUserProvider } from "./contexts/LoginUserContext";

function App() {
  return (
    <>
      <UsersProvider>
        <LoginUserProvider>
          <BrowserRouter>
               <SidebarProvider>
          <SideBar />
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/myPage" element={<MyPage />} />

              <Route path="/missingList" element={<MissingList />} />
              <Route path="/missingReport" element={<MissingReport />} />

              <Route path="/shelterList" element={<ShelterList />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
  </SidebarProvider>
          </BrowserRouter>
        </LoginUserProvider>
      </UsersProvider>
    </>
  );
}

export default App;
