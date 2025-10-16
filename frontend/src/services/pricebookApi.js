// Pricebook Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Pricebook Management API Service
 * Contains all API calls related to pricebook management
 */
class PricebookApiService {
  /**
   * Get all pricebooks
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getPricebooks(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${
            API_ENDPOINTS?.PRICEBOOKS?.LIST ?? "/api/pricebooks"
          }?${queryString}`
        : API_ENDPOINTS?.PRICEBOOKS?.LIST ?? "/api/pricebooks";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get pricebook by ID
   * @param {string|number} id - Pricebook ID
   * @returns {Promise<Object>}
   */
  async getPricebookById(id) {
    try {
      const url =
        API_ENDPOINTS?.PRICEBOOKS?.GET_BY_ID?.(id) ?? `/api/pricebooks/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new pricebook
   * @param {Object} pricebookData - Pricebook data
   * @returns {Promise<Object>}
   */
  async createPricebook(pricebookData) {
    try {
      const url = API_ENDPOINTS?.PRICEBOOKS?.CREATE ?? "/api/pricebooks";
      const response = await apiClient.post(url, pricebookData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update pricebook
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updatePricebook(id, updateData) {
    try {
      const url =
        API_ENDPOINTS?.PRICEBOOKS?.UPDATE?.(id) ?? `/api/pricebooks/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete pricebook
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deletePricebook(id) {
    try {
      const url =
        API_ENDPOINTS?.PRICEBOOKS?.DELETE?.(id) ?? `/api/pricebooks/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search pricebooks
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchPricebooks(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getPricebooks(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const pricebookApiService = new PricebookApiService();
export default pricebookApiService;
