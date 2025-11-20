// Order Statistics API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Order Statistics API Service
 * Contains API calls related to order statistics for admin dashboard
 */
class OrderStatisticsApiService {
  /**
   * Get order statistics by dealer for a specific period
   * @param {Object} params - Query parameters
   * @param {string} params.period - "month" or "quarter"
   * @param {number} params.year - Year (optional, defaults to current year)
   * @param {number} params.month - Month (1-12, optional, defaults to current month)
   * @param {number} params.quarter - Quarter (1-4, optional, defaults to current quarter)
   * @returns {Promise<Object>} - API response with statistics
   */
  async getOrderStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) {
        queryParams.append("period", params.period);
      }
      if (params.year) {
        queryParams.append("year", params.year.toString());
      }
      if (params.month) {
        queryParams.append("month", params.month.toString());
      }
      if (params.quarter) {
        queryParams.append("quarter", params.quarter.toString());
      }

      const url = `${API_ENDPOINTS.ORDERS.STATISTICS}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get order statistics for current month
   * @returns {Promise<Object>} - API response with statistics
   */
  async getCurrentMonthStatistics() {
    const now = new Date();
    return this.getOrderStatistics({
      period: "month",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  }

  /**
   * Get order statistics for current quarter
   * @returns {Promise<Object>} - API response with statistics
   */
  async getCurrentQuarterStatistics() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return this.getOrderStatistics({
      period: "quarter",
      year: now.getFullYear(),
      quarter: quarter,
    });
  }

  /**
   * Get vehicle sales statistics by model for current month
   * @returns {Promise<Object>} - API response with statistics
   */
  async getVehicleSalesStatistics() {
    try {
      const url = API_ENDPOINTS.ORDERS.VEHICLE_SALES_STATISTICS;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export singleton instance
const orderStatisticsApiService = new OrderStatisticsApiService();
export default orderStatisticsApiService;

