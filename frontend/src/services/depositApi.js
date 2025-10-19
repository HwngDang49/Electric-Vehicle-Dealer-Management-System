// Deposit Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Deposit Management API Service
 * Contains all API calls related to deposit management
 */
class DepositApiService {
  /**
   * Add deposit to an order
   * @param {string|number} orderId - Order ID
   * @param {Object} depositData - Deposit data
   * @returns {Promise<Object>} - API response
   */
  async addDeposit(orderId, depositData) {
    try {
      const url = API_ENDPOINTS.DEPOSITS.ADD(orderId);
      const response = await apiClient.post(url, depositData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get deposits for an order
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} - API response
   */
  async getDepositsByOrder(orderId) {
    try {
      const url = API_ENDPOINTS.DEPOSITS.GET_BY_ORDER(orderId);
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const depositApiService = new DepositApiService();
export default depositApiService;
