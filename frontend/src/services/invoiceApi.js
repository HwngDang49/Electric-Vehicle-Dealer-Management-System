import apiClient from "./api";

class InvoiceApiService {
  /**
   * Get list of invoices
   * @returns {Promise<Array>}
   */
  async getList() {
    try {
      console.log("📋 Fetching invoices list...");

      const response = await apiClient.get("/invoices");

      console.log("✅ Invoices fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching invoices:", error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   * @param {string|number} id - Invoice ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      console.log(`📋 Fetching invoice ${id}...`);

      const response = await apiClient.get(`/invoices/${id}`);

      console.log("✅ Invoice fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>}
   */
  async create(invoiceData) {
    try {
      console.log("📝 Creating new invoice...", invoiceData);

      const response = await apiClient.post("/invoices", invoiceData);

      console.log("✅ Invoice created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      throw error;
    }
  }

  /**
   * Update invoice
   * @param {string|number} id - Invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @returns {Promise<Object>}
   */
  async update(id, invoiceData) {
    try {
      console.log(`📝 Updating invoice ${id}...`, invoiceData);

      const response = await apiClient.put(`/invoices/${id}`, invoiceData);

      console.log("✅ Invoice updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete invoice
   * @param {string|number} id - Invoice ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      console.log(`🗑️ Deleting invoice ${id}...`);

      const response = await apiClient.delete(`/invoices/${id}`);

      console.log("✅ Invoice deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update invoice status
   * @param {string|number} id - Invoice ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    try {
      console.log(`📝 Updating invoice ${id} status to ${status}...`);

      const response = await apiClient.patch(`/invoices/${id}/status`, {
        status,
      });

      console.log("✅ Invoice status updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating invoice status ${id}:`, error);
      throw error;
    }
  }
}

const invoiceApiService = new InvoiceApiService();
export default invoiceApiService;
