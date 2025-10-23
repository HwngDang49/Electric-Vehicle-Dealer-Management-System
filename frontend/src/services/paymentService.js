import apiClient from "./api";

const paymentService = {
  // Fetch payments with pagination and filters
  async fetchPayments(
    page = 1,
    pageSize = 10,
    statusFilter = "all",
    dateFilter = "all"
  ) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (dateFilter !== "all") {
        params.append("dateFilter", dateFilter);
      }

      const response = await apiClient.get(
        `/api/payments?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const response = await apiClient.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  },

  // Confirm payment
  async confirmPayment(paymentId) {
    try {
      const response = await apiClient.post(
        `/api/payments/${paymentId}/confirm`
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  },

  // Cancel payment
  async cancelPayment(paymentId, reason) {
    try {
      const response = await apiClient.post(
        `/api/payments/${paymentId}/cancel`,
        {
          reason: reason,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling payment:", error);
      throw error;
    }
  },

  // Get payment statistics
  async getPaymentStatistics(dateRange = "month") {
    try {
      const response = await apiClient.get(
        `/api/payments/statistics?range=${dateRange}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payment statistics:", error);
      throw error;
    }
  },

  // Export payments
  async exportPayments(filters = {}) {
    try {
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          params.append(key, filters[key]);
        }
      });

      const response = await apiClient.get(
        `/api/payments/export?${params.toString()}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting payments:", error);
      throw error;
    }
  },
};

// Export individual functions for backward compatibility
export const fetchPayments = paymentService.fetchPayments;
export const getPaymentById = paymentService.getPaymentById;
export const confirmPayment = paymentService.confirmPayment;
export const cancelPayment = paymentService.cancelPayment;
export const getPaymentStatistics = paymentService.getPaymentStatistics;
export const exportPayments = paymentService.exportPayments;

export default paymentService;
