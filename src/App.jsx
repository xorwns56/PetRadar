import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPage from "./pages/MyPage";

import MissingReport from "./pages/MissingReport";
import MissingDeclaration from "./pages/MissingDeclaration";
import MissingList from "./pages/MissingList";

import ShelterList from "./pages/ShelterList";
import ShelterAnimalList from "./pages/ShelterAnimalList";
import NotFound from "./pages/NotFound";
import SideBar from "./components/SideBar";

import { SidebarProvider } from "./hooks/SidebarContext";
import { UserProvider } from "./contexts/UserContext";
import { ModalProvider } from "./hooks/ModalContext";
import { ReportProvider } from "./contexts/ReportContext";
import { MissingProvider } from "./contexts/MissingContext";

function App() {
  return (
    <>
      <UserProvider>
        <MissingProvider>
          <ReportProvider>
            <BrowserRouter>
              <SidebarProvider>
                <SideBar />
                <ModalProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/myPage" element={<MyPage />} />
                    <Route path="/missingList" element={<MissingList />} />
                    <Route path="/shelterList" element={<ShelterList />} />
                    <Route
                      path="/shelter/:name/:addr"
                      element={<ShelterAnimalList />}
                    />

                    <Route
                      path="/missingDeclaration"
                      element={<MissingDeclaration />}
                    />
                    <Route
                      path="/missingReport/:petMissingId"
                      element={<MissingReport />}
                    />

                    <Route path="/*" element={<NotFound />} />
                  </Routes>
                </ModalProvider>
              </SidebarProvider>
            </BrowserRouter>
          </ReportProvider>
        </MissingProvider>
      </UserProvider>
    </>
  );
}

export default App;
