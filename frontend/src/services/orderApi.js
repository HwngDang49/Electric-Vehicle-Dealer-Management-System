// Order Management API Service
import apiClient from "./api";
import { API_ENDPOINTS, ORDER_STATUS } from "./constants";
import {
  handleApiResponse,
  handleApiError,
  validateRequiredFields,
} from "./utils";

/**
 * Order Management API Service
 * Contains all API calls related to order management
 */
class OrderApiService {
  /**
   * Get all orders
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getOrders(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.ORDERS.LIST}?${queryString}`
        : API_ENDPOINTS.ORDERS.LIST;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - API response
   */
  async getOrderById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - API response
   */
  async createOrder(orderData) {
    try {
      // Validate required fields
      const requiredFields = ["customerId", "vehicleId", "amount"];
      const validation = validateRequiredFields(orderData, requiredFields);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const formattedData = {
        ...orderData,
        status: ORDER_STATUS.PENDING,
        createdAt: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.CREATE,
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - API response
   */
  async updateOrder(id, updateData) {
    try {
      const formattedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response = await apiClient.put(
        API_ENDPOINTS.ORDERS.UPDATE(id),
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data for status update
   * @returns {Promise<Object>} - API response
   */
  async updateOrderStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        statusUpdatedAt: new Date().toISOString(),
        ...additionalData,
      };

      const response = await apiClient.patch(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
        updateData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - API response
   */
  async deleteOrder(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE(id));
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get orders by customer ID
   * @param {string} customerId - Customer ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async getOrdersByCustomer(customerId, filters = {}) {
    try {
      const searchParams = {
        customerId,
        ...filters,
      };

      return await this.getOrders(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async getOrdersByStatus(status, filters = {}) {
    try {
      const searchParams = {
        status,
        ...filters,
      };

      return await this.getOrders(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search orders
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async searchOrders(searchTerm, filters = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        ...filters,
      };

      return await this.getOrders(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export singleton instance
const orderApiService = new OrderApiService();
export default orderApiService;
