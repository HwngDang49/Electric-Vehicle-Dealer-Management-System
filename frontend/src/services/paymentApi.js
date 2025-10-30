import apiClient from "./api";

class PaymentApiService {
  /**
   * Get all payments
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getPayments(filters = {}) {
    try {
      const response = await apiClient.get("/api/payments", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {string|number} id - Payment ID
   * @returns {Promise<Object>}
   */
  async getPaymentById(id) {
    try {
      const response = await apiClient.get(`/api/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching payment:", error);
      throw error;
    }
  }

  /**
   * Create new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>}
   */
  async createPayment(paymentData) {
    try {
      console.log("💳 Creating payment...", paymentData);

      const response = await apiClient.post("/create-payment-po", paymentData);

      console.log("✅ Payment created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating payment:", error);
      throw error;
    }
  }

  /**
   * Update payment
   * @param {string|number} id - Payment ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>}
   */
  async updatePayment(id, paymentData) {
    try {
      const response = await apiClient.put(`/api/payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating payment:", error);
      throw error;
    }
  }

  /**
   * Delete payment
   * @param {string|number} id - Payment ID
   * @returns {Promise<Object>}
   */
  async deletePayment(id) {
    try {
      const response = await apiClient.delete(`/api/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting payment:", error);
      throw error;
    }
  }

  /**
   * Confirm payment (EVM Staff)
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Object>}
   */
  async confirmPayment(paymentId) {
    try {
      console.log("✅ Confirming payment:", paymentId);

      const response = await apiClient.post("/confirm-payment", {
        paymentId,
      });

      console.log("✅ Payment confirmed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error confirming payment:", error);
      throw error;
    }
  }
}

const paymentApiService = new PaymentApiService();
export default paymentApiService;
