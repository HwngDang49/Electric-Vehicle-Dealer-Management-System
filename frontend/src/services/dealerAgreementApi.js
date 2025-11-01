// Dealer Agreement Management API Service
import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Dealer Agreement Management API Service
 * Contains all API calls related to dealer agreement management
 */
class DealerAgreementApiService {
  /**
   * Get list of dealer agreements
   * @param {Object} filters - Filter parameters (dealerId, status, page, pageSize)
   * @returns {Promise<Object>} - API response
   */
  async getDealerAgreements(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `/dealer-agreements?${queryString}`
        : `/dealer-agreements`;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get dealer agreement by ID
   * @param {string|number} id - Agreement ID
   * @returns {Promise<Object>}
   */
  async getDealerAgreementById(id) {
    try {
      const url = `/dealer-agreements/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new dealer agreement
   * @param {Object} agreementData - Agreement data
   * @returns {Promise<Object>}
   */
  async createDealerAgreement(agreementData) {
    try {
      const url = `/dealer-agreements`;
      const response = await apiClient.post(url, agreementData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update dealer agreement
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateDealerAgreement(id, updateData) {
    try {
      const url = `/dealer-agreements/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Close dealer agreement (set status to Expired)
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async closeDealerAgreement(id) {
    try {
      const url = `/dealer-agreements/${id}/close`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get rebate tiers for an agreement
   * @param {string|number} agreementId
   * @param {string} period - Optional period filter
   * @returns {Promise<Object>}
   */
  async getRebateTiers(agreementId, period = null) {
    try {
      const url = period
        ? `/dealer-agreements/${agreementId}/rebates?period=${period}`
        : `/dealer-agreements/${agreementId}/rebates`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create rebate tier
   * @param {string|number} agreementId
   * @param {Object} rebateData - Rebate tier data
   * @returns {Promise<Object>}
   */
  async createRebateTier(agreementId, rebateData) {
    try {
      const url = `/dealer-agreements/${agreementId}/rebates`;
      const response = await apiClient.post(url, rebateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update rebate tier
   * @param {string|number} agreementId
   * @param {string|number} rebateId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateRebateTier(agreementId, rebateId, updateData) {
    try {
      const url = `/dealer-agreements/${agreementId}/rebates/${rebateId}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const dealerAgreementApiService = new DealerAgreementApiService();
export default dealerAgreementApiService;


