import React, { useState } from "react";
import "./OrderManagement.css";

const OrderManagement = ({ orders, onUpdateOrderStatus }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const mockOrders = [
    {
      id: "ORD-001",
      customer: "Nguyễn Văn A",
      vehicle: "VinFast VF8",
      amount: "₫1,200,000,000",
      status: "Đang xử lý",
      statusType: "processing",
      date: "2024-01-15",
      priority: "high",
    },
    {
      id: "ORD-002",
      customer: "Trần Thị B",
      vehicle: "VinFast VF9",
      amount: "₫1,800,000,000",
      status: "Đã xác nhận",
      statusType: "confirmed",
      date: "2024-01-14",
      priority: "medium",
    },
    {
      id: "ORD-003",
      customer: "Lê Văn C",
      vehicle: "VinFast VF6",
      amount: "₫800,000,000",
      status: "Đang giao hàng",
      statusType: "shipping",
      date: "2024-01-13",
      priority: "low",
    },
    {
      id: "ORD-004",
      customer: "Phạm Thị D",
      vehicle: "VinFast VF7",
      amount: "₫1,500,000,000",
      status: "Hoàn thành",
      statusType: "completed",
      date: "2024-01-12",
      priority: "medium",
    },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "processing", label: "Đang xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao hàng" },
    { value: "completed", label: "Hoàn thành" },
  ];

  const filteredOrders = mockOrders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.statusType === filterStatus;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (statusType) => {
    switch (statusType) {
      case "processing":
        return "status-processing";
      case "confirmed":
        return "status-confirmed";
      case "shipping":
        return "status-shipping";
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

  return (
    <div className="order-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý đơn hàng</h1>
        <p className="page-subtitle">Theo dõi và quản lý tất cả đơn hàng</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button className="add-order-btn">+ Thêm đơn hàng mới</button>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <div className="table-header">
          <div className="table-cell">Mã đơn hàng</div>
          <div className="table-cell">Khách hàng</div>
          <div className="table-cell">Xe</div>
          <div className="table-cell">Giá trị</div>
          <div className="table-cell">Trạng thái</div>
          <div className="table-cell">Ưu tiên</div>
          <div className="table-cell">Ngày</div>
          <div className="table-cell">Thao tác</div>
        </div>

        {filteredOrders.map((order) => (
          <div key={order.id} className="table-row">
            <div className="table-cell">
              <span className="order-id">{order.id}</span>
            </div>
            <div className="table-cell">{order.customer}</div>
            <div className="table-cell">{order.vehicle}</div>
            <div className="table-cell amount">{order.amount}</div>
            <div className="table-cell">
              <span
                className={`status-badge ${getStatusBadgeClass(
                  order.statusType
                )}`}
              >
                {order.status}
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
            <div className="table-cell date">{order.date}</div>
            <div className="table-cell actions">
              <button className="action-btn view">Xem</button>
              <button className="action-btn edit">Sửa</button>
              <button className="action-btn delete">Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{mockOrders.length}</div>
            <div className="stat-label">Tổng đơn hàng</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">
              {mockOrders.filter((o) => o.statusType === "processing").length}
            </div>
            <div className="stat-label">Đang xử lý</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {mockOrders.filter((o) => o.statusType === "completed").length}
            </div>
            <div className="stat-label">Hoàn thành</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₫5.3B</div>
            <div className="stat-label">Tổng giá trị</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
