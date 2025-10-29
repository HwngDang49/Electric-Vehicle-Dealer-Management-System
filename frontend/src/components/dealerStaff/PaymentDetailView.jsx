import React, { useState } from "react";
import "./PaymentDetailView.css";

const PaymentDetailView = ({
  payment,
  onClose,
  onBack,
  onPaymentSuccess,
  isReadOnly = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("full");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleConfirmPayment = async () => {
    if (isReadOnly) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);

      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess(payment);
        }
      }, 2000);
    }, 1500);
  };

  // Get status badge
  const getStatusBadge = () => {
    const statusMap = {
      draft: { text: "Draft", class: "draft" },
      paid: { text: "Paid", class: "paid" },
    };

    const status = statusMap[payment.statusType] || { text: payment.status, class: "draft" };

    return (
      <span className={`payment-status-badge ${status.class}`}>
        {status.text}
      </span>
    );
  };

  if (showSuccess) {
    return (
      <div className="payment-detail-view-app">
        <div className="payment-detail-modal-overlay">
          <div className="payment-detail-modal-content">
            <div className="payment-success-view">
              <div className="success-container">
                <div className="success-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      fill="#10b981"
                    />
                  </svg>
                </div>
                <h1>Thanh toán thành công!</h1>
                <p>Hóa đơn {payment.invoiceId} đã được thanh toán thành công.</p>
                <div className="success-actions">
                  <button className="back-to-home-btn" onClick={onClose || onBack}>
                    Quay về trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-detail-view-app">
      <div className="payment-detail-modal-overlay" onClick={onClose || onBack}>
        <div
          className="payment-detail-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="payment-detail-modal-header">
            <div className="payment-detail-modal-header-left">
              <div className="payment-detail-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h2 className="payment-detail-modal-title">Chi tiết thanh toán</h2>
                <p className="payment-detail-modal-subtitle">
                  {payment.invoiceId}
                </p>
              </div>
            </div>
            <div className="payment-detail-modal-header-actions">
              {getStatusBadge()}
              <button className="payment-detail-close-btn" onClick={onClose || onBack}>
                Đóng
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="payment-detail-modal-body">
            {/* Details */}
            <div className="payment-details">
              {/* Left Column - Customer & Vehicle Info */}
              <div className="payment-info-column">
                {/* Customer Information */}
                <div className="payment-detail-section">
                  <div className="payment-detail-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <h4>Thông Tin Khách Hàng</h4>
                  </div>
                  <div className="payment-detail-grid">
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Tên khách hàng</span>
                      <span className="payment-detail-value">
                        {payment.customer || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Số điện thoại</span>
                      <span className="payment-detail-value">
                        {payment.customerPhone || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Email</span>
                      <span className="payment-detail-value">
                        {payment.customerEmail || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">CCCD/CMND</span>
                      <span className="payment-detail-value">
                        {payment.customerIdNumber || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item full-width">
                      <span className="payment-detail-label">Địa chỉ</span>
                      <span className="payment-detail-value">
                        {payment.customerAddress || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="payment-detail-section">
                  <div className="payment-detail-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                    <h4>Thông Tin Đơn Hàng</h4>
                  </div>
                  <div className="payment-detail-grid">
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Mã đơn hàng</span>
                      <span className="payment-detail-value">
                        {payment.orderId || payment.invoiceId || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Model xe</span>
                      <span className="payment-detail-value">
                        {payment.orderName || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Màu sắc</span>
                      <span className="payment-detail-value">
                        {payment.vehicleColor || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Dung lượng pin</span>
                      <span className="payment-detail-value">
                        {payment.vehicleBatteryKwh ? `${payment.vehicleBatteryKwh} kWh` : "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Công suất động cơ</span>
                      <span className="payment-detail-value">
                        {payment.vehicleMotorKw ? `${payment.vehicleMotorKw} kW` : "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Quãng đường</span>
                      <span className="payment-detail-value">
                        {payment.vehicleRangeKm ? `${payment.vehicleRangeKm} km` : "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">VIN</span>
                      <span className="payment-detail-value vin-code">
                        {payment.vin || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Actions */}
              <div className="payment-actions-column">
                {/* Invoice Details Card */}
                <div className="payment-action-card">
                  <div className="payment-action-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                    <h4>Chi tiết hóa đơn</h4>
                  </div>
                  <div className="payment-summary">
                    <div className="modern-invoice-card">
                      <div className="invoice-header">
                        <div className="header-content">
                          <div className="total-section">
                            <span className="total-label">Tổng giá trị</span>
                            <span className="total-amount">{formatCurrency(payment.total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="invoice-content">
                        <div className="payment-item">
                          <div className="item-info">
                            <div className="status-indicator success">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                            <span className="item-label">Đã đặt cọc</span>
                          </div>
                          <span className="item-amount success">{formatCurrency(payment.total - payment.remaining)}</span>
                        </div>
                        
                        <div className="payment-item highlight">
                          <div className="item-info">
                            <div className="status-indicator warning">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                            <span className="item-label">Còn lại</span>
                          </div>
                          <span className="item-amount warning">{formatCurrency(payment.remaining)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection - Only show if not read-only */}
                {!isReadOnly && (
                  <div className="payment-action-card">
                    <div className="payment-action-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <h4>Hình thức thanh toán</h4>
                    </div>
                    <div className="payment-method-options">
                      <label className={`payment-method-option ${paymentMethod === "full" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="full"
                          checked={paymentMethod === "full"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-title">Trả đủ</span>
                          <span className="option-description">
                            Thanh toán toàn bộ số tiền một lần
                          </span>
                        </div>
                      </label>

                      <label className={`payment-method-option ${paymentMethod === "installment" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="installment"
                          checked={paymentMethod === "installment"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-title">Trả góp</span>
                          <span className="option-description">
                            Lãi suất 0% trong 12 tháng đầu, tối đa 60 tháng
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Payment Status - For read-only mode */}
                {isReadOnly && (
                  <div className="payment-action-card">
                    <div className="payment-action-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                      <h4>Trạng thái thanh toán</h4>
                    </div>
                    <div className="payment-status-success">
                      <div className="status-icon">
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
                      <h5>Đã thanh toán thành công!</h5>
                      <p>Hóa đơn đã được thanh toán đầy đủ.</p>
                    </div>
                  </div>
                )}

                {/* Confirm Payment Button - Only show if not read-only */}
                {!isReadOnly && (
                  <div className="payment-action-card">
                    <button
                      className="payment-confirm-btn"
                      onClick={handleConfirmPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="btn-spinner"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                          </svg>
                          Xác nhận thanh toán
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailView;