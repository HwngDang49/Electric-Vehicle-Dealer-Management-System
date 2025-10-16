import apiClient from './api';

// Authentication service for managing user authentication state
class AuthService {
  // Login method that calls the backend JWT endpoint
  async login(email, password) {
    try {
      const response = await apiClient.post('/users/login/Login-jwt', {
        email,
        password
      });
      
      const token = response.data;
      
      // Decode JWT token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      // Store authentication data
      this.setAuthData(token, userRole);
      
      return { role: userRole };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      } else {
        throw new Error('Login failed. Please try again.');
      }
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
