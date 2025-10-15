import React, { useState } from "react";
import "./PaymentDetailView.css";

const PaymentDetailView = ({
  payment,
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

  if (showSuccess) {
    return (
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
            <button className="back-to-home-btn" onClick={onBack}>
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-detail-view">
      <div className="payment-detail-container">
        {/* Header */}
        <div className="payment-detail-header">
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
          <div className="header-content">
            <h1>Chi tiết thanh toán</h1>
            <p>Đơn hàng {payment.orderId}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="payment-detail-content">
          {/* Left Card - Invoice Details */}
          <div className="invoice-details-card">
            <div className="card-header">
              <div className="header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2>Thông tin hóa đơn chi tiết</h2>
            </div>

            <div className="invoice-content">
              {/* Customer Info */}
              <div className="info-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Khách hàng:</label>
                    <span>{payment.customer}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>nguyenvana@email.com</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{payment.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="info-section">
                <h3>Thông tin xe</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Xe:</label>
                    <span>{payment.orderName}</span>
                  </div>
                  <div className="info-item">
                    <label>Màu sắc:</label>
                    <span>Đỏ Ruby</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="info-section">
                <h3>Chi tiết giá</h3>
                <div className="price-breakdown">
                  <div className="price-item">
                    <span>Giá cơ bản:</span>
                    <span className="price-value">
                      {formatCurrency(1200000000)}
                    </span>
                  </div>
                  <div className="price-total">
                    <span>Tổng cộng:</span>
                    <span className="total-value">
                      {formatCurrency(payment.total)}
                    </span>
                  </div>
                  <div className="price-deposit">
                    <span>Đặt cọc (20%):</span>
                    <span className="deposit-value">
                      {formatCurrency(226010000)}
                    </span>
                  </div>
                  <div className="price-remaining">
                    <span>Còn lại:</span>
                    <span className="remaining-value">
                      {formatCurrency(payment.remaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Payment Info */}
          <div className="payment-info-card">
            <div className="card-header">
              <div className="header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 2v3M16 2v3M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2>Thông tin thanh toán</h2>
            </div>

            <div className="payment-content">
              {/* Payment Summary */}
              <div className="payment-summary">
                <div className="summary-item">
                  <span>Tổng hóa đơn thanh toán:</span>
                  <span className="total-amount">
                    {formatCurrency(payment.total)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Đặt cọc:</span>
                  <span className="deposit-amount">
                    {formatCurrency(226010000)}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Còn lại:</span>
                  <span className="remaining-amount">
                    {formatCurrency(payment.remaining)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection - Only show if not read-only */}
              {!isReadOnly && (
                <div className="payment-method-section">
                  <h3>Chọn hình thức thanh toán</h3>
                  <div className="payment-options">
                    <label className="payment-option">
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

                    <label className="payment-option">
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

              {/* Status for read-only mode */}
              {isReadOnly && (
                <div className="payment-status-section">
                  <span className="status-badge paid">Paid</span>
                </div>
              )}

              {/* Confirm Button - Only show if not read-only */}
              {!isReadOnly && (
                <button
                  className="confirm-payment-btn"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="spinner"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray="31.416"
                          strokeDashoffset="31.416"
                        >
                          <animate
                            attributeName="stroke-dasharray"
                            dur="2s"
                            values="0 31.416;15.708 15.708;0 31.416"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="stroke-dashoffset"
                            dur="2s"
                            values="0;-15.708;-31.416"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                          fill="currentColor"
                        />
                      </svg>
                      Xác nhận thanh toán
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailView;
