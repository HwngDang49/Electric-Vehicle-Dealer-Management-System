// Role-Based API Service
// Intelligently routes API calls based on user role and combines related data
import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Role-Based API Service
 * Automatically selects the correct API endpoints based on user role
 */
class RoleBasedApiService {
  constructor() {
    this.userRole = this.getUserRole();
  }

  /**
   * Get current user role from localStorage
   * @returns {string} - User role (Admin, DealerManager, etc.)
   */
  getUserRole() {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.role || "DealerManager"; // Default role
      }
      return "DealerManager"; // Default fallback
    } catch (error) {
      console.warn(
        "Could not parse user role, defaulting to DealerManager:",
        error
      );
      return "DealerManager";
    }
  }

  /**
   * Get products based on user role
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - API response
   */
  async getProducts(options = {}) {
    try {
      let url;

      if (this.userRole === "Admin") {
        // Admin can see all products
        url = "/admin/products/all";
      } else {
        // Other roles get standard product list
        url = "/product/list";
      }

      console.log(`🔄 [${this.userRole}] Fetching products from: ${url}`);
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ [${this.userRole}] Error fetching products:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Format price for display
   * @param {number} price - Price to format
   * @returns {string} - Formatted price
   */
  formatPrice(price) {
    if (!price || price === 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }
}

// Create and export singleton instance
const roleBasedApiService = new RoleBasedApiService();
export default roleBasedApiService;
