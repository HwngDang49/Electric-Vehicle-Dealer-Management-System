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

  // Filter orders to show Pending and Allocated orders
  const filteredOrders = orders.filter(
    (order) =>
      order.statusType === "pending" || order.statusType === "allocated"
  );

  console.log("VinAllocationManagement received orders:", orders);
  console.log(
    "VinAllocationManagement filtered orders (pending and allocated):",
    filteredOrders
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
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

  // If a Pending order is selected, show fullscreen VIN allocation detail page
  if (selectedOrder && selectedOrder.statusType === "pending") {
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
            {filteredOrders.length === 0 ? (
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
                  <h3>Chưa có đơn hàng nào</h3>
                  <p>Đơn hàng sẽ được hiển thị ở đây khi có dữ liệu thực tế.</p>
                </div>
              </div>
            ) : (
              filteredOrders.map((order) => (
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
                    {order.statusType === "pending" ? (
                      <button
                        className="action-btn allocate-btn"
                        onClick={() => handleAllocateVin(order)}
                      >
                        Phân bổ VIN
                      </button>
                    ) : (
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(order)}
                      >
                        Xem chi tiết
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
                          <span>nguyenvanan@email.com</span>
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
