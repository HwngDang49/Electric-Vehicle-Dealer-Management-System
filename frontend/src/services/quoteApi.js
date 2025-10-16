// Quote Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Quote Management API Service
 * Contains all API calls related to quote management
 */
class QuoteApiService {
  /**
   * Get all quotes
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getQuotes(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS?.QUOTATIONS?.LIST ?? "/quotes"}?${queryString}`
        : API_ENDPOINTS?.QUOTATIONS?.LIST ?? "/quotes";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get quote by ID
   * @param {string|number} id - Quote ID
   * @returns {Promise<Object>}
   */
  async getQuoteById(id) {
    try {
      const url = API_ENDPOINTS?.QUOTATIONS?.GET_BY_ID?.(id) ?? `/quotes/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new quote
   * @param {Object} quoteData - Quote data
   * @returns {Promise<Object>}
   */
  async createQuote(quoteData) {
    try {
      // Backend requires customerId in the route
      const customerId = quoteData.customerId;
      if (!customerId) {
        throw new Error("CustomerId is required to create a quote");
      }

      const url = `/quotes/${customerId}/create-quote`;

      console.log(
        "🌐 QuoteApi.createQuote() - Full URL:",
        apiClient.defaults.baseURL + url
      );
      console.log("🌐 QuoteApi.createQuote() - Endpoint:", url);
      console.log("🌐 QuoteApi.createQuote() - Payload:", quoteData);

      const response = await apiClient.post(url, quoteData);
      return handleApiResponse(response);
    } catch (error) {
      console.error("❌ QuoteApi.createQuote() error:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Update quote
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateQuote(id, updateData) {
    try {
      const url = API_ENDPOINTS?.QUOTATIONS?.UPDATE?.(id) ?? `/quotes/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete quote
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteQuote(id) {
    try {
      const url = API_ENDPOINTS?.QUOTATIONS?.DELETE?.(id) ?? `/quotes/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Convert quote to order
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async convertToOrder(id) {
    try {
      const url =
        API_ENDPOINTS?.QUOTATIONS?.CONVERT_TO_ORDER?.(id) ??
        `/quotes/${id}/convert`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Finalize quote
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async finalizeQuote(id) {
    try {
      const url = `/quotes/${id}/finalize`;
      console.log("🌐 FinalizeQuote API URL:", url);
      console.log("🌐 FinalizeQuote ID:", id);
      const response = await apiClient.patch(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error("❌ FinalizeQuote API Error:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Cancel quote
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async cancelQuote(id) {
    try {
      const url =
        API_ENDPOINTS?.QUOTATIONS?.CANCEL?.(id) ?? `/quotes/${id}/cancel`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search quotes
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchQuotes(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getQuotes(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const quoteApiService = new QuoteApiService();
export default quoteApiService;
