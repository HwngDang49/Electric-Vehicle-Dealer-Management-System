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
   * @param {Object} params - Query parameters (e.g., { dealerId: 1 })
   * @returns {Promise<Object>} - API response
   */
  async getBranches(params = {}) {
    try {
      const url = API_ENDPOINTS?.BRANCHES?.LIST ?? "/branches";
      const response = await apiClient.get(url, { params });
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
      const url = API_ENDPOINTS?.BRANCHES?.GET_BY_ID?.(id) ?? `/branches/${id}`;
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
      const url = API_ENDPOINTS?.BRANCHES?.CREATE ?? "/branches/Create-Branch";
      const response = await apiClient.post(url, branchData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update branch
   * @param {string|number} id - Branch ID (used in URL only)
   * @param {Object} updateData - Update data (Code, Name, Address, Status only - no branchId, no dealerId)
   * @returns {Promise<Object>} - UpdateBranchResponse { BranchId, LastUpdatedAt }
   */
  async updateBranch(id, updateData) {
    try {
      const url = API_ENDPOINTS?.BRANCHES?.UPDATE?.(id) ?? `/branches/${id}`;
      // ✅ Backend expects only Code, Name, Address, Status in body (no branchId, no dealerId)
      const { branchId, dealerId, ...payload } = updateData;
      const response = await apiClient.put(url, payload);
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
      const url = API_ENDPOINTS?.BRANCHES?.DELETE?.(id) ?? `/branches/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const branchApiService = new BranchApiService();

export default branchApiService;
