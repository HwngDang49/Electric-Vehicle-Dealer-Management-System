import api from "./api";

const vnpayApiService = {
  /**
   * Tạo URL thanh toán VNPay
   * @param {number} invoiceId - ID của invoice cần thanh toán
   * @returns {Promise<string>} Payment URL từ VNPay
   */
  createPaymentUrl: async (invoiceId) => {
    try {
      const response = await api.post("/vnpay/create", {
        invoiceId,
      });

      // Response format: { paymentUrl: "..." }
      if (response.paymentUrl) {
        return response.paymentUrl;
      }

      throw new Error("Không nhận được payment URL từ server");
    } catch (error) {
      console.error("Error creating VNPay payment URL:", error);
      throw error;
    }
  },

  /**
   * Xử lý callback từ VNPay (nếu cần gọi backend để verify)
   * @param {Object} vnpayParams - Các params từ VNPay return URL
   * @returns {Promise<Object>} Kết quả xác thực từ backend
   */
  handleReturn: async (vnpayParams) => {
    try {
      const response = await api.get("/vnpay/return", {
        params: vnpayParams,
      });

      return response;
    } catch (error) {
      console.error("Error handling VNPay return:", error);
      throw error;
    }
  },
};

export default vnpayApiService;
