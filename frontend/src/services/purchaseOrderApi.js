// Purchase Order Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Purchase Order Management API Service
 * Contains all API calls related to purchase order management
 */
class PurchaseOrderApiService {
  /**
   * Get all purchase orders
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getPurchaseOrders(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${
            API_ENDPOINTS?.PURCHASE_ORDERS?.LIST ?? "/api/purchase-orders"
          }?${queryString}`
        : API_ENDPOINTS?.PURCHASE_ORDERS?.LIST ?? "/api/purchase-orders";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get purchase order by ID
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async getPurchaseOrderById(id) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.GET_BY_ID?.(id) ??
        `/api/purchase-orders/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new purchase order
   * @param {Object} purchaseOrderData - Purchase Order data
   * @returns {Promise<Object>}
   */
  async createPurchaseOrder(purchaseOrderData) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.CREATE ?? "/api/purchase-orders";
      const response = await apiClient.post(url, purchaseOrderData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update purchase order
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updatePurchaseOrder(id, updateData) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.UPDATE?.(id) ??
        `/api/purchase-orders/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete purchase order
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deletePurchaseOrder(id) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.DELETE?.(id) ??
        `/api/purchase-orders/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Submit purchase order
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async submitPurchaseOrder(id) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.SUBMIT?.(id) ??
        `/api/purchase-orders/${id}/submit`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Approve purchase order
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async approvePurchaseOrder(id) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.APPROVE?.(id) ??
        `/api/purchase-orders/${id}/approve`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Confirm purchase order
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async confirmPurchaseOrder(id) {
    try {
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.CONFIRM?.(id) ??
        `/api/purchase-orders/${id}/confirm`;
      const response = await apiClient.post(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search purchase orders
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchPurchaseOrders(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getPurchaseOrders(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const purchaseOrderApiService = new PurchaseOrderApiService();
export default purchaseOrderApiService;
