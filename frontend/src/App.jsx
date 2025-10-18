import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import DealerStaffPage from "./pages/DealerStaffPage/DealerStaffPage";
import DealerManagerPage from "./pages/DealerManagerPage/DealerManagerPage";
import EVMStaffPage from "./pages/EVMStaffPage/EVMStaffPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/AuthService";
import "./App.css";

function App() {
  const getDefaultRoute = () => {
    return "/dealerStaff";
  };

  return (
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
        <Route
          path="/unauthorized"
          element={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                gap: "20px",
              }}
            >
              <h1>Unauthorized Access</h1>
              <p>You don't have permission to access this page.</p>
              <button
                onClick={() => {
                  authService.logout();
                  window.location.href = "/login";
                }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#d1d1d1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Back to Login
              </button>
            </div>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* Catch all - redirect to default */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
