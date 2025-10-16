import apiClient from "./api";

class AuthService {
  /**
   * Login with JWT
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, role: string}>}
   */
  async login(email, password) {
    try {
      const response = await apiClient.post("/users/login/Login-jwt", {
        email,
        password,
      });

      const token = response.data;

      // Decode JWT to get user info
      const userInfo = this.decodeToken(token);

      // Store token and user role
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", userInfo.role);
      localStorage.setItem("userId", userInfo.userId);
      localStorage.setItem("dealerId", userInfo.dealerId || "");

      return {
        token,
        role: userInfo.role,
        userId: userInfo.userId,
        dealerId: userInfo.dealerId,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Decode JWT token
   * @param {string} token
   * @returns {Object}
   */
  decodeToken(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      return {
        userId:
          payload.sub ||
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
        email:
          payload.email ||
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        role:
          payload.role ||
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
        dealerId: payload.dealer_id,
        exp: payload.exp,
      };
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    const userInfo = this.decodeToken(token);
    if (!userInfo) return false;

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return userInfo.exp > currentTime;
  }

  /**
   * Get current user role
   * @returns {string|null}
   */
  getUserRole() {
    return localStorage.getItem("userRole");
  }

  /**
   * Get current user ID
   * @returns {string|null}
   */
  getUserId() {
    return localStorage.getItem("userId");
  }

  /**
   * Get current dealer ID
   * @returns {string|null}
   */
  getDealerId() {
    return localStorage.getItem("dealerId");
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("dealerId");
  }

  /**
   * Handle API errors
   * @param {Error} error
   * @returns {Error}
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message =
        error.response.data?.message ||
        error.response.data?.title ||
        "Login failed";
      return new Error(message);
    } else if (error.request) {
      // No response from server
      return new Error("Cannot connect to server. Please try again.");
    } else {
      // Other errors
      return new Error(error.message || "An unexpected error occurred");
    }
  }
}

const authService = new AuthService();
export default authService;
