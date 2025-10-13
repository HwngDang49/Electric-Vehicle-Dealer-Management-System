// Customer Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import {
  handleApiResponse,
  handleApiError,
  validateRequiredFields,
} from "./utils";

/**
 * Customer Management API Service
 * Contains all API calls related to customer management
 */
class CustomerApiService {
  /**
   * Get all customers
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getCustomers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.CUSTOMERS.LIST}?${queryString}`
        : API_ENDPOINTS.CUSTOMERS.LIST;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} - API response
   */
  async getCustomerById(id) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id)
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} - API response
   */
  async createCustomer(customerData) {
    try {
      // Validate required fields
      const requiredFields = ["name", "phone", "email"];
      const validation = validateRequiredFields(customerData, requiredFields);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const formattedData = {
        ...customerData,
        createdAt: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_ENDPOINTS.CUSTOMERS.CREATE,
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - API response
   */
  async updateCustomer(id, updateData) {
    try {
      const formattedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response = await apiClient.put(
        API_ENDPOINTS.CUSTOMERS.UPDATE(id),
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} - API response
   */
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.CUSTOMERS.DELETE(id)
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search customers
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async searchCustomers(searchTerm, filters = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        ...filters,
      };

      return await this.getCustomers(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async getCustomerOrders(customerId, filters = {}) {
    try {
      const searchParams = {
        customerId,
        ...filters,
      };

      return await this.getCustomers(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export singleton instance
const customerApiService = new CustomerApiService();
export default customerApiService;
