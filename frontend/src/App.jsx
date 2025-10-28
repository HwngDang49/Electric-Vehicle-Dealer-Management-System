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
import ToastContainer from "./components/shared/ToastContainer";
import "./App.css";

function App() {
  const getDefaultRoute = () => {
    return "/dealerStaff";
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Dealer Staff */}
          <Route
            path="/dealerStaff"
            element={
              <ProtectedRoute allowedRoles={["DealerStaff"]}>
                <DealerStaffPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Dealer Manager */}
          <Route
            path="/dealerManager"
            element={
              <ProtectedRoute allowedRoles={["DealerManager"]}>
                <DealerManagerPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - EVM Staff */}
          <Route
            path="/evmStaff"
            element={
              <ProtectedRoute allowedRoles={["EVMStaff"]}>
                <EVMStaffPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* VNPay Return Route (Public - no auth required) */}
          <Route path="/vnpay-return" element={<VNPayReturnPage />} />

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to={getDefaultRoute()} replace />}
          />

          {/* Catch all - redirect to default */}
          <Route
            path="*"
            element={<Navigate to={getDefaultRoute()} replace />}
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
