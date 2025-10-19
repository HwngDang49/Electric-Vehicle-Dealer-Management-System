// Test Drive Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Test Drive Management API Service
 * Contains all API calls related to test drive management
 */
class TestDriveApiService {
  /**
   * Get all test drives
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getTestDrives(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.TEST_DRIVES.LIST}?${queryString}`
        : API_ENDPOINTS.TEST_DRIVES.LIST;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get test drive by ID
   * @param {string|number} id - Test Drive ID
   * @returns {Promise<Object>} - API response
   */
  async getTestDriveById(id) {
    try {
      const url = API_ENDPOINTS.TEST_DRIVES.GET_BY_ID(id);
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new test drive
   * @param {Object} testDriveData - Test Drive data
   * @returns {Promise<Object>} - API response
   */
  async createTestDrive(testDriveData) {
    try {
      const url = API_ENDPOINTS.TEST_DRIVES.CREATE;
      const response = await apiClient.post(url, testDriveData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update test drive
   * @param {string|number} id - Test Drive ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - API response
   */
  async updateTestDrive(id, updateData) {
    try {
      const url = API_ENDPOINTS.TEST_DRIVES.UPDATE(id);
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete test drive
   * @param {string|number} id - Test Drive ID
   * @returns {Promise<Object>} - API response
   */
  async deleteTestDrive(id) {
    try {
      const url = API_ENDPOINTS.TEST_DRIVES.DELETE(id);
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Schedule test drive
   * @param {string|number} id - Test Drive ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} - API response
   */
  async scheduleTestDrive(id, scheduleData) {
    try {
      const url = API_ENDPOINTS.TEST_DRIVES.SCHEDULE(id);
      const response = await apiClient.post(url, scheduleData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Complete test drive
   * @param {string|number} id - Test Drive ID
   * @param {Object} completionData - Completion data
   * @returns {Promise<Object>} - API response
   */
  async completeTestDrive(id, completionData = {}) {
    try {
      const url = API_ENDPOINTS.TEST_DRIVES.COMPLETE(id);
      const response = await apiClient.post(url, completionData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search test drives
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async searchTestDrives(searchTerm, filters = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        ...filters,
      };

      return await this.getTestDrives(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const testDriveApiService = new TestDriveApiService();
export default testDriveApiService;
