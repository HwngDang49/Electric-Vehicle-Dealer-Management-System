import React, { useState } from "react";
import "./VinAllocationManagement.css";
import VinAllocationDetail from "./VinAllocationDetail";

const VinAllocationManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample data - 2 orders with different statuses
  const orders = [
    {
      id: "DH5115",
      customer: {
        name: "Nguyễn Văn An",
      },
      item: {
        name: "VinFast VF8 Plus",
        color: "Đỏ Ruby",
      },
      vin: "Chưa có",
      backorder: "-",
      eta: "-",
      status: "Pending",
      statusType: "pending",
    },
    {
      id: "DH001",
      customer: {
        name: "Nguyễn Văn A",
      },
      item: {
        name: "VinFast VF8 Plus",
        color: "Đỏ Ruby",
      },
      vin: "VF8P2024001",
      backorder: "2 tuần",
      eta: "2025-02-15",
      status: "Allocated",
      statusType: "allocated",
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

  const handleAllocateVIN = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleAllocateSuccess = (order, selectedVin) => {
    console.log("VIN allocation successful:", order.id, selectedVin);
    // Update order status to allocated
    // This would typically update the backend
    setSelectedOrder(null);
  };

  const getActionButton = (order) => {
    if (order.statusType === "pending") {
      return (
        <button
          className="action-btn allocate-btn"
          onClick={() => handleAllocateVIN(order)}
        >
          Phân bổ VIN
        </button>
      );
    } else if (order.statusType === "allocated") {
      return (
        <button
          className="action-btn view-btn"
          onClick={() => handleViewDetails(order)}
        >
          Xem chi tiết
        </button>
      );
    }
    return null;
  };

  // If an order is selected, show detail view
  if (selectedOrder) {
    return (
      <VinAllocationDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onAllocateSuccess={handleAllocateSuccess}
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
              <button
                className={`vin-allocation-filter-tab ${
                  activeFilter === "Allocated" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("Allocated")}
              >
                Allocated
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
            {orders.map((order) => (
              <div key={order.id} className="vin-allocation-table-row">
                <div className="col-order-id">
                  <span className="order-id">{order.id}</span>
                </div>
                <div className="col-customer">
                  <div className="customer-info">
                    <div className="customer-name">{order.customer.name}</div>
                  </div>
                </div>
                <div className="col-item">
                  <div className="item-info">
                    <div className="item-name">{order.item.name}</div>
                    <div className="item-color">{order.item.color}</div>
                  </div>
                </div>
                <div className="col-vin">
                  <span className="vin-text">{order.vin}</span>
                </div>
                <div className="col-backorder">
                  <span className="backorder-text">{order.backorder}</span>
                </div>
                <div className="col-eta">
                  <span className="eta-text">{order.eta}</span>
                </div>
                <div className="col-status">
                  <span className={`status-badge ${order.statusType}`}>
                    {order.status}
                  </span>
                </div>
                <div className="col-actions">{getActionButton(order)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinAllocationManagement;
