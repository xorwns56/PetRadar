import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserInfo from "./pages/UserInfo";
import MissingReport from "./pages/MissingReport";
import WitnessList from "./pages/WitnessList";
import ShelterInfo from "./pages/ShelterInfo";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/userInfo" element={<UserInfo />} />
          <Route path="/missingReport" element={<MissingReport />} />
          <Route path="/witnessList" element={<WitnessList />} />
          <Route path="/shelterInfo" element={<ShelterInfo />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
