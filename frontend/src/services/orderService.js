/**
 * Service layer for order management
 * Handles data fetching, business logic, and API calls
 */

// Mock data for development
const MOCK_ORDERS = [
  {
    id: "PO-2024-001",
    dealerId: "DL-001",
    dealerName: "Đại lý VinFast Hà Nội",
    dealerAddress: "123 Đường Láng, Đống Đa, Hà Nội",
    dealerPhone: "024 1234 5678",
    dealerEmail: "hanoi@vinfast.vn",
    amount: 800000000, // 800 triệu
    status: "pending",
    statusText: "Chờ xử lý",
    note: "Đơn hàng xe VF6 màu cam, khách hàng cá nhân",
    date: "2024-01-15",
    createdAt: "2024-01-15T09:30:00Z",
    expectedDeliveryDate: "2024-02-15",
    priority: "medium",
    items: [
      {
        product: "VF6",
        quantity: 1,
        unitPrice: 800000000,
        version: "Eco",
        color: "Cam",
      },
    ],
    vehicleModel: "VF6",
    vehicleVersion: "Eco",
    vehicleColor: "Cam",
    dealerCurrentDebt: 2000000000, // 2 tỷ - trong hạn mức
  },
  {
    id: "PO-2024-002",
    dealerId: "DL-002",
    dealerName: "Đại lý VinFast Vũng Tàu",
    dealerAddress: "456 Thùy Vân, Thắng Tam, Vũng Tàu",
    dealerPhone: "0254 5555 6666",
    dealerEmail: "vungtau@vinfast.vn",
    amount: 3000000000, // 3 tỷ
    status: "pending",
    statusText: "Chờ xử lý",
    note: "Đơn hàng 3 xe VF9 màu đen, khách hàng VIP vượt hạn mức",
    date: "2024-01-14",
    createdAt: "2024-01-14T11:45:00Z",
    expectedDeliveryDate: "2024-02-25",
    priority: "high",
    items: [
      {
        product: "VF9",
        quantity: 3,
        unitPrice: 1000000000,
        version: "Luxury",
        color: "Đen",
      },
    ],
    vehicleModel: "VF9",
    vehicleVersion: "Luxury",
    vehicleColor: "Đen",
    dealerCurrentDebt: 18500000000, // 18.5 tỷ - vượt quá hạn mức khi cộng với đơn hàng 3 tỷ
  },
  {
    id: "PO-2024-003",
    dealerId: "DL-003",
    dealerName: "Đại lý VinFast Đà Nẵng",
    dealerAddress: "789 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    dealerPhone: "0236 7777 8888",
    dealerEmail: "danang@vinfast.vn",
    amount: 1200000000, // 1.2 tỷ
    status: "approved",
    statusText: "Đã duyệt",
    note: "Đơn hàng xe VF8 màu xanh, khách hàng doanh nghiệp",
    date: "2024-01-13",
    createdAt: "2024-01-13T14:20:00Z",
    expectedDeliveryDate: "2024-02-20",
    priority: "medium",
    items: [
      {
        product: "VF8",
        quantity: 1,
        unitPrice: 1200000000,
        version: "Plus",
        color: "Xanh",
      },
    ],
    vehicleModel: "VF8",
    vehicleVersion: "Plus",
    vehicleColor: "Xanh",
    dealerCurrentDebt: 5000000000, // 5 tỷ - trong hạn mức
  },
];

// Business constants
export const DEALER_CREDIT_LIMIT = 20000000000; // 20 tỷ VND

/**
 * Process order data to ensure consistency
 * @param {Object} order - Raw order data
 * @returns {Object} Processed order data
 */
export const processOrderData = (order) => {
  return {
    ...order,
    statusText: getStatusText(order.status),
    createdAt: order.createdAt || order.date,
  };
};

/**
 * Get status text in Vietnamese
 * @param {string} status - Order status
 * @returns {string} Status text
 */
export const getStatusText = (status) => {
  const statusMap = {
    pending: "Chờ xử lý",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    processing: "Đang xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

/**
 * Check if an order can be approved based on credit limit
 * @param {Object} order - Order data
 * @returns {boolean} True if order can be approved
 */
export const canApproveOrder = (order) => {
  if (!order || order.status !== "pending") return false;

  const currentDebt = order.dealerCurrentDebt || 0;
  const orderAmount = order.amount || 0;
  const totalDebt = currentDebt + orderAmount;

  return totalDebt <= DEALER_CREDIT_LIMIT;
};

/**
 * Check if an order can be rejected
 * @param {Object} order - Order data
 * @returns {boolean} True if order can be rejected
 */
export const canRejectOrder = (order) => {
  if (!order || order.status !== "pending") return false;

  // Can always reject pending orders
  return true;
};

/**
 * Fetch orders from API (currently using mock data)
 * @returns {Promise<Array>} Array of orders
 */
export const fetchOrders = async () => {
  try {
    // TODO: Replace with real API call
    // const response = await fetch('/api/orders', {
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();
    // return data.orders.map(processOrderData);

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
    return MOCK_ORDERS.map(processOrderData);
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Approve an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Updated order data
 */
export const approveOrder = async (orderId) => {
  try {
    // TODO: Replace with real API call
    // const response = await fetch(`/api/orders/${orderId}/approve`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();
    // return processOrderData(data.order);

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const updatedOrder = {
      ...order,
      status: "approved",
      statusText: "Đã duyệt",
    };

    return processOrderData(updatedOrder);
  } catch (error) {
    console.error("Error approving order:", error);
    throw error;
  }
};

/**
 * Reject an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Updated order data
 */
export const rejectOrder = async (orderId) => {
  try {
    // TODO: Replace with real API call
    // const response = await fetch(`/api/orders/${orderId}/reject`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${getAuthToken()}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();
    // return processOrderData(data.order);

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const updatedOrder = {
      ...order,
      status: "rejected",
      statusText: "Đã từ chối",
    };

    return processOrderData(updatedOrder);
  } catch (error) {
    console.error("Error rejecting order:", error);
    throw error;
  }
};

/**
 * Filter orders based on search criteria
 * @param {Array} orders - Array of orders
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered orders
 */
export const filterOrders = (orders, filters) => {
  let filtered = [...orders];

  // Search query filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.dealerId.toLowerCase().includes(query) ||
        order.dealerName.toLowerCase().includes(query) ||
        order.note.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (filters.statusFilter && filters.statusFilter !== "all") {
    filtered = filtered.filter(
      (order) => order.status === filters.statusFilter
    );
  }

  return filtered;
};

/**
 * Sort orders based on criteria
 * @param {Array} orders - Array of orders
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort direction (asc/desc)
 * @returns {Array} Sorted orders
 */
export const sortOrders = (orders, sortBy, sortOrder) => {
  const sorted = [...orders];

  sorted.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === "date" || sortBy === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle numeric sorting
    if (sortBy === "amount") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return sorted;
};
