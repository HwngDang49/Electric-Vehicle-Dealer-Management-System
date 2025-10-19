import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Deposit API Service
 * Handles all deposit-related API calls
 */
const depositApiService = {
  /**
   * Add deposit to an order
   * @param {Object} depositData - Deposit data
   * @returns {Promise<Object>}
   */
  async addDeposit(depositData) {
    try {
      const response = await apiClient.post("/deposits", depositData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get deposits by order ID
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>}
   */
  async getDepositsByOrder(orderId) {
    try {
      const response = await apiClient.get(`/deposits/order/${orderId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get deposit by ID
   * @param {string|number} depositId - Deposit ID
   * @returns {Promise<Object>}
   */
  async getDepositById(depositId) {
    try {
      const response = await apiClient.get(`/deposits/${depositId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update deposit
   * @param {string|number} depositId - Deposit ID
   * @param {Object} depositData - Updated deposit data
   * @returns {Promise<Object>}
   */
  async updateDeposit(depositId, depositData) {
    try {
      const response = await apiClient.put(`/deposits/${depositId}`, depositData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete deposit
   * @param {string|number} depositId - Deposit ID
   * @returns {Promise<Object>}
   */
  async deleteDeposit(depositId) {
    try {
      const response = await apiClient.delete(`/deposits/${depositId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default depositApiService;
