/**
 * Service layer for order management
 * Handles data fetching, business logic, and API calls
 */

// Business constants
export const DEALER_CREDIT_LIMIT = 20000000000; // 20 tỷ VND

/**
 * Get authentication token from localStorage
 * @returns {string|null} Auth token or null if not found
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
};

/**
 * Process order data to ensure consistency
 * @param {Object} order - Raw order data from backend
 * @returns {Object} Processed order data for frontend
 */
export const processOrderData = (order) => {
  return {
    // Map backend fields to frontend format
    id: order.poId,
    dealerId: order.dealerId,
    branchId: order.branchId,
    status: order.status,
    statusText: getStatusText(order.status),
    amount: order.totalAmount || 0,
    date: order.createAt,
    createdAt: order.createAt,
    updatedAt: order.updateAt,
    createBy: order.createBy,
    submittedBy: order.submittedBy,
    approvedBy: order.approvedBy,
    confirmedBy: order.confirmedBy,
    itemCount: order.itemCount || 0,
    totalQuantity: order.totalQuantity || 0,
    items: order.items || [],
    expectedDate: order.expectedDate,
  };
};

/**
 * Get status text in Vietnamese
 * @param {string} status - Order status
 * @returns {string} Status text
 */
export const getStatusText = (status) => {
  const statusMap = {
    // Backend POStatus enum values
    Draft: "Nháp",
    Submit: "Đã gửi",
    Reject: "Đã từ chối",
    Confirm: "Đã xác nhận",
    Cancel: "Đã hủy",
  };
  return statusMap[status] || status;
};

/**
 * Check if an order can be approved based on credit limit
 * @param {Object} order - Order data
 * @returns {boolean} True if order can be approved
 */
export const canApproveOrder = (order) => {
  if (!order || order.status !== "Submit") return false;

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
  if (!order || order.status !== "Submit") return false;

  // Can always reject submitted orders
  return true;
};

/**
 * Fetch orders from API
 * @returns {Promise<Array>} Array of orders
 */
export const fetchOrders = async () => {
  try {
    console.log("🔄 Fetching purchase orders from backend...");

    const response = await fetch(
      "http://localhost:5014/api/purchase-orders/all",
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const contentType = response.headers.get("content-type");
    console.log("📡 Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error("❌ Non-JSON response:", responseText);
      throw new Error(`Expected JSON but got: ${contentType}`);
    }

    const data = await response.json();
    console.log("📋 API Response:", data);

    // Handle direct array response from backend
    if (Array.isArray(data)) {
      return data.map(processOrderData);
    } else {
      console.warn("Unexpected response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

/**
 * Approve an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Updated order data
 */
export const approveOrder = async (orderId) => {
  try {
    console.log("✅ Approving order:", orderId);

    const response = await fetch(`http://localhost:5014/api/Confirm-po`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poId: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Order approved successfully:", data);

    return { id: orderId, status: "Confirm" };
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
    console.log("❌ Rejecting order:", orderId);

    // TODO: Implement reject API when available
    console.warn("⚠️ Reject API not implemented yet, simulating rejection");

    return { id: orderId, status: "Reject" };
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
