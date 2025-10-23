import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";

/**
 * Order API Service
 * Handles all API calls related to Orders
 */
const orderApiService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order creation data
   * @param {number} orderData.CustomerId - Customer ID
   * @param {number} orderData.ProductId - Product ID
   * @param {number} orderData.Quantity - Quantity (default: 1)
   * @returns {Promise<Object>} Created order response
   */
  async createOrder(orderData) {
    try {
      console.log("📤 Creating order with data:", orderData);
      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.CREATE,
        orderData
      );
      console.log("✅ Order created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error creating order:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Get all orders
   * @returns {Promise<Array>} List of orders
   */
  async getAllOrders() {
    try {
      console.log("📤 Fetching all orders...");
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST);
      console.log("✅ Orders fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error fetching orders:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Get order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      console.log(`📤 Fetching order ${orderId}...`);
      const response = await apiClient.get(
        API_ENDPOINTS.ORDERS.GET_BY_ID(orderId)
      );
      console.log("✅ Order fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error fetching order ${orderId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Confirm an order (change status to Confirmed)
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async confirmOrder(orderId) {
    try {
      console.log(`📤 Confirming order ${orderId}...`);
      const response = await apiClient.patch(
        API_ENDPOINTS.ORDERS.CONFIRM(orderId)
      );
      console.log("✅ Order confirmed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error confirming order ${orderId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Allocate VIN to order
   * @param {number} orderId - Order ID
   * @param {string} note - Allocation note
   * @returns {Promise<Object>} Allocation result
   */
  async allocateVin(orderId, note = "") {
    try {
      console.log(`📤 Allocating VIN to order ${orderId}...`);
      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.ALLOCATE_VIN(orderId),
        {
          orderId,
          note,
        }
      );
      console.log("✅ VIN allocated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error allocating VIN to order ${orderId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Schedule delivery for order
   * @param {number} orderId - Order ID
   * @param {string} scheduledDate - Delivery date (ISO format)
   * @param {string} note - Delivery note
   * @returns {Promise<Object>} Schedule result
   */
  async scheduleDelivery(orderId, scheduledDate, note = "") {
    try {
      console.log(`📤 Scheduling delivery for order ${orderId}...`);
      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.SCHEDULE_DELIVERY(orderId),
        {
          scheduledDate,
          note,
        }
      );
      console.log("✅ Delivery scheduled successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error scheduling delivery for order ${orderId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Complete delivery for order
   * @param {number} orderId - Order ID
   * @param {string} note - Completion note
   * @returns {Promise<Object>} Completion result
   */
  async completeDelivery(orderId, note = "") {
    try {
      console.log(`📤 Completing delivery for order ${orderId}...`);
      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.COMPLETE_DELIVERY(orderId),
        {
          note,
        }
      );
      console.log("✅ Delivery completed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error completing delivery for order ${orderId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default orderApiService;
