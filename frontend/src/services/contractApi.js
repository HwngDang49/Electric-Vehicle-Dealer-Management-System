// Contract Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Contract Management API Service
 * Contains all API calls related to contract management
 */
class ContractApiService {
  /**
   * Create contract for an order
   * @param {string|number} orderId - Order ID
   * @param {Object} contractData - Contract data
   * @returns {Promise<Object>} - API response
   */
  async createContract(orderId, contractData = {}) {
    try {
      const url = API_ENDPOINTS.CONTRACTS.CREATE(orderId);
      const response = await apiClient.post(url, contractData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Sign a contract
   * @param {string|number} contractId - Contract ID
   * @param {Object} signData - Sign data (e.g., signature, signedAt)
   * @returns {Promise<Object>} - API response
   */
  async signContract(contractId, signData = {}) {
    try {
      const url = API_ENDPOINTS.CONTRACTS.SIGN(contractId);
      const response = await apiClient.post(url, signData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get contract by ID
   * @param {string|number} contractId - Contract ID
   * @returns {Promise<Object>} - API response
   */
  async getContractById(contractId) {
    try {
      const url = API_ENDPOINTS.CONTRACTS.GET_BY_ID(contractId);
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const contractApiService = new ContractApiService();
export default contractApiService;
