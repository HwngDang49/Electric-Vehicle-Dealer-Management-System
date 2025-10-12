import React, { useState } from "react";
import "./OrderDetailView.css";

const OrderDetailView = ({ order, onBack, onNavigateToVinAllocation }) => {
  console.log("OrderDetailView received order:", order);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Debug: Check if order exists
  if (!order) {
    console.log("Order is null or undefined");
    return (
      <div className="order-detail-view">
        <div className="order-detail-content">
          <div className="error-message">
            <h2>Không tìm thấy đơn hàng</h2>
            <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
            <button className="back-btn" onClick={onBack}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    // Simulate payment processing
    setShowPaymentForm(true);

    // Simulate payment success after 2 seconds
    setTimeout(() => {
      setPaymentStatus("success");
      setShowPaymentForm(false);
      // Update order status to Pending after successful payment
      if (order.statusType === "draft") {
        order.status = "Pending";
        order.statusType = "pending";
        console.log("Order status updated to Pending after payment");
      }
    }, 2000);
  };

  const handleViewInvoice = () => {
    // Handle view invoice logic here
    console.log("Viewing invoice for order:", order.id);
    alert(`Đang mở hóa đơn thanh toán cho đơn hàng ${order.id}`);
  };

  const depositAmount = Math.round(
    parseInt(String(order.amount || 0).replace(/\./g, "")) * 0.1
  );

  console.log("Rendering OrderDetailView with order:", order);

  // Simple fallback for testing
  if (!order || !order.id) {
    return (
      <div style={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
        <h2>Error: Order data is missing</h2>
        <p>Order: {JSON.stringify(order)}</p>
        <button onClick={onBack}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="order-detail-view">
      <div className="order-detail-content">
        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="header-info">
            <h1>Chi tiết đơn hàng {order.id}</h1>
            <div className="order-status">
              <span className={`status-badge ${order.statusType}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="info-section">
          <h2>Thông tin khách hàng</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Tên khách hàng:</label>
              <span>{order.customer.name}</span>
            </div>
            <div className="info-item">
              <label>Số điện thoại:</label>
              <span>{order.customer.phone}</span>
            </div>
            <div className="info-item">
              <label>Ngày đặt hàng:</label>
              <span>{order.date}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="info-section">
          <h2>Thông tin xe</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Model xe:</label>
              <span>{order.vehicle.name}</span>
            </div>
            <div className="info-item">
              <label>Màu sắc:</label>
              <span>{order.vehicle.color}</span>
            </div>
            <div className="info-item">
              <label>Giá trị đơn hàng:</label>
              <span className="amount">{order.amount} ₫</span>
            </div>
          </div>
        </div>

        {/* Payment Section - Only for Draft orders */}
        {order.statusType === "draft" && (
          <div className="info-section">
            <h2>Thanh toán cọc</h2>

            <div className="payment-policy">
              <div className="policy-header">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h3>Chính sách thanh toán</h3>
              </div>
              <p className="policy-text">
                Theo chính sách mua xe tại đại lý, quý khách vui lòng cọc trước
                10% trên tổng hóa đơn xe
              </p>
            </div>

            {paymentStatus === "pending" && (
              <div className="payment-info">
                <div className="payment-details">
                  <div className="payment-item">
                    <label>Tổng giá trị đơn hàng:</label>
                    <span className="total-amount">{order.amount} ₫</span>
                  </div>
                  <div className="payment-item">
                    <label>Số tiền cọc (10%):</label>
                    <span className="deposit-amount">
                      {depositAmount.toLocaleString()} ₫
                    </span>
                  </div>
                </div>

                {!showPaymentForm ? (
                  <button className="payment-btn" onClick={handlePayment}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Thanh toán cọc
                  </button>
                ) : (
                  <div className="payment-processing">
                    <div className="loading-spinner"></div>
                    <p>Đang xử lý thanh toán...</p>
                  </div>
                )}
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="payment-success">
                <div className="success-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <h3>Thanh toán thành công!</h3>
                <p>
                  Số tiền cọc {depositAmount.toLocaleString()} ₫ đã được thanh
                  toán thành công.
                </p>
                <p>
                  <strong>
                    Đơn hàng đã được chuyển sang trạng thái Pending.
                  </strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Section - For Pending orders */}
        {order.statusType === "pending" && (
          <div className="info-section">
            <h2>Thao tác đơn hàng</h2>
            <div className="action-section">
              <div className="action-info">
                <p>Đơn hàng đã được xác nhận và sẵn sàng để phân bổ VIN.</p>
              </div>
              <button
                className="allocate-btn"
                onClick={() => {
                  console.log("Allocate VIN clicked for order:", order.id);
                  if (onNavigateToVinAllocation) {
                    onNavigateToVinAllocation(order);
                  } else {
                    console.log(
                      "onNavigateToVinAllocation prop is not available"
                    );
                  }
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                </svg>
                Allocate VIN
              </button>
            </div>
          </div>
        )}

        {/* Action Section - For Confirmed orders */}
        {order.statusType === "confirmed" && (
          <div className="info-section">
            <h2>Thao tác đơn hàng</h2>
            <div className="action-section">
              <div className="action-info">
                <p>
                  Đơn hàng đã được xác nhận và hoàn tất. Bạn có thể xem hóa đơn
                  thanh toán.
                </p>
              </div>
              <button className="invoice-btn" onClick={handleViewInvoice}>
                Xem hóa đơn thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailView;
