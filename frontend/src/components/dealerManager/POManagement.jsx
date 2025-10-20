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

  // Filter and search logic
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "completed":
        return "status-completed";
      default:
        return "status-default";
    }
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
          <div className="list-actions">
            <button className="action-btn export">Xuất Excel</button>
            <button className="action-btn refresh">Làm mới</button>
          </div>
        </div>

        <div className="po-list-content">
          {/* PO Table Header - Always visible */}
          <div className="po-table-container">
            <div className="po-table-header">
              <div className="table-cell">PO ID</div>
              <div className="table-cell">Product ID</div>
              <div className="table-cell">Số lượng</div>
              <div className="table-cell">Tổng giá trị</div>
              <div className="table-cell">Người liên hệ</div>
              <div className="table-cell">Ngày tạo đơn</div>
              <div className="table-cell">Trạng thái</div>
              <div className="table-cell">Ưu tiên</div>
              <div className="table-cell">Action</div>
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
                  {currentOrders.map((order) => (
                    <div key={order.id} className="po-table-row">
                      <div className="table-cell">
                        <span className="po-id">{order.id}</span>
                      </div>
                      <div className="table-cell">{order.productId}</div>
                      <div className="table-cell">{order.quantity}</div>
                      <div className="table-cell amount">
                        {order.totalAmount}
                      </div>
                      <div className="table-cell">{order.contactPerson}</div>
                      <div className="table-cell date">{order.orderDate}</div>
                      <div className="table-cell">
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.statusText}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span
                          className={`priority-badge ${getPriorityBadgeClass(
                            order.priority
                          )}`}
                        >
                          {order.priority === "high"
                            ? "Cao"
                            : order.priority === "medium"
                            ? "Trung bình"
                            : "Thấp"}
                        </span>
                      </div>
                      <div className="table-cell actions">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewDetails(order)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
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
                    <label>Mã đơn hàng:</label>
                    <span>{selectedOrder.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ngày tạo:</label>
                    <span>{selectedOrder.orderDate}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Trạng thái:</label>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.statusText}
                    </span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ưu tiên:</label>
                    <span
                      className={`priority-badge ${getPriorityBadgeClass(
                        selectedOrder.priority
                      )}`}
                    >
                      {selectedOrder.priority === "high"
                        ? "Cao"
                        : selectedOrder.priority === "medium"
                        ? "Trung bình"
                        : "Thấp"}
                    </span>
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
                    <div className="detail-info-item">
                      <label>Email:</label>
                      <span>{selectedOrder.details.dealerInfo.email}</span>
                    </div>
                    <div className="detail-info-item full-width">
                      <label>Địa chỉ:</label>
                      <span>{selectedOrder.details.dealerInfo.address}</span>
                    </div>
                    {selectedOrder.details.dealerInfo.notes && (
                      <div className="detail-info-item full-width">
                        <label>Ghi chú:</label>
                        <span>{selectedOrder.details.dealerInfo.notes}</span>
                      </div>
                    )}
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
                    <span>Tổng số lượng sản phẩm:</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tổng giá trị đơn hàng:</span>
                    <span className="total-amount">
                      {selectedOrder.totalAmount}
                    </span>
                  </div>
                  {selectedOrder.details &&
                    selectedOrder.details.expectedDelivery && (
                      <div className="summary-row">
                        <span>Ngày giao hàng dự kiến:</span>
                        <span>{selectedOrder.details.expectedDelivery}</span>
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
