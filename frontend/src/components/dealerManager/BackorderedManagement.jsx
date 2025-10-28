import React, { useState, useEffect, useRef } from "react";
import "./BackorderedManagement.css";
import { useToast } from "../../contexts/useToast";

const BackorderedManagement = () => {
  const toast = useToast();
  const hasShownToast = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [backorderedOrders, setBackorderedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Status Management
  const statusConfig = {
    Pending: {
      text: "Chờ xử lý",
      className: "pending",
      color: "#ffc107",
    },
    InProcess: {
      text: "Đang xử lý",
      className: "inprocess",
      color: "#17a2b8",
    },
    Fulfilled: {
      text: "Đã hoàn thành",
      className: "fulfilled",
      color: "#28a745",
    },
    Cancelled: {
      text: "Đã hủy",
      className: "cancelled",
      color: "#dc3545",
    },
  };

  const getStatusInfo = (status = "Pending") => {
    return statusConfig[status] || statusConfig.Pending;
  };

  const renderStatusBadge = (status = "Pending") => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      High: { className: "high", color: "#dc3545" },
      Medium: { className: "medium", color: "#ffc107" },
      Low: { className: "low", color: "#28a745" },
    };
    const config = priorityConfig[priority] || priorityConfig.Medium;
    return (
      <span className={`priority-badge ${config.className}`}>{priority}</span>
    );
  };

  // Load backordered orders
  useEffect(() => {
    const loadBackorderedOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        // const response = await backorderedApiService.getBackorderedOrders();
        // setBackorderedOrders(response.data || []);

        // Temporary: Set empty array
        setBackorderedOrders([]);

        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.info("Chưa có dữ liệu đơn hàng backordered", {
            title: "Thông báo",
            duration: 3000,
          });
        }
      } catch (err) {
        const errorMsg = "Không thể tải danh sách đơn hàng backordered.";
        setError(errorMsg);
        toast.error(errorMsg, {
          title: "Lỗi tải dữ liệu",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadBackorderedOrders();
  }, [toast]);

  // Filter and search logic
  const filteredOrders = backorderedOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());

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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="backordered-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý Backordered</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các đơn hàng backordered của khách hàng
        </p>
      </div>

      <div className="search-filter-section">
        <div className="search-filter-left">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
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
              <option value="Pending">Chờ xử lý</option>
              <option value="InProcess">Đang xử lý</option>
              <option value="Fulfilled">Đã hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="backordered-list-container">
        <div className="backordered-list-header">
          <h2 className="list-title">
            Danh sách Backordered ({filteredOrders.length})
          </h2>
        </div>

        <div className="backordered-list-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách đơn hàng...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="backordered-table-container">
              <div className="backordered-table-header">
                <div className="table-cell" data-column="1">
                  PO ID
                </div>
                <div className="table-cell" data-column="2">
                  Line Total
                </div>
                <div className="table-cell" data-column="3">
                  Quantity
                </div>
                <div className="table-cell" data-column="4">
                  Status
                </div>
                <div className="table-cell" data-column="5">
                  Action
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3 className="empty-title">Không tìm thấy đơn hàng</h3>
                  <p className="empty-description">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="backordered-table-rows">
                    {currentOrders.map((order) => (
                      <div key={order.id} className="backordered-table-row">
                        <div className="table-cell" data-column="1">
                          <span className="order-id">
                            {order.poId || order.id}
                          </span>
                        </div>
                        <div className="table-cell amount" data-column="2">
                          {formatPrice(order.lineTotal || 0)}
                        </div>
                        <div className="table-cell" data-column="3">
                          <span>{order.quantity || 0}</span>
                        </div>
                        <div className="table-cell" data-column="4">
                          {renderStatusBadge(order.status)}
                        </div>
                        <div className="table-cell actions" data-column="5">
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

                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        Hiển thị {startIndex + 1}-
                        {Math.min(endIndex, filteredOrders.length)} trong tổng
                        số {filteredOrders.length} đơn hàng
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
          )}
        </div>
      </div>

      {showDetailModal && selectedOrder && (
        <div className="detail-modal-overlay">
          <div className="detail-modal-container">
            <div className="detail-modal-header">
              <h2 className="detail-modal-title">
                Chi tiết đơn hàng Backordered {selectedOrder.id}
              </h2>
              <button
                className="detail-modal-close"
                onClick={handleCloseDetailModal}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-content">
              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin đơn hàng</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <label>Mã Backorder:</label>
                    <span>{selectedOrder.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Mã Đơn hàng:</label>
                    <span>{selectedOrder.orderId}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Khách hàng:</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Sản phẩm:</label>
                    <span>{selectedOrder.productName}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Số lượng:</label>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ngày dự kiến:</label>
                    <span>{formatDate(selectedOrder.expectedDate)}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Ưu tiên:</label>
                    <span>{getPriorityBadge(selectedOrder.priority)}</span>
                  </div>
                  <div className="detail-info-item">
                    <label>Trạng thái:</label>
                    <span>{renderStatusBadge(selectedOrder.status)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackorderedManagement;
