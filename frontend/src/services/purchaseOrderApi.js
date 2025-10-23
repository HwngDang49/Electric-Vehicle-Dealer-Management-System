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
   * Get all purchase orders from backend
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response with purchase orders list
   */
  async getPurchaseOrders(filters = {}) {
    try {
      console.log("🔄 Fetching purchase orders from backend...");

      // Use backend endpoint from constants (remove /api prefix since baseURL already has it)
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.LIST?.replace("/api", "") ??
        "/purchase-orders";

      const response = await apiClient.get(url);
      const result = handleApiResponse(response);

      console.log(
        "✅ Purchase orders fetched:",
        result.data?.length || 0,
        "orders"
      );
      return result;
    } catch (error) {
      console.error("❌ Error fetching purchase orders:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get purchase order details by ID from backend
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>} - API response with purchase order details
   */
  async getPurchaseOrderById(id) {
    try {
      console.log(`🔄 Fetching purchase order details for ID: ${id}`);

      // Use backend endpoint for getting PO details (remove /api prefix since baseURL already has it)
      const url = `/get-po-detail/${id}`;

      console.log("🔗 Full URL will be:", apiClient.defaults.baseURL + url);

      const response = await apiClient.get(url);
      const result = handleApiResponse(response);

      console.log("✅ Purchase order details fetched:", result.data);
      return result;
    } catch (error) {
      console.error(
        `❌ Error fetching purchase order details for ID ${id}:`,
        error
      );
      throw handleApiError(error);
    }
  }

  /**
   * Create new purchase order via backend API
   * @param {Object} purchaseOrderData - Purchase Order data
   * @returns {Promise<Object>} - API response
   */
  async createPurchaseOrder(purchaseOrderData) {
    try {
      console.log(
        "🔄 Creating purchase order via backend API...",
        purchaseOrderData
      );

      // Use backend endpoint from constants (remove /api prefix since baseURL already has it)
      const url =
        API_ENDPOINTS?.PURCHASE_ORDERS?.CREATE?.replace("/api", "") ??
        "/create-po";

      const response = await apiClient.post(url, purchaseOrderData);
      const result = handleApiResponse(response);

      console.log("✅ Purchase order created successfully:", result.data);
      return result;
    } catch (error) {
      console.error("❌ Error creating purchase order:", error);
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
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async submitPurchaseOrder(id) {
    try {
      console.log(`🚀 Submitting PO: ${id}`);

      // Backend expects: PUT /api/submit-po with body { PoId: number }
      const url = `/submit-po`;
      const body = { PoId: parseInt(id) };

      console.log("📤 Submit request:", { url, body });

      const response = await apiClient.put(url, body);
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ Error submitting PO ${id}:`, error);
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
