// Delivery Schedule API Service
import apiClient from "./api";
import { API_ENDPOINTS, DELIVERY_STATUS } from "./constants";
import {
  handleApiResponse,
  handleApiError,
  validateRequiredFields,
  formatDateForApi,
} from "./utils";

/**
 * Delivery Schedule API Service
 * Contains all API calls related to delivery schedule management
 */
class DeliveryApiService {
  /**
   * Get all delivery schedules
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getDeliverySchedules(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.DELIVERY_SCHEDULES.LIST}?${queryString}`
        : API_ENDPOINTS.DELIVERY_SCHEDULES.LIST;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get delivery schedule by ID
   * @param {string} id - Delivery schedule ID
   * @returns {Promise<Object>} - API response
   */
  async getDeliveryScheduleById(id) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DELIVERY_SCHEDULES.GET_BY_ID(id)
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get delivery schedule by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - API response
   */
  async getDeliveryScheduleByOrder(orderId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DELIVERY_SCHEDULES.GET_BY_ORDER(orderId)
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new delivery schedule
   * @param {Object} deliveryData - Delivery schedule data
   * @returns {Promise<Object>} - API response
   */
  async createDeliverySchedule(deliveryData) {
    try {
      // Validate required fields
      const requiredFields = [
        "orderId",
        "deliveryPlace",
        "deliveryTime",
        "deliveryStaff",
      ];
      const validation = validateRequiredFields(deliveryData, requiredFields);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Format data for API
      const formattedData = {
        ...deliveryData,
        deliveryTime: formatDateForApi(deliveryData.deliveryTime),
        status: DELIVERY_STATUS.SCHEDULED,
        createdAt: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_ENDPOINTS.DELIVERY_SCHEDULES.CREATE,
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update delivery schedule
   * @param {string} id - Delivery schedule ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - API response
   */
  async updateDeliverySchedule(id, updateData) {
    try {
      const formattedData = {
        ...updateData,
        deliveryTime: updateData.deliveryTime
          ? formatDateForApi(updateData.deliveryTime)
          : undefined,
        updatedAt: new Date().toISOString(),
      };

      const response = await apiClient.put(
        API_ENDPOINTS.DELIVERY_SCHEDULES.UPDATE(id),
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete delivery schedule
   * @param {string} id - Delivery schedule ID
   * @returns {Promise<Object>} - API response
   */
  async deleteDeliverySchedule(id) {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.DELIVERY_SCHEDULES.DELETE(id)
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update delivery status
   * @param {string} id - Delivery schedule ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data for status update
   * @returns {Promise<Object>} - API response
   */
  async updateDeliveryStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        statusUpdatedAt: new Date().toISOString(),
        ...additionalData,
      };

      const response = await apiClient.patch(
        API_ENDPOINTS.DELIVERY_SCHEDULES.UPDATE_STATUS(id),
        updateData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Schedule delivery
   * @param {string} id - Delivery schedule ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} - API response
   */
  async scheduleDelivery(id, scheduleData) {
    try {
      const requiredFields = ["deliveryPlace", "deliveryTime", "deliveryStaff"];
      const validation = validateRequiredFields(scheduleData, requiredFields);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const formattedData = {
        ...scheduleData,
        deliveryTime: formatDateForApi(scheduleData.deliveryTime),
        status: DELIVERY_STATUS.SCHEDULED,
        scheduledAt: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_ENDPOINTS.DELIVERY_SCHEDULES.SCHEDULE_DELIVERY(id),
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Mark delivery as delivered
   * @param {string} id - Delivery schedule ID
   * @param {Object} deliveryData - Delivery completion data
   * @returns {Promise<Object>} - API response
   */
  async markAsDelivered(id, deliveryData = {}) {
    try {
      const updateData = {
        status: DELIVERY_STATUS.DELIVERED,
        deliveredAt: new Date().toISOString(),
        ...deliveryData,
      };

      const response = await apiClient.post(
        API_ENDPOINTS.DELIVERY_SCHEDULES.MARK_DELIVERED(id),
        updateData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get delivery statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getDeliveryStatistics(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.REPORTS.DELIVERY_SUMMARY}?${queryString}`
        : API_ENDPOINTS.REPORTS.DELIVERY_SUMMARY;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search delivery schedules
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async searchDeliverySchedules(searchTerm, filters = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        ...filters,
      };

      const queryString = new URLSearchParams(searchParams).toString();
      const response = await apiClient.get(
        `${API_ENDPOINTS.DELIVERY_SCHEDULES.LIST}?${queryString}`
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get delivery schedules by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} additionalFilters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async getDeliverySchedulesByDateRange(
    startDate,
    endDate,
    additionalFilters = {}
  ) {
    try {
      const filters = {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        ...additionalFilters,
      };

      return await this.getDeliverySchedules(filters);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export singleton instance
const deliveryApiService = new DeliveryApiService();
export default deliveryApiService;
