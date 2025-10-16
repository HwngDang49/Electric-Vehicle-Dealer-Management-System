// Customer API Service
import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Customer API Service
 * Contains all API calls related to customer management
 */
class CustomerApiService {
  /**
   * Get customer by ID
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} - API response
   */
  async getCustomerById(id) {
    try {
      const url = `/customers/${id}`;
      console.log("🌐 GetCustomerById API URL:", url);
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error("❌ GetCustomerById API Error:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get all customers
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getCustomers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString ? `/customers?${queryString}` : "/customers";

      const response = await apiClient.get(url);
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
      const url = "/customers";
      const response = await apiClient.post(url, customerData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update customer
   * @param {string|number} id - Customer ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - API response
   */
  async updateCustomer(id, updateData) {
    try {
      const url = `/customers/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete customer
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} - API response
   */
  async deleteCustomer(id) {
    try {
      const url = `/customers/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const customerApiService = new CustomerApiService();
export default customerApiService;
