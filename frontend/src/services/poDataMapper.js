/**
 * Purchase Order Data Mapper
 * Maps backend data to frontend format and vice versa
 * Flexible mapping that can handle DB updates without hardcoding
 */

/**
 * Map backend PO list item to frontend format
 * @param {Object} backendPo - Backend PoListItemDto
 * @returns {Object} - Frontend PO format
 */
export const mapBackendPoToFrontend = (backendPo) => {
  if (!backendPo) return null;

  return {
    id: backendPo.poId?.toString() || backendPo.poId, // Use PoId directly from database, no formatting
    productId:
      backendPo.itemCount > 0 ? `Items: ${backendPo.itemCount}` : "No items",
    quantity: backendPo.totalQuantity || 0, // Use TotalQuantity from backend
    lineTotal: backendPo.totalAmount || 0,
    status: backendPo.status || "Draft",
    createAt: backendPo.createAt,
    expectedDate: backendPo.expectedDate,
    // Store original backend data for details modal
    backendData: backendPo,
    // Additional fields that might be useful
    dealerId: backendPo.dealerId,
    branchId: backendPo.branchId,
    createBy: backendPo.createBy,
    submittedBy: backendPo.submittedBy,
    approvedBy: backendPo.approvedBy,
    confirmedBy: backendPo.confirmedBy,
    updateAt: backendPo.updateAt,
  };
};

/**
 * Map backend PO detail to frontend format
 * @param {Object} backendPoDetail - Backend GetPoDetailDto
 * @returns {Object} - Frontend PO detail format
 */
export const mapBackendPoDetailToFrontend = (backendPoDetail) => {
  if (!backendPoDetail) return null;

  const mappedItems = (backendPoDetail.items || []).map(
    mapBackendPoItemToFrontend
  );
  const totalAmount = mappedItems.reduce(
    (total, item) => total + (item.lineTotal || 0),
    0
  );

  return {
    id: backendPoDetail.poId?.toString() || backendPoDetail.poId, // Use PoId directly from database, no formatting
    poId: backendPoDetail.poId,
    dealerId: backendPoDetail.dealerId,
    status: backendPoDetail.status,
    submittedByUserId: backendPoDetail.submittedByUserId,
    submittedAt: backendPoDetail.submittedAt,
    items: mappedItems,
    // Calculate totals
    totalAmount: totalAmount,
    formattedTotalAmount: formatPrice(totalAmount),
    itemCount: mappedItems.length,
    totalQuantity: mappedItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    ),
    // Additional details
    createAt: backendPoDetail.createAt,
    updateAt: backendPoDetail.updateAt,
    // Status display
    statusDisplay: getStatusDisplayText(backendPoDetail.status),
    statusColorClass: getStatusColorClass(backendPoDetail.status),
    // Inventory status
    inventoryReceived: backendPoDetail.inventoryReceived || false,
  };
};

/**
 * Map backend PO item to frontend format
 * @param {Object} backendPoItem - Backend PoItemDto
 * @returns {Object} - Frontend PO item format
 */
export const mapBackendPoItemToFrontend = (backendPoItem) => {
  if (!backendPoItem) return null;

  return {
    poItemId: backendPoItem.poItemId,
    productId: backendPoItem.productId,
    productName:
      backendPoItem.productName || `Product ID: ${backendPoItem.productId}`,
    // Map modelCode from backend (priority: modelCode > ModelCode > productModelCode)
    // If null, will be extracted from productName in component
    modelCode:
      backendPoItem.modelCode ||
      backendPoItem.ModelCode ||
      backendPoItem.productModelCode ||
      null,
    // Map imageUrl from backend (configured by admin)
    imageUrl: backendPoItem.imageUrl || backendPoItem.ImageUrl || null,
    unitPrice: backendPoItem.unitPrice || 0,
    quantity: backendPoItem.quantity || 0,
    lineTotal: backendPoItem.lineTotal || 0,
    // Additional mapping for compatibility
    floorPrice: backendPoItem.unitPrice || 0, // Use unitPrice as floorPrice for display
    effectivePrice: backendPoItem.unitPrice || 0,
    // Formatted display values
    formattedUnitPrice: formatPrice(backendPoItem.unitPrice || 0),
    formattedLineTotal: formatPrice(backendPoItem.lineTotal || 0),
    // Calculate unit wholesale price
    unitWholesale: backendPoItem.unitPrice || 0,
    formattedUnitWholesale: formatPrice(backendPoItem.unitPrice || 0),
  };
};

/**
 * Map frontend PO creation data to backend format
 * @param {Object} frontendData - Frontend PO creation data
 * @returns {Object} - Backend PO creation format
 */
export const mapFrontendToBackendPo = (frontendData) => {
  if (!frontendData) return null;

  return {
    PoItems: (frontendData.selectedItems || []).map((item) => ({
      ProductId: parseInt(item.productId),
      Qty: parseInt(item.quantity),
    })),
  };
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  if (!price) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date for display
 * @param {string|Date} date - Date value
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "N/A";

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

/**
 * Get status display text
 * @param {string} status - Status value
 * @returns {string} - Display text
 */
export const getStatusDisplayText = (status) => {
  const statusMap = {
    Draft: "Nháp",
    Submit: "Đã gửi",
    Confirm: "Đã xác nhận",
    InTransit: "Đang vận chuyển",
    Cancel: "Đã hủy",
    Delivery: "Đã giao hàng",
  };

  return statusMap[status] || status || "Không xác định";
};

/**
 * Get status color class
 * @param {string} status - Status value
 * @returns {string} - CSS class name
 */
export const getStatusColorClass = (status) => {
  const colorMap = {
    Draft: "status-draft",
    Submit: "status-submit",
    Confirm: "status-confirm",
    InTransit: "status-intransit",
    Cancel: "status-cancel",
    Delivery: "status-delivery",
  };

  return colorMap[status] || "status-default";
};
