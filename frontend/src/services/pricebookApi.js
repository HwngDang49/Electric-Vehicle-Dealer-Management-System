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
   * Get active pricebook (current effective and status Active)
   * @returns {Promise<Object>} - API response
   */
  async getActivePricebook() {
    try {
      const url = "/pricebooks/active"; // baseURL already contains /api
      const response = await apiClient.get(url);
      console.log("Active pricebook raw:", response?.data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
  /**
   * Get all pricebooks
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getPricebooks(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `/admin/pricebooks?${queryString}`
        : `/admin/pricebooks`;

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
      const url = `/admin/pricebooks/${id}`;
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
      const url = `/admin/pricebooks`;
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
      const url = `/admin/pricebooks/${id}`;
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
      const url = `/admin/pricebooks/${id}`;
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

  /**
   * Get pricebook items
   * @param {string|number} pricebookId
   * @returns {Promise<Object>}
   */
  async getPricebookItems(pricebookId) {
    try {
      const url = `/admin/pricebooks/${pricebookId}/items`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Add item to pricebook
   * @param {string|number} pricebookId
   * @param {Object} item - Item data (productId, msrpPrice, floorPrice)
   * @returns {Promise<Object>}
   */
  async addItem(pricebookId, item) {
    try {
      const url = `/admin/pricebooks/${pricebookId}/items`;
      const response = await apiClient.post(url, item);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Remove item from pricebook
   * @param {string|number} pricebookId
   * @param {string|number} itemId
   * @returns {Promise<Object>}
   */
  async removeItem(pricebookId, itemId) {
    try {
      const url = `/admin/pricebooks/${pricebookId}/items/${itemId}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const pricebookApiService = new PricebookApiService();
export default pricebookApiService;
