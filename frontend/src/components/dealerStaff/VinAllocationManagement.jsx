import React, { useState } from "react";
import "./VinAllocationManagement.css";
import VinAllocationDetail from "./VinAllocationDetail";
import CustomDropdown from "./CustomDropdown";

const VinAllocationManagement = ({
  orders = [],
  onUpdateOrderStatus,
  onNavigateToDelivery,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // Status options for dropdown
  const statusOptions = [
    { value: "Tất cả", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Allocated", label: "Đã phân bổ VIN", icon: "✅" },
  ];

  // Filter orders to show only Allocated orders (already allocated with VIN)
  const filteredOrders = orders
    .filter((order) => order.statusType === "allocated")
    .filter((order) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleAllocateVin = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleAllocateSuccess = (orderId, selectedVin) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, "Allocated", "allocated", selectedVin);
    }
    setSelectedOrder(null);
  };

  // If an Allocated order is selected, show fullscreen VIN allocation detail page
  if (selectedOrder && selectedOrder.statusType === "allocated") {
    return (
      <VinAllocationDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onAllocateSuccess={handleAllocateSuccess}
        onNavigateToDelivery={onNavigateToDelivery}
      />
    );
  }

  return (
    <div className="vin-allocation-management">
      <div className="page-header">
        <h1>Phân bổ VIN</h1>
        <p className="page-description">Danh sách đơn hàng đã được phân bổ VIN</p>
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
              <th>VIN</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
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
                      {order.vehicle?.name || "N/A"}
                    </div>
                    <div className="vehicle-color">
                      {order.vehicle?.color || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="vin-number">{order.vin || "-"}</div>
                  </td>
                  <td>
                    <span className="status-badge status-allocated">
                      Đã phân bổ VIN
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-detail-btn"
                      onClick={() => handleAllocateVin(order)}
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
    </div>
  );
};

export default VinAllocationManagement;
