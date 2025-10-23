import api from "./api";

export const manufacturerInventoryApi = {
  /**
   * Lấy danh sách inventory của hãng (cho EVM Staff)
   */
  async getManufacturerInventoryList(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.searchTerm) {
        params.append("searchTerm", filters.searchTerm);
      }
      if (filters.productId) {
        params.append("productId", filters.productId);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await api.get(`/manufacturer/inventory/list?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching manufacturer inventory:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết VIN theo sản phẩm và trạng thái
   */
  async getManufacturerDetailVins(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.productId) {
        params.append("productId", filters.productId);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.color) {
        params.append("color", filters.color);
      }

      const response = await api.get(
        `/manufacturer/inventory/detail-vins?${params}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching manufacturer detail VINs:", error);
      throw error;
    }
  },
};

export default manufacturerInventoryApi;
