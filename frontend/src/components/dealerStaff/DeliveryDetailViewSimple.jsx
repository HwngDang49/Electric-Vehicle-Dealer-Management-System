import React, { useState } from "react";
import "./DeliveryDetailView.css";

const DeliveryDetailViewSimple = ({ order, onBack, onScheduleSuccess }) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    place: "",
    time: "",
    staff: "",
  });

  console.log("DeliveryDetailViewSimple rendered with order:", order);
  console.log("Order details:", {
    id: order?.id,
    orderId: order?.orderId,
    customer: order?.customer,
    vehicle: order?.vehicle,
    vin: order?.vin,
    status: order?.status,
  });

  const handleInputChange = (field, value) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmSchedule = () => {
    console.log("Confirming schedule with details:", deliveryDetails);
    setIsScheduled(true);

    if (onScheduleSuccess) {
      onScheduleSuccess(order.orderId || order.id, {
        ...deliveryDetails,
        status: "Scheduled",
      });
    }
  };

  const handleCalendarClick = () => {
    console.log("Calendar button clicked");
    // Focus on the datetime input to open the date picker
    const datetimeInput = document.querySelector(
      'input[type="datetime-local"]'
    );
    if (datetimeInput) {
      datetimeInput.focus();
      // Try to open the native date picker
      if (datetimeInput.showPicker) {
        datetimeInput.showPicker();
      } else {
        // Fallback: trigger click on the input
        datetimeInput.click();
      }
    }
  };

  // Add error boundary
  if (!order) {
    return (
      <div
        style={{ padding: "20px", color: "red", backgroundColor: "#f8f9fa" }}
      >
        <h2>Lỗi: Không có dữ liệu đơn hàng</h2>
        <p>Không thể tải thông tin đơn hàng để tạo lịch giao xe.</p>
        <button
          onClick={onBack}
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

  try {
    return (
      <div
        className="delivery-detail-view"
        style={{ backgroundColor: "#e6e6e6" }}
      >
        <div className="delivery-detail-container">
          {/* Header */}
          <div className="delivery-detail-header">
            <button className="back-btn" onClick={onBack}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h1>Delivery - {order?.id || "N/A"}</h1>
          </div>

          {/* Main Content */}
          <div className="delivery-detail-content">
            {/* Left Section - Delivery Details */}
            <div
              className="delivery-details-card"
              style={{ backgroundColor: "#adadad" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                  </svg>
                  <h2>Thông tin giao xe</h2>
                </div>
              </div>

              <div className="delivery-form">
                <div className="form-group">
                  <label className="form-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Địa điểm nhận xe
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={deliveryDetails.place}
                    onChange={(e) => handleInputChange("place", e.target.value)}
                    placeholder="Nhập địa điểm giao xe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Thời gian nhận xe
                  </label>
                  <div className="time-input-wrapper">
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={deliveryDetails.time}
                      onChange={(e) =>
                        handleInputChange("time", e.target.value)
                      }
                    />
                    <button
                      className="calendar-btn"
                      onClick={handleCalendarClick}
                      type="button"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Nhân viên phụ trách
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={deliveryDetails.staff}
                    onChange={(e) => handleInputChange("staff", e.target.value)}
                    placeholder="Nhập tên nhân viên giao xe"
                  />
                </div>
              </div>

              <div className="delivery-actions">
                <button
                  className="delivered-btn"
                  onClick={handleConfirmSchedule}
                  disabled={isScheduled}
                >
                  {isScheduled
                    ? "Đã lên lịch giao xe"
                    : "Xác nhận thông tin giao xe"}
                </button>
              </div>

              <div className="warning-message">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Đơn hàng chưa sẵn sàng để giao
              </div>
            </div>

            {/* Right Section - Order Information */}
            <div
              className="order-info-card"
              style={{ backgroundColor: "#adadad" }}
            >
              <div className="card-header">
                <h2>Thông tin đơn hàng</h2>
              </div>

              <div className="order-info">
                <div className="info-item">
                  <label>Mã đơn hàng</label>
                  <span>{order?.orderId || order?.id || "N/A"}</span>
                </div>

                <div className="info-item">
                  <label>Khách hàng</label>
                  <span>
                    {order?.customer?.name || order?.customer || "N/A"}
                  </span>
                </div>

                <div className="info-item">
                  <label>Xe</label>
                  <span>{order?.vehicle?.name || order?.vehicle || "N/A"}</span>
                </div>

                <div className="info-item">
                  <label>VIN</label>
                  <span>{order?.vin || "N/A"}</span>
                </div>

                <div className="info-item">
                  <label>Trạng thái đơn hàng</label>
                  <span className="status-badge delivered">
                    {order?.status || "Delivered"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          onClick={onBack}
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
};

export default DeliveryDetailViewSimple;
