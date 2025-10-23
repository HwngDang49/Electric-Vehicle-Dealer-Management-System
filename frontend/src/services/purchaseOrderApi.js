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
   * Get all purchase orders from backend (Dealer)
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
   * Get all purchase orders for EVM Staff (all dealers)
   * @param {Object} params - Pagination params (page, pageSize)
   * @returns {Promise<Object>} - API response with all purchase orders
   */
  async getAllPurchaseOrders(page = 1, pageSize = 100) {
    try {
      console.log("🔄 Fetching all purchase orders (EVM Staff)...", {
        page,
        pageSize,
      });

      const url = `/evm/purchase-orders/all?page=${page}&pageSize=${pageSize}`;

      const response = await apiClient.get(url);

      console.log("✅ All purchase orders fetched:", response.data);

      // Backend trả về PagedResult format: { items: [...], page, pageSize, total, totalPages }
      // Wrap in data property to match frontend expectation
      return {
        status: "success",
        data: response.data, // PagedResult is already in response.data
      };
    } catch (error) {
      console.error("❌ Error fetching all purchase orders:", error);
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
   * Confirm purchase order (EVM Staff only)
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async confirmPurchaseOrder(id) {
    try {
      console.log(`✅ Confirming purchase order ID: ${id}`);

      const url = `/Confirm-po`;
      const body = { PoId: parseInt(id) };

      const response = await apiClient.put(url, body);
      const result = handleApiResponse(response);

      console.log("✅ Purchase order confirmed successfully");
      return result;
    } catch (error) {
      console.error("❌ Error confirming purchase order:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Create Invoice B2B for PO (EVM Staff only)
   * @param {string|number} poId - Purchase Order ID
   * @param {string|number} dealerId - Dealer ID
   * @returns {Promise<Object>}
   */
  async createInvoiceForPO(poId, dealerId) {
    try {
      console.log(`📄 Creating Invoice B2B for PO ID: ${poId}`);
      const url = `/create-invoice`;
      const body = {
        Type: 1, // InvoiceType.B2B = 1 (Retail = 0, B2B = 1)
        DealerId: parseInt(dealerId),
        PoId: parseInt(poId),
        SaleDocId: 0,
        Note: `Invoice for PO-${poId}`,
      };
      const response = await apiClient.post(url, body);
      const result = handleApiResponse(response);
      console.log("✅ Invoice B2B created successfully");
      return result;
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Issue delivery - EVM Staff sends VINs to Dealer (Allocated → InTransit)
   * @param {string|number} poId - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async issueDelivery(poId) {
    try {
      console.log(`🚚 Issuing delivery for PO ID: ${poId}`);
      const url = `/po/delivery-vin`;
      const body = { PoId: parseInt(poId) };
      const response = await apiClient.post(url, body);
      const result = handleApiResponse(response);
      console.log("✅ Delivery issued successfully (VIN → InTransit)");
      return result;
    } catch (error) {
      console.error("❌ Error issuing delivery:", error);
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

  /**
   * Move purchase order to payment status
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async moveToPayment(id) {
    try {
      console.log(`💳 Moving PO to payment: ${id}`);

      const url = `/move-to-payment`;
      const body = { PoId: parseInt(id) };

      console.log("📤 Move to payment request:", { url, body });

      const response = await apiClient.put(url, body);
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ Error moving PO to payment ${id}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Receive purchase order items to inventory (for Delivery status)
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async receiveToInventory(id) {
    try {
      console.log(`📦 Receiving PO to inventory (Delivery): ${id}`);

      const url = `/inventories/receive`;
      const body = {
        PoId: parseInt(id),
        Note: `Inventory received from Purchase Order ${id} at ${new Date().toISOString()}`,
      };

      console.log("📤 Receive to inventory request:", { url, body });

      const response = await apiClient.post(url, body);
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ Error receiving PO to inventory ${id}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Confirm delivery for InTransit purchase order
   * @param {string|number} id - Purchase Order ID
   * @returns {Promise<Object>}
   */
  async confirmDelivery(id) {
    try {
      console.log(`🚚 Confirming delivery for InTransit PO: ${id}`);

      const url = `/po/receive-vin`;
      const body = {
        PoId: parseInt(id),
      };

      console.log("📤 Confirm delivery request:", { url, body });

      const response = await apiClient.post(url, body);
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ Error confirming delivery for PO ${id}:`, error);
      throw handleApiError(error);
    }
  }
}

const purchaseOrderApiService = new PurchaseOrderApiService();
export default purchaseOrderApiService;
