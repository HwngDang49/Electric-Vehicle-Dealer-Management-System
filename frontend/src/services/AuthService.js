import apiClient from "./api";
import { decodeJWT, getUserInfoFromToken } from "../utils/jwtDecoder";

// Authentication service for managing user authentication state
class AuthService {
  // Login method that calls the backend JWT endpoint
  async login(email, password) {
    try {
      const response = await apiClient.post("/users/login/Login-jwt", {
        email,
        password,
      });

      const token = response.data;

      // Decode JWT token to get user role with proper UTF-8 handling
      const userInfo = getUserInfoFromToken(token);
      const userRole = userInfo.role;

      // Store authentication data
      this.setAuthData(token, userRole);

      return {
        success: true,
        token,
        role: userRole,
        userId: userInfo.userId,
      };
    } catch (error) {
      // Handle different error response formats
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle 401 Unauthorized
        if (status === 401) {
          throw new Error("Invalid email or password");
        }
        
        // Handle error messages from backend
        let errorMessage = null;
        
        // Case 1: data is a string (direct error message)
        if (typeof data === 'string') {
          errorMessage = data;
        }
        // Case 2: data is an array (array of error messages)
        else if (Array.isArray(data)) {
          errorMessage = data[0] || "Login failed";
        }
        // Case 3: data is an object
        else if (data && typeof data === 'object') {
          // Check for errors array
          if (Array.isArray(data.errors)) {
            errorMessage = data.errors[0];
          }
          // Check for errors object (dictionary format)
          else if (data.errors && typeof data.errors === 'object') {
            const allMessages = Object.values(data.errors).flat();
            errorMessage = allMessages[0];
          }
          // Check for message field
          else if (data.message) {
            errorMessage = data.message;
          }
          // Check for title field
          else if (data.title) {
            errorMessage = data.title;
          }
        }
        
        // Throw error with extracted message
        if (errorMessage) {
          throw new Error(errorMessage);
        }
      }
      
      // Fallback error
      throw new Error("Login failed. Please try again.");
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  // Get user role from localStorage
  getUserRole() {
    return localStorage.getItem("userRole") || null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem("authToken");
  }

  // Set authentication data
  setAuthData(token, userRole) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", userRole);
  }

  // Clear authentication data (logout)
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userInfo");
  }

  // Get user info (if stored)
  getUserInfo() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Set user info
  setUserInfo(userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;
