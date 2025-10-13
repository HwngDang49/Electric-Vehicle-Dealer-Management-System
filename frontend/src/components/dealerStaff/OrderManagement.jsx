import React, { useState } from "react";
import "./OrderManagement.css";
import OrderDetailView from "./OrderDetailView";

const OrderManagement = ({ onNavigateToVinAllocation, orders = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleViewDetails = (order) => {
    console.log("handleViewDetails called with order:", order);
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  // If an order is selected, show detail view
  if (selectedOrder) {
    console.log("Rendering OrderDetailView with selectedOrder:", selectedOrder);
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={handleBackToList}
        onNavigateToVinAllocation={onNavigateToVinAllocation}
      />
    );
  }

  return (
    <div className="order-management">
      <div className="order-content">
        {/* Header Section */}
        <div className="order-header">
          <div className="header-content">
            <h1>Quản lý đơn hàng</h1>
            <p>Theo dõi và quản lý tất cả đơn hàng của khách hàng</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="list-header">
          <h2>Danh sách đơn hàng</h2>
          <div className="list-actions">
            <div className="search-box">
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
                placeholder="Tìm kiếm theo tên khách hàng, số điện thoại hoặc mã đơn hàng..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${
                  activeFilter === "Tất cả" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Tất cả")}
              >
                Tất cả
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "Draft" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Draft")}
              >
                Draft
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "Pending" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Pending")}
              >
                Pending
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "Confirmed" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Confirmed")}
              >
                Confirmed
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="order-table">
          <div className="table-header">
            <div className="col-order-id">Order ID</div>
            <div className="col-customer">Customer</div>
            <div className="col-vehicle">Vehicle</div>
            <div className="col-amount">Amount</div>
            <div className="col-status">Status</div>
            <div className="col-date">Date</div>
            <div className="col-actions">Action</div>
          </div>
          <div className="table-body">
            {orders.length === 0 ? (
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
              orders.map((order) => (
                <div key={order.id} className="table-row">
                  <div className="col-order-id">
                    <span className="order-id">{order.id}</span>
                  </div>
                  <div className="col-customer">
                    <div className="customer-info">
                      <div className="customer-name">
                        {order.customer?.name || "N/A"}
                      </div>
                      <div className="customer-phone">
                        {order.customer?.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-vehicle">
                    <div className="vehicle-info">
                      <div className="vehicle-name">{order.vehicle.name}</div>
                      <div className="vehicle-color">{order.vehicle.color}</div>
                    </div>
                  </div>
                  <div className="col-amount">
                    <div className="amount-info">
                      <div className="amount">{order.amount} ₫</div>
                    </div>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${order.statusType}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-date">
                    <span className="date">{order.date}</span>
                  </div>
                  <div className="col-actions">
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => handleViewDetails(order)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
