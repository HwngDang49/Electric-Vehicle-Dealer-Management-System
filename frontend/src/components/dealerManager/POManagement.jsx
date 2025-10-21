import React, { useState } from "react";
import CreatePOForm from "./CreatePOForm";
import "./POManagement.css";

const POManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const itemsPerPage = 5;

  // Status Management - Easy to maintain and update
  const statusConfig = {
    submit: {
      text: "Submit",
      className: "submit",
      color: "#28a745",
    },
    // Easy to add more statuses:
    // pending: { text: "Pending", className: "pending", color: "#ffc107" },
    // approved: { text: "Approved", className: "approved", color: "#17a2b8" }
  };

  // Get status info - centralized status management
  const getStatusInfo = (status = "submit") => {
    return statusConfig[status] || statusConfig.submit;
  };

  // Render status badge component - reusable and maintainable
  const renderStatusBadge = (status = "submit") => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Filter and search logic
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productId &&
        order.productId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.product &&
        order.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.contactPerson &&
        order.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Reset to first page when search term or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCreatePO = () => {
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleSubmitOrder = (orderData) => {
    console.log("Creating new PO:", orderData);

    // Generate unique PO ID
    const poId = `PO-${Date.now()}`;

    // Create new purchase order object with detailed information
    const newOrder = {
      id: poId,
      productId: orderData.selectedItems.map((item) => item.id).join("-"),
      product: orderData.selectedItems
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", "),
      quantity: orderData.selectedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      totalAmount: "₫" + orderData.totalAmount.toLocaleString(),
      contactPerson: orderData.contactPerson || "Chưa xác định",
      orderDate: new Date().toLocaleDateString("vi-VN"),
      status: "pending",
      statusText: "Chờ xử lý",
      priority: "medium",
      // Store detailed information for modal
      details: {
        dealerInfo: {
          dealerName: orderData.dealerName || "",
          contactPerson: orderData.contactPerson || "",
          phone: orderData.phone || "",
          email: orderData.email || "",
          address: orderData.address || "",
          notes: orderData.notes || "",
        },
        selectedItems: orderData.selectedItems || [],
        totalAmount: orderData.totalAmount || 0,
        orderDate: new Date().toLocaleDateString("vi-VN"),
        expectedDelivery: orderData.expectedDelivery || "",
      },
    };

    // Add new order to the list
    setPurchaseOrders((prevOrders) => [newOrder, ...prevOrders]);

    // Close form and show success notification
    setShowCreateForm(false);
    setSuccessMessage(`Đơn đặt hàng ${poId} đã được tạo thành công!`);
    setShowSuccessNotification(true);

    // Auto hide notification after 5 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  // If showing create form, render only the form
  if (showCreateForm) {
    return (
      <CreatePOForm onClose={handleCloseForm} onSubmit={handleSubmitOrder} />
    );
  }

  return (
    <div className="po-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý đơn đặt hàng</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các đơn đặt hàng từ hãng
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-filter-left">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm đơn đặt hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
        </div>
        <button className="add-po-btn" onClick={handleCreatePO}>
          + Tạo đơn đặt hàng mới
        </button>
      </div>

      {/* Purchase Orders List */}
      <div className="po-list-container">
        <div className="po-list-header">
          <h2 className="list-title">
            Danh sách đơn đặt hàng ({filteredOrders.length})
          </h2>
        </div>

        <div className="po-list-content">
          {/* PO Table Header - Always visible */}
          <div className="po-table-container">
            <div className="po-table-header">
              <div className="table-cell" data-column="1">
                PO ID
              </div>
              <div className="table-cell" data-column="2">
                Unit Wholesale
              </div>
              <div className="table-cell" data-column="3">
                Line Total
              </div>
              <div className="table-cell" data-column="4">
                Quantity
              </div>
              <div className="table-cell" data-column="5">
                Status
              </div>
              <div className="table-cell" data-column="6">
                Action
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">Không tìm thấy đơn đặt hàng</h3>
                <p className="empty-description">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <>
                <div className="po-table-rows">
                  {currentOrders.map((order) => {
                    // Tính toán Unit Wholesale từ Line Total và Quantity
                    const lineTotalAmount = parseInt(
                      (order.lineTotal || order.totalAmount).replace(
                        /[₫,]/g,
                        ""
                      )
                    );
                    const quantity = order.quantity || 1;
                    const unitWholesale =
                      quantity > 0 ? lineTotalAmount / quantity : 0;

                    return (
                      <div key={order.id} className="po-table-row">
                        <div className="table-cell" data-column="1">
                          <span className="po-id">{order.id}</span>
                        </div>
                        <div className="table-cell amount" data-column="2">
                          ₫{unitWholesale.toLocaleString("vi-VN")}
                        </div>
                        <div className="table-cell amount" data-column="3">
                          {order.lineTotal || order.totalAmount}
                        </div>
                        <div className="table-cell" data-column="4">
                          {quantity}
                        </div>
                        <div className="table-cell" data-column="5">
                          {renderStatusBadge()}
                        </div>
                        <div className="table-cell actions" data-column="6">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewDetails(order)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Hiển thị {startIndex + 1}-
                      {Math.min(endIndex, filteredOrders.length)} trong tổng số{" "}
                      {filteredOrders.length} đơn hàng
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                        Trước
                      </button>

                      <div className="pagination-numbers">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNum = index + 1;
                          // Show first page, last page, current page, and pages around current
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 &&
                              pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                className={`pagination-number ${
                                  currentPage === pageNum ? "active" : ""
                                }`}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return (
                              <span
                                key={pageNum}
                                className="pagination-ellipsis"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="detail-modal-overlay">
          <div className="detail-modal-container">
            <div className="detail-modal-header">
              <h2 className="detail-modal-title">Chi tiết đơn đặt hàng</h2>
              <button
                className="detail-modal-close"
                onClick={handleCloseDetailModal}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-content">
              {/* Order Info */}
              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin đơn hàng</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <label>PO ID:</label>
                    <span>{selectedOrder.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Product ID:</label>
                    <span>
                      {selectedOrder.productNumber ||
                        Math.floor(Math.random() * 10000) + 1000}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ngày tạo:</label>
                    <span>{selectedOrder.orderDate}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Trạng thái:</label>
                    {renderStatusBadge()}
                  </div>
                </div>
              </div>

              {/* Dealer Info */}
              {selectedOrder.details && selectedOrder.details.dealerInfo && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Thông tin đại lý</h3>
                  <div className="detail-info-grid">
                    <div className="detail-info-item">
                      <label>Tên đại lý:</label>
                      <span>{selectedOrder.details.dealerInfo.dealerName}</span>
                    </div>
                    <div className="detail-info-item">
                      <label>Người liên hệ:</label>
                      <span>
                        {selectedOrder.details.dealerInfo.contactPerson}
                      </span>
                    </div>
                    <div className="detail-info-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedOrder.details.dealerInfo.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Items */}
              {selectedOrder.details && selectedOrder.details.selectedItems && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Sản phẩm đã chọn</h3>
                  <div className="detail-items-list">
                    {selectedOrder.details.selectedItems.map((item, index) => (
                      <div key={index} className="detail-item-card">
                        <div className="detail-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="detail-item-info">
                          <h4 className="detail-item-name">{item.name}</h4>
                          <p className="detail-item-category">
                            {item.category}
                          </p>
                          <div className="detail-item-specs">
                            <span>Phạm vi: {item.specs.range}</span>
                            <span>Ghế: {item.specs.seats}</span>
                            <span>Pin: {item.specs.battery}</span>
                          </div>
                        </div>
                        <div className="detail-item-quantity">
                          <span className="quantity-label">Số lượng:</span>
                          <span className="quantity-value">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="detail-item-price">
                          <span className="price-label">Giá:</span>
                          <span className="price-value">{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="detail-section">
                <h3 className="detail-section-title">Tổng kết đơn hàng</h3>
                <div className="detail-summary">
                  <div className="summary-row">
                    <span>Quantity:</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="summary-row">
                    <span>Unit Wholesale:</span>
                    <span className="total-amount">
                      {(() => {
                        const lineTotalAmount = parseInt(
                          (
                            selectedOrder.lineTotal || selectedOrder.totalAmount
                          ).replace(/[₫,]/g, "")
                        );
                        const quantity = selectedOrder.quantity || 1;
                        const unitWholesale =
                          quantity > 0 ? lineTotalAmount / quantity : 0;
                        return `₫${unitWholesale.toLocaleString("vi-VN")}`;
                      })()}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Line Total:</span>
                    <span className="total-amount">
                      {selectedOrder.lineTotal || selectedOrder.totalAmount}
                    </span>
                  </div>
                  {selectedOrder.details &&
                    selectedOrder.details.dealerInfo &&
                    selectedOrder.details.dealerInfo.deliveryDate && (
                      <div className="summary-row">
                        <span>Ngày giao hàng mong muốn:</span>
                        <span>
                          {selectedOrder.details.dealerInfo.deliveryDate}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="success-notification">
          <div className="notification-content">
            <div className="notification-icon">✅</div>
            <div className="notification-message">{successMessage}</div>
            <button
              className="notification-close"
              onClick={() => setShowSuccessNotification(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POManagement;
