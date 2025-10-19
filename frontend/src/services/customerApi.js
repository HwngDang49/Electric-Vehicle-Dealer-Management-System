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
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
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

  /**
   * Check if customer has any quotes (regardless of status)
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<boolean>} - True if customer has any quotes (hide create button), False if no quotes (show create button)
   */
  async checkCustomerHasQuote(customerId) {
    try {
      console.log("🔍 Checking quotes for customer ID:", customerId);

      // Get customer details first to get customer name for search
      const customerDetail = await this.getCustomerById(customerId);
      const customerData = customerDetail.data || customerDetail;
      const customerName = customerData.fullName;

      console.log("👤 Customer name for search:", customerName);

      // Use quotes API to search by customer name (since backend doesn't support customerId filter)
      const url = `/quotes?searchTerm=${encodeURIComponent(
        customerName
      )}&pageSize=10`;
      const response = await apiClient.get(url);
      const result = handleApiResponse(response);

      console.log("📋 Quotes API Response:", result);

      // Check if there are any quotes for this customer
      const quotes = result.data?.items || [];
      console.log("📊 Found quotes:", quotes.length);

      if (quotes.length === 0) {
        // No quotes at all - show create button
        console.log("❌ No quotes found - show create button");
        return false;
      }

      // Filter quotes that belong to this specific customer
      const customerQuotes = quotes.filter(
        (quote) => quote.customerId == customerId
      );
      console.log("🎯 Customer-specific quotes:", customerQuotes.length);

      if (customerQuotes.length === 0) {
        console.log(
          "❌ No quotes found for this customer - show create button"
        );
        return false;
      }

      // Check if customer has any quotes (regardless of status)
      // If customer has any quotes, hide create button
      console.log("✅ Found quotes for customer - hide create button");
      return true;
    } catch (error) {
      // If error (e.g., 404), assume no quotes - show create button
      console.warn("❌ Error checking customer quotes:", error);
      return false;
    }
  }
}

const customerApiService = new CustomerApiService();
export default customerApiService;
