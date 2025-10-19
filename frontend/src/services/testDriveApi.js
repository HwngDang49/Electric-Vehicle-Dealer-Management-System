import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Test Drive API Service
 * Handles all test drive-related API calls
 */
const testDriveApiService = {
  /**
   * Get test drives list
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getTestDrives(params = {}) {
    try {
      const response = await apiClient.get("/test-drives", { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new test drive
   * @param {Object} testDriveData - Test drive data
   * @returns {Promise<Object>}
   */
  async createTestDrive(testDriveData) {
    try {
      const response = await apiClient.post("/test-drives", testDriveData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get test drive by ID
   * @param {string|number} testDriveId - Test drive ID
   * @returns {Promise<Object>}
   */
  async getTestDriveById(testDriveId) {
    try {
      const response = await apiClient.get(`/test-drives/${testDriveId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update test drive
   * @param {string|number} testDriveId - Test drive ID
   * @param {Object} testDriveData - Updated test drive data
   * @returns {Promise<Object>}
   */
  async updateTestDrive(testDriveId, testDriveData) {
    try {
      const response = await apiClient.put(`/test-drives/${testDriveId}`, testDriveData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete test drive
   * @param {string|number} testDriveId - Test drive ID
   * @returns {Promise<Object>}
   */
  async deleteTestDrive(testDriveId) {
    try {
      const response = await apiClient.delete(`/test-drives/${testDriveId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Schedule a test drive
   * @param {string|number} testDriveId - Test drive ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>}
   */
  async scheduleTestDrive(testDriveId, scheduleData) {
    try {
      const response = await apiClient.patch(`/test-drives/${testDriveId}/schedule`, scheduleData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Complete a test drive
   * @param {string|number} testDriveId - Test drive ID
   * @param {Object} completionData - Completion data
   * @returns {Promise<Object>}
   */
  async completeTestDrive(testDriveId, completionData) {
    try {
      const response = await apiClient.patch(`/test-drives/${testDriveId}/complete`, completionData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default testDriveApiService;
