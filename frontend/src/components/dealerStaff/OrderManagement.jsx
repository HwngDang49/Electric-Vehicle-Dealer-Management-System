import React, { useState } from "react";
import "./OrderManagement.css";
import OrderDetailView from "./OrderDetailView";
import CustomDropdown from "./CustomDropdown";

const OrderManagement = ({
  onNavigateToVinAllocation,
  orders = [],
  onContractCreated,
  onPaymentSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // Format currency function
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Status options for dropdown
  const statusOptions = [
    { value: "Tất cả", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Draft", label: "Nháp", icon: "📝" },
    { value: "Pending", label: "Chờ xử lý", icon: "⏳" },
    { value: "Confirmed", label: "Đã xác nhận", icon: "✅" },
  ];

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      Confirmed: { text: "Đã xác nhận", class: "status-confirmed" },
      Pending: { text: "Chờ xử lý", class: "status-pending" },
      Draft: { text: "Nháp", class: "status-draft" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Filter orders based on search and active filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicle?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "Tất cả" || order.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  const handleViewDetails = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleCloseDetailView = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="order-management">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
      </div>

      <div className="management-toolbar">
        <div className="search-section">
          <div className="search-bar">
            <button className="search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng theo mã, khách hàng, xe..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <CustomDropdown
            value={activeFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            minWidth="220px"
          />
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {orders.length === 0
                    ? "Chưa có đơn hàng nào"
                    : "Không tìm thấy đơn hàng nào"}
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">#{order.backendId || order.id}</span>
                  </td>
                  <td>
                    <div className="customer-name">
                      {order.customer?.name || "N/A"}
                    </div>
                    <div className="customer-phone">
                      {order.customer?.phone || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-name">
                      {order.vehicle.name || "N/A"}
                    </div>
                    <div className="vehicle-color">
                      {order.vehicle.color || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="amount">
                      {formatCurrency(order.amount)}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <button
                      className="view-detail-btn"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
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
                    <span key={pageNum} className="pagination-ellipsis">
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

      {/* Order Detail View Modal */}
      {selectedOrder && (
        <OrderDetailView
          order={
            orders.find((order) => order.id === selectedOrder.id) ||
            selectedOrder
          }
          onClose={handleCloseDetailView}
          onNavigateToVinAllocation={onNavigateToVinAllocation}
          onContractCreated={onContractCreated}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
};

export default OrderManagement;
