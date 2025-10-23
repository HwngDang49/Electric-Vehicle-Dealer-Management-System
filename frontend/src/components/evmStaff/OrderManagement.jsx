import React, { useState, useEffect } from "react";
import "./OrderManagement.css"; // CSS riêng cho OrderManagement
import purchaseOrderApiService from "../../services/purchaseOrderApi";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState("submit"); // "submit" or "confirm"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log(
        "🔄 Loading purchase orders for EVM Staff (Order Management)..."
      );

      // Load ALL orders (pageSize = 1000 to get all orders at once)
      const response = await purchaseOrderApiService.getAllPurchaseOrders(
        1,
        1000
      );

      console.log("✅ Purchase orders response:", response);
      console.log("🔍 Response.data:", response?.data);
      console.log("🔍 Response.data.Items:", response?.data?.Items);

      // Backend trả về { status: 'success', data: { items: [...], page, pageSize, total } } (camelCase)
      let data = [];

      // Priority: response.data.items (camelCase from .NET with JSON config)
      if (response?.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
        console.log("✅ Using response.data.items (camelCase)");
      } else if (response?.data?.Items && Array.isArray(response.data.Items)) {
        data = response.data.Items;
        console.log("✅ Using response.data.Items (PascalCase)");
      } else if (response?.items && Array.isArray(response.items)) {
        data = response.items;
        console.log("✅ Using response.items");
      } else if (response?.Items && Array.isArray(response.Items)) {
        data = response.Items;
        console.log("✅ Using response.Items");
      }

      console.log(`📦 Loaded ${data.length} purchase orders`);
      console.log("📋 First PO:", data[0]);

      setOrders(data);
    } catch (err) {
      console.error("❌ Error loading purchase orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.poId || selectedOrder.PoId;

      console.log(`✅ Confirming PO ID: ${poId}`);

      const response = await purchaseOrderApiService.confirmPurchaseOrder(poId);

      console.log("✅ Backend response:", response);

      alert(
        "✅ Xác nhận đơn hàng thành công!\n\n" +
          "✓ Đã kiểm tra kho VIN\n" +
          "✓ Đã kiểm tra hạn mức công nợ\n" +
          "✓ Đã phân bổ VIN cho đơn hàng\n" +
          "✓ Trạng thái: Submit → Confirmed"
      );

      setShowDetailModal(false);
      setSelectedOrder(null);
      await loadOrders();
      setActiveTab("confirm");
    } catch (err) {
      console.error("❌ Error confirming PO:", err);

      let errorMessage = "Vui lòng thử lại";

      if (err.response?.data) {
        const errorData = err.response.data;
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join("\n");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert("❌ Không thể xác nhận đơn hàng!\n\nLý do:\n" + errorMessage);
    } finally {
      setConfirming(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "submit":
        return "status-badge submit";
      case "confirm":
        return "status-badge confirm";
      default:
        return "status-badge";
    }
  };

  const getStatusText = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "submit":
        return "Chờ xác nhận";
      case "confirm":
        return "Đã xác nhận";
      default:
        return status || "N/A";
    }
  };

  // Filter orders based on active tab (backend uses camelCase)
  const filteredOrders = orders.filter((order) => {
    const status = (order.status || order.Status || "").toLowerCase();
    return status === activeTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Count orders by status
  const submitCount = orders.filter(
    (o) => (o.status || o.Status || "").toLowerCase() === "submit"
  ).length;
  const confirmCount = orders.filter(
    (o) => (o.status || o.Status || "").toLowerCase() === "confirm"
  ).length;

  console.log("📊 Order counts:", {
    total: orders.length,
    submit: submitCount,
    confirm: confirmCount,
    filteredCount: filteredOrders.length,
    currentPageCount: currentOrders.length,
    orders: orders.slice(0, 10).map((o) => ({
      poId: o.poId,
      dealer: o.dealerId,
      status: o.status,
    })),
  });

  console.log("🔍 Filtered orders for current tab:", {
    activeTab,
    filteredOrders: filteredOrders.map((o) => ({
      poId: o.poId,
      dealer: o.dealerId,
      status: o.status,
    })),
  });

  console.log("📄 Current page orders:", {
    page: currentPage,
    startIndex,
    endIndex: startIndex + itemsPerPage,
    currentOrders: currentOrders.map((o) => ({
      poId: o.poId,
      dealer: o.dealerId,
      status: o.status,
    })),
  });

  if (loading) {
    return (
      <div className="order-management-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management-container">
      <div className="order-management-header">
        <h1>Quản lý đơn hàng</h1>
        <p>Xử lý và quản lý các đơn đặt hàng từ đại lý</p>
      </div>

      {/* Filter Section */}
      <div className="order-filter-section">
        <label htmlFor="status-filter">Trạng thái:</label>
        <select
          id="status-filter"
          value={activeTab}
          onChange={(e) => {
            setActiveTab(e.target.value);
            setCurrentPage(1);
          }}
          className="order-status-select"
        >
          <option value="submit">🕐 Chờ xác nhận ({submitCount})</option>
          <option value="confirm">✅ Đã xác nhận ({confirmCount})</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <div className="orders-table-header">
          <div className="header-cell">Mã đơn</div>
          <div className="header-cell">Đại lý</div>
          <div className="header-cell">Ngày tạo</div>
          <div className="header-cell">Số tiền</div>
          <div className="header-cell">Trạng thái</div>
          <div className="header-cell">Thao tác</div>
        </div>

        <div className="orders-table-body">
          {currentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p>
                {activeTab === "submit"
                  ? "Không có đơn hàng chờ xác nhận"
                  : "Không có đơn hàng đã xác nhận"}
              </p>
            </div>
          ) : (
            currentOrders.map((order) => (
              <div key={order.poId || order.PoId} className="order-row">
                <div className="order-cell">
                  <span className="order-id-badge">
                    PO-{order.poId || order.PoId}
                  </span>
                </div>
                <div className="order-cell dealer-badge">
                  Dealer {order.dealerId || order.DealerId}
                </div>
                <div className="order-cell order-date">
                  {formatDate(order.createAt || order.CreateAt)}
                </div>
                <div className="order-cell order-amount">
                  {formatCurrency(order.totalAmount || order.TotalAmount)}
                </div>
                <div className="order-cell">
                  <span
                    className={getStatusBadgeClass(
                      order.status || order.Status
                    )}
                  >
                    {getStatusText(order.status || order.Status)}
                  </span>
                </div>
                <div className="order-cell">
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Chi tiết đơn hàng PO-{selectedOrder.poId || selectedOrder.PoId}
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Order Info */}
              <div className="info-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mã đơn:</label>
                    <span>PO-{selectedOrder.poId || selectedOrder.PoId}</span>
                  </div>
                  <div className="info-item">
                    <label>Dealer ID:</label>
                    <span>
                      {selectedOrder.dealerId || selectedOrder.DealerId}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Branch ID:</label>
                    <span>
                      {selectedOrder.branchId || selectedOrder.BranchId}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Ngày tạo:</label>
                    <span>
                      {formatDate(
                        selectedOrder.createAt || selectedOrder.CreateAt
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span
                      className={getStatusBadgeClass(
                        selectedOrder.status || selectedOrder.Status
                      )}
                    >
                      {getStatusText(
                        selectedOrder.status || selectedOrder.Status
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Tổng tiền:</label>
                    <span className="amount">
                      {formatCurrency(
                        selectedOrder.totalAmount || selectedOrder.TotalAmount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Items */}
              {(selectedOrder.items || selectedOrder.Items) &&
                (selectedOrder.items || selectedOrder.Items).length > 0 && (
                  <div className="info-section">
                    <h3>Sản phẩm đặt hàng</h3>
                    <div className="items-table">
                      <div className="items-header">
                        <div className="item-cell">Sản phẩm</div>
                        <div className="item-cell">Đơn giá</div>
                        <div className="item-cell">Số lượng</div>
                        <div className="item-cell">Thành tiền</div>
                      </div>
                      {(selectedOrder.items || selectedOrder.Items).map(
                        (item) => (
                          <div
                            key={item.poItemId || item.PoItemId}
                            className="item-row"
                          >
                            <div className="item-cell">
                              {item.productName || item.ProductName}
                            </div>
                            <div className="item-cell">
                              {formatCurrency(item.unitPrice || item.UnitPrice)}
                            </div>
                            <div className="item-cell">
                              {item.quantity || item.Quantity}
                            </div>
                            <div className="item-cell">
                              {formatCurrency(item.lineTotal || item.LineTotal)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="modal-footer">
              {(selectedOrder.status || selectedOrder.Status)?.toLowerCase() ===
                "submit" && (
                <button
                  className="confirm-btn"
                  onClick={handleConfirmOrder}
                  disabled={confirming}
                >
                  {confirming ? "Đang xử lý..." : "✅ Xác nhận đơn hàng"}
                </button>
              )}
              {(selectedOrder.status || selectedOrder.Status)?.toLowerCase() ===
                "confirm" && (
                <div className="status-info confirmed">
                  ✅ Đơn hàng đã được xác nhận
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
