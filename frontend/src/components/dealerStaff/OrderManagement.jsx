import React, { useState } from "react";
import "./OrderManagement.css";
import OrderDetailView from "./OrderDetailView";

const OrderManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample data - 3 orders as requested
  const orders = [
    {
      id: "DH001",
      customer: {
        name: "Nguyễn Văn A",
        phone: "0911223344",
      },
      vehicle: {
        name: "VinFast VF8 Plus",
        color: "Đỏ Ruby",
      },
      amount: "1.200.000.000",
      status: "Confirmed",
      statusType: "confirmed",
      date: "2025-01-15",
    },
    {
      id: "DH002",
      customer: {
        name: "Trần Thị B",
        phone: "0922334455",
      },
      vehicle: {
        name: "VinFast VF9 Plus",
        color: "Xanh Đại Dương",
      },
      amount: "1.500.000.000",
      status: "Pending",
      statusType: "pending",
      date: "2025-01-14",
    },
    {
      id: "DH003",
      customer: {
        name: "Lê Minh C",
        phone: "0933445566",
      },
      vehicle: {
        name: "VinFast VF6 Eco",
        color: "Trắng Ngọc Trai",
      },
      amount: "750.000.000",
      status: "Draft",
      statusType: "draft",
      date: "2025-01-16",
    },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleAllocateVIN = (order) => {
    // Handle VIN allocation logic here
    console.log("Allocating VIN for order:", order.id);
    // You can add logic to update order status or navigate to VIN allocation page
    alert(`VIN allocation initiated for order ${order.id}`);
  };

  // If an order is selected, show detail view
  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={handleBackToList}
        onAllocateVIN={handleAllocateVIN}
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
            {orders.map((order) => (
              <div key={order.id} className="table-row">
                <div className="col-order-id">
                  <span className="order-id">{order.id}</span>
                </div>
                <div className="col-customer">
                  <div className="customer-info">
                    <div className="customer-name">{order.customer.name}</div>
                    <div className="customer-phone">{order.customer.phone}</div>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
