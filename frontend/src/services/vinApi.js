import api from "./api";

// VIN Management API
export const vinApi = {
  // Lấy danh sách VIN theo chi nhánh với thông tin số lượng
  getVinList: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      // Thêm các filter parameters
      if (filters.searchTerm) {
        params.append("searchTerm", filters.searchTerm);
      }
      if (filters.branchId) {
        params.append("branchId", filters.branchId);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.locationType) {
        params.append("locationType", filters.locationType);
      }

      const response = await api.get(`/dealer/get/vins/list?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching VIN list:", error);
      throw error;
    }
  },

  // Lấy danh sách chi nhánh cho filter dropdown
  getBranches: async () => {
    try {
      const response = await api.get("/branches");
      return response.data;
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  },

  // Lấy danh sách trạng thái VIN cho filter dropdown
  getVinStatuses: () => {
    return [
      { value: "", label: "Tất cả trạng thái" },
      { value: "InStock", label: "Có sẵn" },
      { value: "Allocated", label: "Đã phân bổ" },
      { value: "Ready", label: "Sẵn sàng" },
      { value: "Delivered", label: "Đã giao" },
    ];
  },

  // Lấy danh sách loại kho cho filter dropdown
  getLocationTypes: () => {
    return [
      { value: "", label: "Tất cả loại kho" },
      { value: "Manufacturer", label: "Kho hãng" },
      { value: "Dealer", label: "Kho đại lý" },
      { value: "Branch", label: "Kho chi nhánh" },
    ];
  },

  // Lấy danh sách VIN chi tiết theo branch và status
  getDetailVins: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.branchId) {
        params.append("branchId", filters.branchId);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.productId) {
        params.append("productId", filters.productId);
      }

      const response = await api.get(`/dealer/inventory/detail-vins?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching detail VINs:", error);
      throw error;
    }
  },
};

export default vinApi;
