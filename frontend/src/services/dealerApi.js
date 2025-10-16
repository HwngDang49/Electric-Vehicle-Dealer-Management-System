// Dealer Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Dealer Management API Service
 * Contains all API calls related to dealer management
 */
class DealerApiService {
  /**
   * Get all dealers
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getDealers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS?.DEALERS?.LIST ?? "/api/dealers"}?${queryString}`
        : API_ENDPOINTS?.DEALERS?.LIST ?? "/api/dealers";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get dealer by ID
   * @param {string|number} id - Dealer ID
   * @returns {Promise<Object>}
   */
  async getDealerById(id) {
    try {
      const url =
        API_ENDPOINTS?.DEALERS?.GET_BY_ID?.(id) ?? `/api/dealers/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new dealer
   * @param {Object} dealerData - Dealer data
   * @returns {Promise<Object>}
   */
  async createDealer(dealerData) {
    try {
      const url = API_ENDPOINTS?.DEALERS?.CREATE ?? "/api/dealers";
      const response = await apiClient.post(url, dealerData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update dealer
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateDealer(id, updateData) {
    try {
      const url = API_ENDPOINTS?.DEALERS?.UPDATE?.(id) ?? `/api/dealers/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete dealer
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteDealer(id) {
    try {
      const url = API_ENDPOINTS?.DEALERS?.DELETE?.(id) ?? `/api/dealers/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Activate dealer
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async activateDealer(id) {
    try {
      const url =
        API_ENDPOINTS?.DEALERS?.ACTIVATE?.(id) ?? `/api/dealers/${id}/activate`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Suspend dealer
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async suspendDealer(id) {
    try {
      const url =
        API_ENDPOINTS?.DEALERS?.SUSPEND?.(id) ?? `/api/dealers/${id}/suspend`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reactivate dealer
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async reactivateDealer(id) {
    try {
      const url =
        API_ENDPOINTS?.DEALERS?.REACTIVATE?.(id) ??
        `/api/dealers/${id}/reactivate`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Close dealer
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async closeDealer(id) {
    try {
      const url =
        API_ENDPOINTS?.DEALERS?.CLOSE?.(id) ?? `/api/dealers/${id}/close`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search dealers
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchDealers(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getDealers(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const dealerApiService = new DealerApiService();
export default dealerApiService;
