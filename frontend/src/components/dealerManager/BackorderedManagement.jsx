import React, { useState, useEffect } from "react";
import "./BackorderedManagement.css";
import { formatDate } from "../../services/poDataMapper";
import orderApiService from "../../services/orderApi";

const BackorderedManagement = ({ onNavigateToCreateOrder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [backorderedOrders, setBackorderedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchBackorderedOrders = async () => {
      try {
        setLoading(true);
        const response = await orderApiService.getOrdersByStatus("Backordered");
        if (Array.isArray(response?.data?.items)) {
          setBackorderedOrders(response.data.items);
        } else {
          setBackorderedOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBackorderedOrders();
  }, []);

  const filteredOrders = backorderedOrders.filter((order) => {
    const orderIdStr = order.orderId ? String(order.orderId).toLowerCase() : "";
    const productStr = order.productName ? order.productName.toLowerCase() : "";
    const matchesSearch =
      orderIdStr.includes(searchTerm.toLowerCase()) ||
      productStr.includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
              <option value="Draft">Nháp</option>
              <option value="Submit">Đã gửi</option>
              <option value="Confirm">Đã xác nhận</option>
              <option value="InTransit">Đang vận chuyển</option>
              <option value="Cancel">Đã hủy</option>
              <option value="Delivery">Đã giao hàng</option>
              <option value="Backordered">Đặt hàng lại</option>
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
              <div className="backordered-table-container">
                <div className="backordered-table-header">
                  <div className="table-cell" data-column="1">
                    Order ID
                  </div>
                  <div className="table-cell" data-column="2">
                    Sản phẩm
                  </div>
                  <div className="table-cell" data-column="3">
                    Số lượng
                  </div>
                  <div className="table-cell" data-column="4">
                    Ngày đặt
                  </div>
                  <div className="table-cell" data-column="5">
                    Trạng thái
                  </div>
                  <div className="table-cell" data-column="6">
                    Thao tác
                  </div>
                </div>
                <div className="backordered-table-rows">
                  {currentOrders.map((order) => {
                    const productName =
                      order.vehicleName ||
                      order.productName ||
                      order.product ||
                      "-";
                    const quantity =
                      order.quantity !== undefined ? order.quantity : 1;
                    const orderDate = order.createdAt
                      ? formatDate(order.createdAt)
                      : "-";
                    const orderId = order.orderId || order.id;
                    return (
                      <div key={orderId} className="backordered-table-row">
                        <div className="table-cell" data-column="1">
                          <span className="order-id">{orderId}</span>
                        </div>
                        <div className="table-cell" data-column="2">
                          <span>{productName}</span>
                        </div>
                        <div className="table-cell" data-column="3">
                          <span>{quantity}</span>
                        </div>
                        <div className="table-cell" data-column="4">
                          <span>{orderDate}</span>
                        </div>
                        <div className="table-cell" data-column="5">
                          <span>{order.status || "-"}</span>
                        </div>
                        <div className="table-cell actions" data-column="6">
                          <button
                            className="action-btn view"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {selectedOrder &&
                    (console.log("Chi tiết đơn:", selectedOrder),
                    (
                      <div className="detail-modal-overlay">
                        <div className="detail-modal-container">
                          <div className="detail-modal-header">
                            <h2 className="detail-modal-title">
                              Chi tiết đơn hàng Backordered
                            </h2>
                            <button
                              onClick={() => setSelectedOrder(null)}
                              className="detail-modal-close"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="detail-modal-content">
                            <div className="detail-info-grid">
                              <div className="detail-info-item">
                                <label>Mã đơn hàng:</label>
                                <span>
                                  {selectedOrder.orderId || selectedOrder.id}
                                </span>
                              </div>
                              <div className="detail-info-item">
                                <label>Đại lý:</label>
                                <span>
                                  {selectedOrder.dealerName ||
                                    selectedOrder.dealer ||
                                    "-"}
                                </span>
                              </div>
                              <div className="detail-info-item">
                                <label>Chi nhánh:</label>
                                <span>{selectedOrder.branchCode || "-"}</span>
                              </div>
                              <div className="detail-info-item">
                                <label>Khách hàng:</label>
                                <span>{selectedOrder.customerName || "-"}</span>
                              </div>
                              <div className="detail-info-item">
                                <label>Sản phẩm:</label>
                                <span>
                                  {selectedOrder.vehicleName ||
                                    selectedOrder.productName ||
                                    selectedOrder.product ||
                                    "-"}
                                </span>
                              </div>
                              <div className="detail-info-item">
                                <label>Số lượng:</label>
                                <span>
                                  {selectedOrder.quantity !== undefined
                                    ? selectedOrder.quantity
                                    : 1}
                                </span>
                              </div>
                              <div className="detail-info-item">
                                <label>Ngày đặt:</label>
                                <span>
                                  {selectedOrder.createdAt
                                    ? formatDate(selectedOrder.createdAt)
                                    : "-"}
                                </span>
                              </div>
                              <div className="detail-info-item">
                                <label>Trạng thái:</label>
                                <span>{selectedOrder.status || "-"}</span>
                              </div>
                              {selectedOrder.amount !== undefined && (
                                <div className="detail-info-item">
                                  <label>Giá trị:</label>
                                  <span>
                                    {selectedOrder.amount.toLocaleString()} VND
                                  </span>
                                </div>
                              )}
                              {selectedOrder.vehicleColor && (
                                <div className="detail-info-item">
                                  <label>Màu xe:</label>
                                  <span>{selectedOrder.vehicleColor}</span>
                                </div>
                              )}
                            </div>
                            <button
                              className="add-to-cart-btn"
                              style={{
                                marginTop: 24,
                                width: "100%",
                                padding: "12px 0",
                                border: "none",
                                borderRadius: 7,
                                background: "#1abc72",
                                color: "#fff",
                                fontSize: 17,
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 2px 12px rgba(32,201,151,0.13)",
                              }}
                              onClick={() => {
                                let cart =
                                  JSON.parse(localStorage.getItem("cart")) ||
                                  [];
                                cart.push({
                                  id: selectedOrder.orderId || selectedOrder.id,
                                  name:
                                    selectedOrder.productName ||
                                    selectedOrder.vehicleName ||
                                    selectedOrder.product,
                                  quantity: selectedOrder.quantity ?? 1,
                                  price: selectedOrder.amount,
                                  color: selectedOrder.vehicleColor,
                                });
                                localStorage.setItem(
                                  "cart",
                                  JSON.stringify(cart)
                                );
                                if (onNavigateToCreateOrder) {
                                  onNavigateToCreateOrder("Quản lý đơn hàng");
                                }
                              }}
                            >
                              Tạo đơn đặt hàng
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackorderedManagement;
