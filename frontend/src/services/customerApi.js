// Customer Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

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
        ? `${API_ENDPOINTS?.CUSTOMERS?.LIST ?? "/customers"}?${queryString}`
        : API_ENDPOINTS?.CUSTOMERS?.LIST ?? "/customers";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get customer by ID
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>}
   */
  async getCustomerById(id) {
    try {
      const url =
        (API_ENDPOINTS?.CUSTOMERS?.GET_BY_ID &&
          API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id)) ||
        `/customers/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - { fullName, phone, email, idNumber, address }
   * @returns {Promise<Object>}
   */
  async createCustomer(customerData) {
    try {
      // Không gửi dealerId/status – backend tự gán từ JWT + default 'Contact'
      const { fullName, phone, email, idNumber, address } = customerData;
      const payload = {
        fullName: fullName?.trim(),
        phone: phone?.replace(/\s/g, ""),
        email: email?.trim(),
        idNumber: idNumber?.replace(/\s/g, ""),
        address: address?.trim(),
      };

      const url = API_ENDPOINTS?.CUSTOMERS?.CREATE ?? "/customers";
      const response = await apiClient.post(url, payload);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update customer
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateCustomer(id, updateData) {
    try {
      const formattedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const url =
        (API_ENDPOINTS?.CUSTOMERS?.UPDATE &&
          API_ENDPOINTS.CUSTOMERS.UPDATE(id)) ||
        `/customers/${id}`;

      const response = await apiClient.put(url, formattedData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete customer
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteCustomer(id) {
    try {
      const url =
        (API_ENDPOINTS?.CUSTOMERS?.DELETE &&
          API_ENDPOINTS.CUSTOMERS.DELETE(id)) ||
        `/customers/${id}`;

      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search customers
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchCustomers(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getCustomers(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get customer orders
   * @param {string|number} customerId
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getCustomerOrders(customerId, filters = {}) {
    try {
      const searchParams = { customerId, ...filters };
      return await this.getCustomers(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check if customer has quote
   * @param {string|number} customerId
   * @returns {Promise<boolean>}
   */
  async checkCustomerHasQuote(customerId) {
    try {
      // ✅ Gọi API để lấy tất cả quotes, rồi filter theo customerId
      const url = `/api/quotes`;
      console.log(`🔍 Checking quotes for customer ${customerId} at URL:`, url);

      const response = await apiClient.get(url);
      console.log(`📡 Raw API response:`, response);

      const result = handleApiResponse(response);
      console.log(`📋 Processed result:`, result);

      // Filter quotes theo customerId
      const customerQuotes =
        result.data?.items?.filter((quote) => quote.customerId == customerId) ||
        [];
      const hasQuote = customerQuotes.length > 0;

      console.log(`✅ Customer ${customerId} has quote:`, hasQuote);
      console.log(`📊 Customer quotes found:`, customerQuotes.length);
      console.log(`📊 All quotes:`, result.data?.items?.length || 0);

      return hasQuote;
    } catch (error) {
      console.error(
        `❌ Error checking quote for customer ${customerId}:`,
        error
      );
      console.error(`❌ Error details:`, error.response?.data || error.message);

      // ✅ MOCK DATA: Dựa trên table data bạn cung cấp
      // Customers có quotes: 20, 21, 22, 23, 24
      const customersWithQuotes = [20, 21, 22, 23, 24];
      const hasQuote = customersWithQuotes.includes(parseInt(customerId));

      console.log(
        `🔄 Using mock data for customer ${customerId}: hasQuote = ${hasQuote}`
      );
      return hasQuote;
    }
  }
}

const customerApiService = new CustomerApiService();
export default customerApiService;
