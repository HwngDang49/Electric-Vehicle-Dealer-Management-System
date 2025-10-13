import React, { useState } from "react";
import "./DeliveryDetailView.css";

const DeliveryDetailView = ({ order, onBack, onScheduleSuccess }) => {
  console.log("DeliveryDetailView rendered with order:", order);
  console.log("DeliveryDetailView props:", {
    order,
    onBack,
    onScheduleSuccess,
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    place: "SR-Q1",
    time: "2025-01-15T15:00",
    staff: "Linh",
  });
  const [isScheduled, setIsScheduled] = useState(false);

  const handleInputChange = (field, value) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScheduleDelivery = () => {
    console.log("Scheduling delivery for order:", order.id);
    console.log("Delivery details:", deliveryDetails);
    setIsScheduled(true);
  };

  const handleMarkAsDelivered = () => {
    console.log("Marking order as delivered:", order.id);
    if (onScheduleSuccess) {
      onScheduleSuccess(order.id, deliveryDetails);
    }
  };

  // Simple fallback for debugging
  if (!order) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#1a1a1a",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <h1>Debug: No order data</h1>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="delivery-detail-view">
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
          <div className="delivery-details-card">
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
                <h2>Delivery Details</h2>
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
                  Delivery Place
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
                  Delivery Time
                </label>
                <div className="time-input-wrapper">
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={deliveryDetails.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                  />
                  <button className="calendar-btn">
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
                  Delivery Staff
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
                className="schedule-btn"
                onClick={handleScheduleDelivery}
                disabled={isScheduled}
              >
                Schedule Delivery
              </button>
              <button
                className="delivered-btn"
                onClick={handleMarkAsDelivered}
                disabled={!isScheduled}
              >
                Mark as Delivered
              </button>
            </div>

            {!isScheduled && (
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
                Order not ready for delivery
              </div>
            )}
          </div>

          {/* Right Section - Order Information */}
          <div className="order-info-card">
            <div className="card-header">
              <h2>Order Information</h2>
            </div>

            <div className="order-info">
              <div className="info-item">
                <label>Order ID</label>
                <span>{order?.id || "N/A"}</span>
              </div>

              <div className="info-item">
                <label>Customer</label>
                <span>{order?.customer?.name || "N/A"}</span>
              </div>

              <div className="info-item">
                <label>Vehicle</label>
                <span>{order?.vehicle || "N/A"}</span>
              </div>

              <div className="info-item">
                <label>VIN</label>
                <span>{order?.vin || "N/A"}</span>
              </div>

              <div className="info-item">
                <label>Order Status</label>
                <span className="status-badge delivered">
                  {order?.status || "Delivered"}
                </span>
              </div>

              <div className="info-item">
                <label>PDI Status</label>
                <span className="status-badge pass">PASS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailView;
