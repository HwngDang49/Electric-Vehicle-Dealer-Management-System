import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Contract API Service
 * Handles all contract-related API calls
 */
const contractApiService = {
  /**
   * Create a new contract
   * @param {Object} contractData - Contract data
   * @returns {Promise<Object>}
   */
  async createContract(contractData) {
    try {
      const response = await apiClient.post("/contracts", contractData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Sign a contract
   * @param {string|number} contractId - Contract ID
   * @param {Object} signatureData - Signature data
   * @returns {Promise<Object>}
   */
  async signContract(contractId, signatureData) {
    try {
      const response = await apiClient.patch(`/contracts/${contractId}/sign`, signatureData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get contract by ID
   * @param {string|number} contractId - Contract ID
   * @returns {Promise<Object>}
   */
  async getContractById(contractId) {
    try {
      const response = await apiClient.get(`/contracts/${contractId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get contracts list
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getContracts(params = {}) {
    try {
      const response = await apiClient.get("/contracts", { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update contract
   * @param {string|number} contractId - Contract ID
   * @param {Object} contractData - Updated contract data
   * @returns {Promise<Object>}
   */
  async updateContract(contractId, contractData) {
    try {
      const response = await apiClient.put(`/contracts/${contractId}`, contractData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete contract
   * @param {string|number} contractId - Contract ID
   * @returns {Promise<Object>}
   */
  async deleteContract(contractId) {
    try {
      const response = await apiClient.delete(`/contracts/${contractId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default contractApiService;
