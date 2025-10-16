// Branch Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Branch Management API Service
 * Contains all API calls related to branch management
 */
class BranchApiService {
  /**
   * Get all branches
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getBranches(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS?.BRANCHES?.LIST ?? "/api/branches"}?${queryString}`
        : API_ENDPOINTS?.BRANCHES?.LIST ?? "/api/branches";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get branch by ID
   * @param {string|number} id - Branch ID
   * @returns {Promise<Object>}
   */
  async getBranchById(id) {
    try {
      const url =
        API_ENDPOINTS?.BRANCHES?.GET_BY_ID?.(id) ?? `/api/branches/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new branch
   * @param {Object} branchData - Branch data
   * @returns {Promise<Object>}
   */
  async createBranch(branchData) {
    try {
      const url = API_ENDPOINTS?.BRANCHES?.CREATE ?? "/api/branches";
      const response = await apiClient.post(url, branchData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update branch
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateBranch(id, updateData) {
    try {
      const url =
        API_ENDPOINTS?.BRANCHES?.UPDATE?.(id) ?? `/api/branches/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete branch
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteBranch(id) {
    try {
      const url =
        API_ENDPOINTS?.BRANCHES?.DELETE?.(id) ?? `/api/branches/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search branches
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchBranches(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getBranches(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const branchApiService = new BranchApiService();
export default branchApiService;
