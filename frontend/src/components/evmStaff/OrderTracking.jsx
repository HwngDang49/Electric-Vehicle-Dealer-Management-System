import React, { useState, useEffect } from "react";
import "./OrderTracking.css";
import purchaseOrderApiService from "../../services/purchaseOrderApi";

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState("confirm"); // "confirm", "intransit", or "delivery"
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // "all", "has", "none"
  const [_totalCount, _setTotalCount] = useState({
    confirm: 0,
    intransit: 0,
    delivery: 0,
  }); // Total count for each tab

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading purchase orders for EVM Staff...");

      const response = await purchaseOrderApiService.getAllPurchaseOrders();

      console.log("✅ Purchase orders response:", response);

      // Backend trả về PagedResult: { items: [...], page, pageSize, total }
      let data = [];
      if (response?.items && Array.isArray(response.items)) {
        data = response.items; // ✅ Lấy từ response.items
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        data = response.data.items;
      }

      // Sort by createdAt descending (newest first)
      data.sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.CreatedAt || a.orderDate || a.OrderDate || 0
        );
        const dateB = new Date(
          b.createdAt || b.CreatedAt || b.orderDate || b.OrderDate || 0
        );
        return dateB - dateA; // Descending order
      });

      setOrders(data);

      // Tính tổng số cho mỗi tab
      const confirmCount = data.filter(
        (o) => (o.Status || o.status || "").toLowerCase() === "confirm"
      ).length;

      const intransitCount = data.filter(
        (o) => (o.Status || o.status || "").toLowerCase() === "intransit"
      ).length;

      const deliveryCount = data.filter((o) => {
        const status = (o.Status || o.status || "").toLowerCase();
        return status === "delivery" || status === "delivered";
      }).length;

      _setTotalCount({
        confirm: confirmCount,
        intransit: intransitCount,
        delivery: deliveryCount,
      });

      console.log(
        `📦 Loaded ${data.length} purchase orders (Total: ${
          response?.total || data.length
        })`
      );
      console.log(
        `📊 Counts - Confirm: ${confirmCount}, InTransit: ${intransitCount}, Delivery: ${deliveryCount}`
      );
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

  const _handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.PoId || selectedOrder.poId;

      console.log(`✅ Confirming PO ID: ${poId}`);
      console.log("🔍 Backend sẽ kiểm tra:");
      console.log("   - Kho VIN manufacturer có đủ không");
      console.log("   - Credit available (công nợ vượt hạn mức chưa)");
      console.log("   - Phân bổ VIN từ InStock → Allocated");

      const response = await purchaseOrderApiService.confirmPurchaseOrder(poId);

      console.log("✅ Backend response:", response);

      alert(
        "✅ Xác nhận đơn hàng thành công!\n\n" +
          "✓ Đã kiểm tra kho VIN\n" +
          "✓ Đã kiểm tra hạn mức công nợ\n" +
          "✓ Đã phân bổ VIN cho đơn hàng\n" +
          "✓ Trạng thái: Submit → Confirmed"
      );

      // Đóng modal và reload danh sách
      setShowDetailModal(false);
      setSelectedOrder(null);
      await loadOrders();

      // Chuyển sang tab "Đã xác nhận"
      setActiveTab("confirm");
    } catch (err) {
      console.error("❌ Error confirming PO:", err);

      // Phân tích lỗi từ backend
      let errorMessage = "Vui lòng thử lại";

      if (err.response?.data) {
        const errorData = err.response.data;

        // Nếu backend trả về array errors
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join("\n");
        }
        // Nếu backend trả về string
        else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
        // Nếu có message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(
        "❌ Không thể xác nhận đơn hàng!\n\n" +
          "Lý do:\n" +
          errorMessage +
          "\n\n" +
          "Các nguyên nhân có thể:\n" +
          "• Kho VIN không đủ số lượng\n" +
          "• Hạn mức công nợ bị vượt quá\n" +
          "• Trạng thái đơn hàng không phải 'Submit'\n" +
          "• Đơn hàng không có sản phẩm"
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleCreateInvoice = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.PoId || selectedOrder.poId;
      const dealerId = selectedOrder.DealerId || selectedOrder.dealerId;

      console.log(`📄 Creating Invoice B2B for PO ID: ${poId}`);

      const response = await purchaseOrderApiService.createInvoiceForPO(
        poId,
        dealerId
      );

      console.log("✅ Invoice created:", response);

      alert(
        "✅ Tạo Invoice B2B thành công!\n\n" +
          "✓ Đã tạo hóa đơn cho đơn hàng\n" +
          "✓ Đã cập nhật công nợ dealer\n" +
          "✓ Bây giờ có thể vận chuyển đơn hàng"
      );

      // Reload để cập nhật hasInvoice
      await loadOrders();

      // Reload lại selectedOrder để có hasInvoice = true
      const updatedOrders = orders.find((o) => (o.PoId || o.poId) === poId);
      if (updatedOrders) {
        setSelectedOrder({
          ...selectedOrder,
          HasInvoice: true,
          hasInvoice: true,
        });
      }
    } catch (err) {
      console.error("❌ Error creating invoice:", err);

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

      alert(
        "❌ Không thể tạo invoice!\n\n" +
          "Lý do:\n" +
          errorMessage +
          "\n\n" +
          "Các nguyên nhân có thể:\n" +
          "• PO chưa được Confirm\n" +
          "• VIN chưa được Allocated đủ\n" +
          "• Đã có Invoice rồi"
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleDelivery = async () => {
    if (!selectedOrder) return;

    try {
      setConfirming(true);
      const poId = selectedOrder.PoId || selectedOrder.poId;

      console.log(`🚚 Issuing delivery for PO ID: ${poId}`);

      const response = await purchaseOrderApiService.issueDelivery(poId);

      console.log("✅ Delivery issued:", response);

      alert(
        "✅ Vận chuyển đơn hàng thành công!\n\n" +
          "✓ VIN đã chuyển từ Allocated → InTransit\n" +
          "✓ Đơn hàng đang được vận chuyển đến dealer\n" +
          "✓ Dealer sẽ xác nhận nhận hàng sau khi nhận được"
      );

      // Đóng modal và reload danh sách
      setShowDetailModal(false);
      setSelectedOrder(null);
      await loadOrders();

      // Chuyển sang tab "InTransit"
      setActiveTab("intransit");
    } catch (err) {
      console.error("❌ Error issuing delivery:", err);

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

      alert(
        "❌ Không thể vận chuyển đơn hàng!\n\n" +
          "Lý do:\n" +
          errorMessage +
          "\n\n" +
          "Các nguyên nhân có thể:\n" +
          "• Chưa có invoice B2B\n" +
          "• Không có VIN đang Allocated\n" +
          "• Trạng thái PO không phải Confirm"
      );
    } finally {
      setConfirming(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Draft: "draft",
      Submit: "submit",
      Confirm: "confirm",
      InTransit: "intransit",
      Delivery: "delivery",
      Reject: "reject",
      Cancel: "cancel",
    };
    return statusMap[status] || "default";
  };

  const getStatusText = (status) => {
    const textMap = {
      Draft: "Nháp",
      Submit: "Đã gửi",
      Confirm: "Đã xác nhận",
      InTransit: "Đang vận chuyển",
      Delivery: "Đã giao hàng",
      Reject: "Từ chối",
      Cancel: "Đã hủy",
    };
    return textMap[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="evm-staff-order-tracking">
        <div className="evm-staff-page-header">
          <h1>Theo dõi đơn hàng</h1>
          <p>Giám sát và xác nhận đơn hàng từ đại lý</p>
        </div>
        <div className="loading-state">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Filter orders based on active tab and invoice filter
  const filteredOrders = orders.filter((order) => {
    const status = (order.Status || order.status || "").toLowerCase();

    // Filter by status tab
    let statusMatch = false;
    if (activeTab === "confirm") {
      statusMatch = status === "confirm";
    } else if (activeTab === "intransit") {
      statusMatch = status === "intransit";
    } else {
      // delivery tab
      statusMatch = status === "delivery" || status === "delivered";
    }

    if (!statusMatch) return false;

    // Filter by invoice status
    const hasInvoice = order.hasInvoice || order.HasInvoice || false;
    if (invoiceFilter === "has") {
      return hasInvoice;
    } else if (invoiceFilter === "none") {
      return !hasInvoice;
    }

    // "all" - no invoice filter
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  const handleInvoiceFilterChange = (filter) => {
    setInvoiceFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="evm-staff-order-tracking">
      <div className="evm-staff-page-header">
        <h1>Theo dõi đơn hàng</h1>
        <p>Giám sát và xác nhận đơn hàng từ đại lý</p>
      </div>

      <div className="orders-table-section">
        <div className="table-header">
          <h3>Danh sách đơn hàng ({filteredOrders.length})</h3>
          <div className="filter-group">
            <label htmlFor="status-filter">Trạng thái:</label>
            <select
              id="status-filter"
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="status-filter-select"
            >
              <option value="confirm">Đã xác nhận (Confirm)</option>
              <option value="intransit">Đang vận chuyển (InTransit)</option>
              <option value="delivery">Đã giao hàng (Delivery)</option>
            </select>
            <label htmlFor="invoice-filter" style={{ marginLeft: "16px" }}>
              Hóa đơn:
            </label>
            <select
              id="invoice-filter"
              value={invoiceFilter}
              onChange={(e) => handleInvoiceFilterChange(e.target.value)}
              className="status-filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="has">Đã có hóa đơn</option>
              <option value="none">Chưa có hóa đơn</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {/* Table Header */}
          <div className="table-header-row">
            <div className="table-header-cell">Mã đơn</div>
            <div className="table-header-cell">Đại lý</div>
            <div className="table-header-cell">Ngày tạo</div>
            <div className="table-header-cell">Số tiền</div>
            <div className="table-header-cell">Trạng thái</div>
            <div className="table-header-cell">Thao tác</div>
          </div>

          {/* Table Rows */}
          <div className="table-rows">
            {paginatedOrders.map((order) => (
              <div key={order.PoId || order.poId} className="table-row">
                <div className="table-cell">
                  <span className="cell-content">
                    PO-{order.PoId || order.poId}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="cell-content">
                    Dealer {order.DealerId || order.dealerId || "N/A"}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="cell-content">
                    {formatDate(order.CreateAt || order.createAt)}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="cell-content amount">
                    {formatCurrency(
                      order.TotalAmount ||
                        order.totalAmount ||
                        order.Total ||
                        order.total
                    )}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="status-container">
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        order.Status || order.status
                      )}`}
                    >
                      {getStatusText(order.Status || order.status)}
                    </span>
                    {(order.hasInvoice || order.HasInvoice) && (
                      <span className="invoice-badge">✅ Đã có hóa đơn</span>
                    )}
                  </div>
                </div>
                <div className="table-cell">
                  <button
                    className="order-action-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="no-data">
              <p>
                {activeTab === "confirm"
                  ? "Không có đơn hàng đã xác nhận"
                  : activeTab === "intransit"
                  ? "Không có đơn hàng đang vận chuyển"
                  : "Không có đơn hàng đã giao"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Hiển thị {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredOrders.length)} của{" "}
              {filteredOrders.length} đơn hàng
            </div>
            <div className="pagination-controls">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Thông tin đơn hàng */}
              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">MÃ ĐƠN HÀNG:</span>
                    <span className="value">
                      PO-{selectedOrder.PoId || selectedOrder.poId}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ĐẠI LÝ:</span>
                    <span className="value">
                      Dealer{" "}
                      {selectedOrder.DealerId ||
                        selectedOrder.dealerId ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">NGÀY TẠO:</span>
                    <span className="value">
                      {formatDate(
                        selectedOrder.CreateAt || selectedOrder.createAt
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">SỐ TIỀN:</span>
                    <span className="value">
                      {formatCurrency(
                        selectedOrder.TotalAmount ||
                          selectedOrder.totalAmount ||
                          0
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">TRẠNG THÁI:</span>
                    <span className="value">
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          selectedOrder.Status || selectedOrder.status
                        )}`}
                      >
                        {getStatusText(
                          selectedOrder.Status || selectedOrder.status
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">NGÀY DỰ KIẾN:</span>
                    <span className="value">
                      {selectedOrder.ExpectedDate
                        ? formatDate(selectedOrder.ExpectedDate)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {/* Buttons cho PO Status = Confirm */}
              {(selectedOrder.Status === "Confirm" ||
                selectedOrder.status === "Confirm") && (
                <>
                  {/* Nút Tạo Invoice - chỉ hiển thị khi chưa có Invoice */}
                  {!(selectedOrder.HasInvoice || selectedOrder.hasInvoice) && (
                    <button
                      className="invoice-action-btn"
                      onClick={handleCreateInvoice}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <span className="spinner"></span>
                          Đang tạo Invoice...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <path d="M14 2v6h6"></path>
                            <path d="M16 13H8"></path>
                            <path d="M16 17H8"></path>
                            <path d="M10 9H8"></path>
                          </svg>
                          Tạo Invoice B2B
                        </>
                      )}
                    </button>
                  )}

                  {/* Nút Vận chuyển - chỉ hiển thị khi đã có Invoice */}
                  {(selectedOrder.HasInvoice || selectedOrder.hasInvoice) && (
                    <button
                      className="delivery-action-btn"
                      onClick={handleDelivery}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <span className="spinner"></span>
                          Đang vận chuyển...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          Vận chuyển đơn hàng
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
