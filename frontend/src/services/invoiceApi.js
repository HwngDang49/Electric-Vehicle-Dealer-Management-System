// Invoice Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Invoice Management API Service
 * Contains all API calls related to invoice management
 */
class InvoiceApiService {
  /**
   * Get all invoices
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getInvoices(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS?.INVOICES?.LIST ?? "/api/invoices"}?${queryString}`
        : API_ENDPOINTS?.INVOICES?.LIST ?? "/api/invoices";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get invoice by ID
   * @param {string|number} id - Invoice ID
   * @returns {Promise<Object>}
   */
  async getInvoiceById(id) {
    try {
      const url =
        API_ENDPOINTS?.INVOICES?.GET_BY_ID?.(id) ?? `/api/invoices/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>}
   */
  async createInvoice(invoiceData) {
    try {
      const url = API_ENDPOINTS?.INVOICES?.CREATE ?? "/api/invoices";
      const response = await apiClient.post(url, invoiceData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update invoice
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateInvoice(id, updateData) {
    try {
      const url =
        API_ENDPOINTS?.INVOICES?.UPDATE?.(id) ?? `/api/invoices/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete invoice
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteInvoice(id) {
    try {
      const url =
        API_ENDPOINTS?.INVOICES?.DELETE?.(id) ?? `/api/invoices/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get invoices by order
   * @param {string|number} orderId
   * @returns {Promise<Object>}
   */
  async getInvoicesByOrder(orderId) {
    try {
      const url =
        API_ENDPOINTS?.INVOICES?.GET_BY_ORDER?.(orderId) ??
        `/api/invoices/order/${orderId}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search invoices
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchInvoices(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getInvoices(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const invoiceApiService = new InvoiceApiService();
export default invoiceApiService;
