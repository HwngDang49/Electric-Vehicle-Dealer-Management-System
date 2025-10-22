import React, { useState, useEffect } from "react";
import "./VinAllocationManagement.css";
import VinAllocationDetail from "./VinAllocationDetail"; // For Pending orders' VIN allocation

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

  // Filter orders to show only Confirmed orders (ready for VIN allocation)
  // Exclude Draft (not confirmed yet) and Allocated (already has VIN)
  let filteredOrders = orders.filter(
    (order) => order.statusType === "confirmed"
  );

  // Apply search filter
  if (searchQuery.trim()) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.vehicle?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter
  if (activeFilter !== "Tất cả") {
    filteredOrders = filteredOrders.filter(
      (order) => order.statusType === activeFilter.toLowerCase()
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  console.log("VinAllocationManagement received orders:", orders);
  console.log(
    "Orders status breakdown:",
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      statusType: o.statusType,
    }))
  );
  console.log(
    "VinAllocationManagement filtered orders (Confirmed only):",
    filteredOrders
  );
  console.log("Confirmed orders count:", filteredOrders.length);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle Pending orders - Navigate to VIN allocation detail page
  const handleAllocateVin = (order) => {
    console.log(
      "VinAllocationManagement handleAllocateVin called with order:",
      order
    );
    setSelectedOrder(order);
  };

  // Handle Allocated orders - Show modal detail view
  const handleViewDetails = (order) => {
    console.log(
      "VinAllocationManagement handleViewDetails called with order:",
      order
    );
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleAllocateSuccess = (orderId, selectedVin) => {
    console.log(
      `VIN allocation successful for order ${orderId} with VIN ${selectedVin}`
    );
    // Update order status to allocated
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, "Allocated", "allocated", selectedVin);
    }
    setSelectedOrder(null); // Go back to list after allocation
  };

  // If a Confirmed order is selected, show fullscreen VIN allocation detail page
  if (selectedOrder && selectedOrder.statusType === "confirmed") {
    return (
      <VinAllocationDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onAllocateSuccess={handleAllocateSuccess}
        onNavigateToDelivery={(orderData) => {
          console.log("Navigating to delivery with order:", orderData);
          if (onNavigateToDelivery) {
            onNavigateToDelivery(orderData);
          }
        }}
      />
    );
  }

  // If an Allocated order is selected, show fullscreen VIN allocation detail page (readonly mode)
  if (selectedOrder && selectedOrder.statusType === "allocated") {
    return (
      <VinAllocationDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onAllocateSuccess={handleAllocateSuccess}
        onNavigateToDelivery={(orderData) => {
          console.log("Navigating to delivery with order:", orderData);
          if (onNavigateToDelivery) {
            onNavigateToDelivery(orderData);
          }
        }}
      />
    );
  }

  return (
    <div className="vin-allocation-management">
      <div className="vin-allocation-content">
        {/* Header Section */}
        <div className="vin-allocation-header">
          <div className="header-content">
            <h1>Phân bổ VIN</h1>
            <p>Quản lý và phân bổ số VIN cho các đơn hàng</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="vin-allocation-list-header">
          <h2>Danh sách đơn hàng</h2>
          <div className="vin-allocation-list-actions">
            <div className="vin-allocation-search-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, mã đơn hàng..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="vin-allocation-filter-tabs">
              <button
                className={`vin-allocation-filter-tab ${
                  activeFilter === "Tất cả" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Tất cả")}
              >
                Tất cả
              </button>
              <button
                className={`vin-allocation-filter-tab ${
                  activeFilter === "Pending" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Pending")}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="vin-allocation-table">
          <div className="vin-allocation-table-header">
            <div className="col-order-id">Order ID</div>
            <div className="col-customer">Customer</div>
            <div className="col-item">Item</div>
            <div className="col-vin">VIN</div>
            <div className="col-backorder">Backorder</div>
            <div className="col-eta">ETA</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Action</div>
          </div>
          <div className="vin-allocation-table-body">
            {currentOrders.length === 0 ? (
              <div className="no-orders">
                <div className="no-orders-content">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                  </svg>
                  <h3>
                    {filteredOrders.length === 0
                      ? "Chưa có đơn hàng nào"
                      : "Không tìm thấy đơn hàng"}
                  </h3>
                  <p>
                    {filteredOrders.length === 0
                      ? "Đơn hàng sẽ được hiển thị ở đây khi có dữ liệu thực tế."
                      : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
                  </p>
                </div>
              </div>
            ) : (
              currentOrders.map((order) => (
                <div key={order.id} className="vin-allocation-table-row">
                  <div className="col-order-id">
                    <span className="order-id">{order.id}</span>
                  </div>
                  <div className="col-customer">
                    <div className="customer-info">
                      <div className="customer-name">
                        {order.customer?.name || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-item">
                    <div className="item-info">
                      <div className="item-name">
                        {order.vehicle?.name || order.item?.name || "N/A"}
                      </div>
                      <div className="item-color">
                        {order.vehicle?.color || order.item?.color || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-vin">
                    <span className="vin-number">{order.vin || "-"}</span>
                  </div>
                  <div className="col-backorder">
                    <span className="backorder-info">-</span>
                  </div>
                  <div className="col-eta">
                    <span className="eta-info">-</span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${order.statusType}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-btn allocate-btn"
                      onClick={() => handleAllocateVin(order)}
                    >
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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

        {/* For Allocated orders - Show modal detail view (overlay) */}
        {selectedOrder && selectedOrder.statusType === "allocated" && (
          <div className="modal-overlay">
            <div className="modal-detail-container">
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button className="close-btn" onClick={handleBackToList}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-grid">
                  {/* Left Column */}
                  <div className="modal-left-column">
                    {/* Customer Information */}
                    <div className="modal-section">
                      <h3>Thông tin khách hàng</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Tên khách hàng</label>
                          <span>{selectedOrder.customer.name}</span>
                        </div>
                        <div className="info-item">
                          <label>Số điện thoại</label>
                          <span>{selectedOrder.customer.phone}</span>
                        </div>
                        <div className="info-item">
                          <label>Email</label>
                          <span>{selectedOrder.customer?.email || "N/A"}</span>
                        </div>
                        <div className="info-item">
                          <label>Ngày đặt hàng</label>
                          <span>{selectedOrder.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="modal-section">
                      <h3>Thông tin xe</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Dòng xe</label>
                          <span>
                            {selectedOrder.vehicle?.name ||
                              selectedOrder.item?.name ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="info-item">
                          <label>Màu sắc</label>
                          <span>
                            {selectedOrder.vehicle?.color ||
                              selectedOrder.item?.color ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="info-item">
                          <label>Tổng giá trị</label>
                          <span className="total-amount">
                            {selectedOrder.amount} ₫
                          </span>
                        </div>
                        <div className="info-item">
                          <label>Trạng thái</label>
                          <span
                            className={`status-badge ${selectedOrder.statusType}`}
                          >
                            {selectedOrder.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="modal-right-column">
                    {/* VIN Allocation Information */}
                    <div className="modal-section">
                      <h3>VIN đã phân bổ</h3>
                      <div className="vin-allocation-info">
                        <div className="vin-allocation-box">
                          <div className="vin-header">
                            <span className="vin-code">
                              {selectedOrder.vin}
                            </span>
                            <span className="vin-status allocated">
                              Đã phân bổ
                            </span>
                          </div>
                          <div className="vin-details">
                            <div className="vin-vehicle">
                              {selectedOrder.vehicle?.name ||
                                selectedOrder.item?.name ||
                                "N/A"}{" "}
                              -{" "}
                              {selectedOrder.vehicle?.color ||
                                selectedOrder.item?.color ||
                                "N/A"}
                            </div>
                            <div className="vin-date">
                              Ngày phân bổ:{" "}
                              {new Date().toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VinAllocationManagement;
