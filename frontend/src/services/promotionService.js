// Promotion Management API Service
import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Promotion Management API Service
 * Contains all API calls related to promotion management
 */
class PromotionService {
  /**
   * Get all promotions
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getPromotions(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `/admin/promotions?${queryString}`
        : `/admin/promotions`;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get promotion by ID
   * @param {string|number} id - Promotion ID
   * @returns {Promise<Object>}
   */
  async getPromotionById(id) {
    try {
      const url = `/admin/promotions/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new promotion
   * @param {Object} promotionData - Promotion data
   * @returns {Promise<Object>}
   */
  async createPromotion(promotionData) {
    try {
      const url = `/admin/promotions`;
      const response = await apiClient.post(url, promotionData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update promotion (only when status = Draft)
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updatePromotion(id, updateData) {
    try {
      const url = `/admin/promotions/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update promotion status
   * @param {string|number} id
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  async updatePromotionStatus(id, status) {
    try {
      const url = `/admin/promotions/${id}/status`;
      const response = await apiClient.patch(url, { status });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete promotion
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deletePromotion(id) {
    try {
      const url = `/admin/promotions/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search promotions
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchPromotions(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getPromotions(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const promotionService = new PromotionService();
export default promotionService;

