import React, { useState, useEffect } from "react";
import "./DeliveryScheduleManagement.css";
import DeliveryDetailViewSimple from "./DeliveryDetailViewSimple";

const DeliveryScheduleManagementNew = ({ orders = [] }) => {
  console.log("=== DELIVERY SCHEDULE MANAGEMENT NEW ===");
  console.log("Orders received:", orders);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả trạng thái");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliverySchedules, setDeliverySchedules] = useState([]);

  // Initialize delivery schedules from orders
  useEffect(() => {
    const initialDeliverySchedules = orders
      .filter((order) => {
        return (
          order.statusType === "allocated" ||
          order.status === "Allocated" ||
          order.status === "ALLOCATED"
        );
      })
      .map((order) => ({
        id: `DLV-${order.id.slice(-4)}`,
        orderId: order.id,
        customer: order.customer?.name || order.customer || "N/A",
        place: "Chưa cập nhật",
        time: "Chưa cập nhật",
        status: "Delivered",
        statusType: "delivered",
        vin: order.vin || "N/A",
        vehicle: order.vehicle || "N/A",
      }));

    setDeliverySchedules(initialDeliverySchedules);
  }, [orders]);

  // Use state for delivery schedules
  const currentDeliverySchedules = deliverySchedules;

  console.log("Processed delivery schedules:", currentDeliverySchedules);

  // Filter logic
  const filteredSchedules = currentDeliverySchedules.filter((schedule) => {
    const matchesSearch =
      schedule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.place.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "Tất cả trạng thái" || schedule.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  console.log("Filtered schedules:", filteredSchedules);

  // Summary calculations
  const totalSchedules = currentDeliverySchedules.length;
  const deliveredCount = currentDeliverySchedules.filter(
    (s) => s.statusType === "delivered"
  ).length;
  const scheduledCount = currentDeliverySchedules.filter(
    (s) => s.statusType === "scheduled"
  ).length;

  console.log("Summary:", { totalSchedules, deliveredCount, scheduledCount });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleCreateSchedule = (schedule) => {
    console.log("Creating schedule for:", schedule);
    setSelectedOrder(schedule);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleScheduleSuccess = (orderId, deliveryDetails) => {
    console.log("Schedule success for order:", orderId, deliveryDetails);

    // Update the delivery schedule status
    setDeliverySchedules((prevSchedules) =>
      prevSchedules.map((schedule) =>
        schedule.orderId === orderId
          ? {
              ...schedule,
              status: "Scheduled",
              statusType: "scheduled",
              place: deliveryDetails.place,
              time: deliveryDetails.time,
              staff: deliveryDetails.staff,
            }
          : schedule
      )
    );

    setSelectedOrder(null);
  };

  // Show detail view if order is selected
  if (selectedOrder) {
    try {
      return (
        <DeliveryDetailViewSimple
          order={selectedOrder}
          onBack={handleBackToList}
          onScheduleSuccess={handleScheduleSuccess}
        />
      );
    } catch (error) {
      console.error("Error rendering DeliveryDetailViewSimple:", error);
      return (
        <div
          style={{ padding: "20px", color: "red", backgroundColor: "#f8f9fa" }}
        >
          <h2>Lỗi khi tải trang tạo lịch giao xe</h2>
          <p>Chi tiết lỗi: {error.message}</p>
          <button
            onClick={handleBackToList}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Quay lại
          </button>
        </div>
      );
    }
  }

  console.log("Rendering component...");

  try {
    return (
      <div className="delivery-schedule-management">
        <div className="delivery-schedule-content">
          {/* Header Section */}
          <div className="delivery-schedule-header">
            <div className="header-content">
              <h1>Lịch giao xe</h1>
              <p>Quản lý lịch giao xe cho khách hàng</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="delivery-schedule-summary">
            <div className="summary-card">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="summary-content">
                <h3>Tổng đơn</h3>
                <p className="summary-number">{totalSchedules}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="summary-content">
                <h3>Đã giao</h3>
                <p className="summary-number">{deliveredCount}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="summary-content">
                <h3>Đã lên lịch</h3>
                <p className="summary-number">{scheduledCount}</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="delivery-schedule-controls">
            <div className="search-section">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã giao hàng, đơn hàng, khách hàng, địa điểm..."
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="filter-section">
              <select
                className="filter-select"
                value={activeFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                <option value="Delivered">Đã giao</option>
                <option value="Scheduled">Đã lên lịch</option>
                <option value="Pending">Chờ lên lịch</option>
              </select>
            </div>
          </div>

          {/* Delivery Queue Table */}
          <div className="delivery-queue-card">
            <div className="delivery-queue-header">
              <h2>Delivery Queue</h2>
            </div>

            <div className="delivery-schedule-table">
              <div className="delivery-schedule-table-header">
                <div className="col-delivery-id">Delivery ID</div>
                <div className="col-order">Order</div>
                <div className="col-customer">Customer</div>
                <div className="col-place">Place</div>
                <div className="col-time">Time</div>
                <div className="col-status">Status</div>
                <div className="col-actions">Actions</div>
              </div>

              <div className="delivery-schedule-table-body">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <div key={schedule.id} className="delivery-schedule-row">
                      <div className="col-delivery-id">
                        <span className="delivery-id">{schedule.id}</span>
                      </div>
                      <div className="col-order">
                        <span className="order-id">{schedule.orderId}</span>
                      </div>
                      <div className="col-customer">
                        <span className="customer-name">
                          {schedule.customer}
                        </span>
                      </div>
                      <div className="col-place">
                        <span className="place">{schedule.place}</span>
                      </div>
                      <div className="col-time">
                        <span className="time">{schedule.time}</span>
                      </div>
                      <div className="col-status">
                        <span className={`status-badge ${schedule.statusType}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <div className="col-actions">
                        <button
                          className={`action-btn ${
                            schedule.statusType === "scheduled"
                              ? "view-schedule-btn"
                              : "create-schedule-btn"
                          }`}
                          onClick={() => {
                            console.log(
                              "Button clicked for schedule:",
                              schedule
                            );
                            handleCreateSchedule(schedule);
                          }}
                        >
                          {schedule.statusType === "scheduled"
                            ? "Xem lịch giao"
                            : "Tạo lịch giao"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-deliveries">
                    <div className="empty-icon">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <h3>Chưa có lịch giao xe</h3>
                    <p>
                      Hiện tại chưa có đơn hàng nào được phân bổ VIN. Lịch giao
                      xe sẽ xuất hiện khi có đơn hàng được phân bổ VIN từ trang
                      "Phân bổ VIN".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering DeliveryScheduleManagementNew:", error);
    return (
      <div
        style={{ padding: "20px", color: "red", backgroundColor: "#f8f9fa" }}
      >
        <h2>Lỗi khi tải trang lịch giao xe</h2>
        <p>Chi tiết lỗi: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Tải lại trang
        </button>
      </div>
    );
  }
};

export default DeliveryScheduleManagementNew;
