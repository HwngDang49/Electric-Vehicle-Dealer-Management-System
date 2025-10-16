// User Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * User Management API Service
 * Contains all API calls related to user management
 */
class UserApiService {
  /**
   * Get all users
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getUsers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS?.USERS?.LIST ?? "/api/users"}?${queryString}`
        : API_ENDPOINTS?.USERS?.LIST ?? "/api/users";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get user by ID
   * @param {string|number} id - User ID
   * @returns {Promise<Object>}
   */
  async getUserById(id) {
    try {
      const url = API_ENDPOINTS?.USERS?.GET_BY_ID?.(id) ?? `/api/users/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get current user
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      const url = API_ENDPOINTS?.USERS?.CURRENT ?? "/api/users/current";
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    try {
      const url = API_ENDPOINTS?.USERS?.CREATE ?? "/api/users";
      const response = await apiClient.post(url, userData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateUser(id, updateData) {
    try {
      const url = API_ENDPOINTS?.USERS?.UPDATE?.(id) ?? `/api/users/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete user
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteUser(id) {
    try {
      const url = API_ENDPOINTS?.USERS?.DELETE?.(id) ?? `/api/users/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search users
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchUsers(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getUsers(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const userApiService = new UserApiService();
export default userApiService;
