import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import DealerStaffPage from "./pages/DealerStaffPage/DealerStaffPage";
import DealerManagerPage from "./pages/DealerManagerPage/DealerManagerPage";
import EVMStaffPage from "./pages/EVMStaffPage/EVMStaffPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dealerStaff" element={<DealerStaffPage />} />
        <Route path="/dealerManager" element={<DealerManagerPage />} />
        <Route path="/evmStaff" element={<EVMStaffPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
