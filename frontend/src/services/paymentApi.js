import apiClient from "./api";

class PaymentApiService {
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
