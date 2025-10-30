import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/AuthService";

/**
 * Custom hook for handling logout functionality
 * Centralizes logout logic to avoid duplication and improve maintainability
 *
 * @returns {Function} handleLogout - Function to execute logout
 *
 * @example
 * const handleLogout = useLogout();
 *
 * // In a button click handler:
 * <button onClick={handleLogout}>Logout</button>
 */
const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    // Clear authentication data from localStorage
    authService.logout();

    // Navigate to login page
    navigate("/login");
  }, [navigate]);

  return handleLogout;
};

export default useLogout;
