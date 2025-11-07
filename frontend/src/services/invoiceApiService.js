import apiClient from './api';

// Invoice API Service
export const invoiceApiService = {
  // Tạo hóa đơn mới
  createInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post('/create-invoice', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Lấy danh sách hóa đơn với pagination và filter
  getInvoices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.invoiceType) queryParams.append('invoiceType', params.invoiceType);
      
      const response = await apiClient.get(`/invoices?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Lấy danh sách retail invoices với pagination và filter
  getRetailInvoices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      // DealerId và BranchId sẽ được backend tự động lấy từ JWT token
      // Chỉ gửi dealerId nếu muốn override (ví dụ: admin/manufacturer role)
      
      const response = await apiClient.get(`/retail-invoices?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching retail invoices:', error);
      throw error;
    }
  },

  // Lấy chi tiết hóa đơn
  getInvoiceDetail: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng để tạo hóa đơn
  getOrderForInvoice: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data?.value || response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching order for invoice:', error);
      throw error;
    }
  },

  // Tạo hóa đơn retail (đơn giản hơn)
  createRetailInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post('/create-retail-invoice', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating retail invoice:', error);
      throw error;
    }
  },

  // Lấy chi tiết retail invoice
  getRetailInvoiceDetail: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/retail-invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching retail invoice detail:', error);
      throw error;
    }
  },

  // Tạo payment cho retail invoice (trả đủ phần còn lại)
  createRetailPayment: async ({ invoiceId, amount }) => {
    try {
      const response = await apiClient.post('/create-retail-payment', { invoiceId, amount });
      return response.data; // { paymentId, amount }
    } catch (error) {
      console.error('Error creating retail payment:', error);
      throw error;
    }
  },

  // Close order
  closeOrder: async (orderId) => {
    try {
      const response = await apiClient.post('/close-order', { orderId });
      return response.data;
    } catch (error) {
      console.error('Error closing order:', error);
      throw error;
    }
  }
};

export default invoiceApiService;
