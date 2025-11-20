import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import DealerStaffPage from "./pages/DealerStaffPage/DealerStaffPage";
import DealerManagerPage from "./pages/DealerManagerPage/DealerManagerPage";
import EVMStaffPage from "./pages/EVMStaffPage/EVMStaffPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import UnauthorizedPage from "./pages/UnauthorizedPage/UnauthorizedPage";
import VNPayReturnPage from "./pages/VNPayReturnPage/VNPayReturnPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./contexts/ToastProvider";
import "./App.css";

function App() {
  const getDefaultRoute = () => {
    return "/dealerStaff";
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes => này sử dụng route tới login page*/}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Dealer Staff => này sử dụng route tới dealer staff page/ chặn người dùng truy cập endpoint trên url*/}
          <Route
            path="/dealerStaff"
            element={
              <ProtectedRoute allowedRoles={["DealerStaff"]}>
                <DealerStaffPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Dealer Manager => này sử dụng route tới dealer manager page/ chặn người dùng truy cập endpoint trên url*/}
          <Route
            path="/dealerManager"
            element={
              <ProtectedRoute allowedRoles={["DealerManager"]}>
                <DealerManagerPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - EVM Staff => này sử dụng route tới evm staff page/ chặn người dùng truy cập endpoint trên url*/}
          <Route
            path="/evmStaff"
            element={
              <ProtectedRoute allowedRoles={["EVMStaff"]}>
                <EVMStaffPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin => này sử dụng route tới admin page/ chặn người dùng truy cập endpoint trên url*/}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized Route => này sử dụng route tới unauthorized page/ hiển thị khi người dùng không có quyền truy cập endpoint trên url*/}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* VNPay Return Route */}
          <Route path="/vnpay-return" element={<VNPayReturnPage />} />

          {/* Default Route => này sử dụng route tới default page/ hiển thị khi người dùng truy cập endpoint trên url không tồn tại*/}
          <Route
            path="/"
            element={<Navigate to={getDefaultRoute()} replace />}
          />

          {/* Catch all - redirect to default => này sử dụng route tới default page/ hiển thị khi người dùng truy cập endpoint trên url không tồn tại*/}
          <Route
            path="*"
            element={<Navigate to={getDefaultRoute()} replace />}
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
