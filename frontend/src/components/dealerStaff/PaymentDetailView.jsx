import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./PaymentDetailView.css";
import invoiceApiService from "../../services/invoiceApiService";
import orderApiService from "../../services/orderApiService";

const PaymentDetailView = ({
  payment,
  onClose,
  onBack,
  onPaymentSuccess,
  isReadOnly = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState(""); // ban đầu chưa chọn
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const [animSeed, setAnimSeed] = useState(0); // seed to retrigger modal animation
  const [orderClosed, setOrderClosed] = useState(false);

  useEffect(() => {
    const checkOrderClosed = async () => {
      try {
        const orderId = payment.orderId || payment.salesDocId;
        if (!orderId) return;
        const res = await orderApiService.getOrderById(orderId);
        const data = res?.value || res?.data || res;
        const status = data?.status || data?.Status;
        if (typeof status === "string" && status.toLowerCase() === "closed") {
          setOrderClosed(true);
        }
      } catch (e) {
        // ignore
      }
    };
    checkOrderClosed();
  }, [payment.orderId, payment.salesDocId]);

  // Local view state after payment success
  const initialOutstanding = (() => {
    const v =
      typeof payment.outstandingAmount === "number"
        ? payment.outstandingAmount
        : typeof payment.remaining === "number"
        ? payment.remaining
        : typeof payment.amount === "number" &&
          typeof payment.depositAmount === "number"
        ? payment.amount - payment.depositAmount
        : 0;
    return Math.max(0, Number(v || 0));
  })();

  const [localOutstanding, setLocalOutstanding] = useState(initialOutstanding);
  const [localStatus, setLocalStatus] = useState(
    payment.status ||
      (payment.statusType ? payment.statusType.toUpperCase() : "")
  );
  const [localReadOnly, setLocalReadOnly] = useState(
    (payment.status || "").toLowerCase() === "paid" ||
      (payment.statusType || "").toLowerCase() === "paid"
  );
  const initialPaid = Math.max(
    0,
    Number(
      (payment.amount || 0) - (payment.depositAmount || 0) - initialOutstanding
    )
  );
  const [paidAmount, setPaidAmount] = useState(initialPaid);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount || 0));
  };

  // Format payment date - Backend đã convert sang VN time
  const formatPaymentDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      let date;
      if (typeof dateString === "string") {
        // Backend đã convert sang VN time, nếu không có timezone info, thêm +07:00 để parse đúng
        let dateStr = dateString.trim();
        if (!dateStr.match(/[Z+-]\d{2}:?\d{2}$/)) {
          dateStr += "+07:00";
        }
        date = new Date(dateStr);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      if (isNaN(date.getTime())) {
        return "N/A";
      }

      // Format với timezone VN (Asia/Ho_Chi_Minh)
      const time = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh",
      });
      const dateStr = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      });
      return `${time} ${dateStr}`;
    } catch (error) {
      console.error("Error formatting payment date:", dateString, error);
      return "N/A";
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const getOutstandingAmount = () => localOutstanding;

  // Xác nhận thanh toán (trả đủ)
  const handleConfirmPayment = async () => {
    if (isReadOnly || localReadOnly) return;
    const outstanding = getOutstandingAmount();
    if (!outstanding || Number.isNaN(outstanding) || outstanding <= 0) {
      showToast(
        "error",
        "Hóa đơn đã được thanh toán hoặc không cần thanh toán"
      );
      return;
    }
    setIsProcessing(true);
    try {
      const resp = await invoiceApiService.createRetailPayment({
        invoiceId: payment.invoiceId,
        amount: outstanding,
      });

      const paidAmt = resp?.amount ?? outstanding;

      // Cập nhật local view: đã thanh toán xong
      setPaidAmount(paidAmt);
      setLocalOutstanding(0);
      setLocalStatus("PAID");
      setLocalReadOnly(true);
      showToast("success", "Thanh toán thành công");
      setAnimSeed((k) => k + 1); // remount modal to replay animation

      // Thông báo parent refresh list (không đóng view)
      if (onPaymentSuccess) onPaymentSuccess(payment);
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.errors ||
        err?.message ||
        "Lỗi thanh toán";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!payment.orderId && !payment.salesDocId) {
      onClose && onClose();
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = payment.orderId || payment.salesDocId;
      await invoiceApiService.closeOrder(orderId);
      showToast("success", "Đã đóng đơn hàng");
      setOrderClosed(true);
      setAnimSeed((k) => k + 1); // remount để chạy animation và cập nhật UI
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.errors ||
        err?.message ||
        "Lỗi đóng đơn hàng";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Status badge theo localStatus
  const getStatusBadge = () => {
    const statusMap = {
      draft: { text: "Nháp", class: "draft" },
      paid: { text: "Đã thanh toán", class: "paid" },
    };

    const statusKey = (localStatus || payment.status || "draft")
      .toString()
      .toLowerCase();
    const status = statusMap[statusKey] || {
      text: payment.status || statusKey,
      class: "draft",
    };

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
                <p>
                  Hóa đơn {payment.invoiceId} đã được thanh toán thành công.
                </p>
                <div className="success-actions">
                  <button
                    className="back-to-home-btn"
                    onClick={onClose || onBack}
                  >
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
      {toast &&
        ReactDOM.createPortal(
          <div
            className={`payment-toast ${
              toast.type === "error" ? "payment-toast-error" : ""
            }`}
          >
            <div className="toast-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                {toast.type === "error" ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M20 6L9 17l-5-5" />
                )}
              </svg>
            </div>
            <div className="toast-content">
              <div className="toast-title">
                {toast.type === "error" ? "Thất bại" : "Thành công"}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => setToast(null)}
              aria-label="Đóng"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="toast-progress"></div>
          </div>,
          document.body
        )}

      <div
        className="payment-detail-modal-overlay"
        key={animSeed}
        onClick={onClose || onBack}
      >
        <div
          className="payment-detail-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="payment-detail-modal-header">
            <div className="payment-detail-modal-header-left">
              <div className="payment-detail-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h2 className="payment-detail-modal-title">
                  Chi tiết thanh toán
                </h2>
                <p className="payment-detail-modal-subtitle">
                  {payment.invoiceId}
                </p>
              </div>
            </div>
            <div className="payment-detail-modal-header-actions">
              {getStatusBadge()}
              <button
                className="payment-detail-close-btn"
                onClick={onClose || onBack}
              >
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
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <h4>Thông Tin Khách Hàng</h4>
                  </div>
                  <div className="payment-detail-grid">
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">
                        Tên khách hàng
                      </span>
                      <span className="payment-detail-value">
                        {payment.customer || "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">
                        Số điện thoại
                      </span>
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
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
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
                      <span className="payment-detail-label">
                        Dung lượng pin
                      </span>
                      <span className="payment-detail-value">
                        {payment.vehicleBatteryKwh
                          ? `${payment.vehicleBatteryKwh} kWh`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">
                        Công suất động cơ
                      </span>
                      <span className="payment-detail-value">
                        {payment.vehicleMotorKw
                          ? `${payment.vehicleMotorKw} kW`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Quãng đường</span>
                      <span className="payment-detail-value">
                        {payment.vehicleRangeKm
                          ? `${payment.vehicleRangeKm} km`
                          : "N/A"}
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
                            <span className="total-amount">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="invoice-content">
                        <div className="payment-item">
                          <div className="item-info">
                            <div className="status-indicator success">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </div>
                            <span className="item-label">Đã đặt cọc</span>
                          </div>
                          <span className="item-amount success">
                            {formatCurrency(payment.depositAmount)}
                          </span>
                        </div>

                        <div className="payment-item highlight">
                          <div className="item-info">
                            <div className="status-indicator warning">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </div>
                            <span className="item-label">
                              {localReadOnly ? "Đã thanh toán" : "Còn lại"}
                            </span>
                          </div>
                          <span className="item-amount warning">
                            {localReadOnly
                              ? formatCurrency(paidAmount)
                              : formatCurrency(localOutstanding)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection - Chỉ hiển thị khi chưa thanh toán */}
                {!isReadOnly && !localReadOnly && (
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
                        <rect
                          x="1"
                          y="4"
                          width="22"
                          height="16"
                          rx="2"
                          ry="2"
                        />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <h4>Hình thức thanh toán</h4>
                    </div>
                    <div className="payment-method-options">
                      <label
                        className={`payment-method-option ${
                          paymentMethod === "full" ? "selected" : ""
                        }`}
                      >
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
                            Thanh toán toàn bộ số tiền còn lại một lần
                          </span>
                        </div>
                      </label>
                      <label
                        className={`payment-method-option disabled ${
                          paymentMethod === "installment" ? "selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="installment"
                          checked={paymentMethod === "installment"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          disabled
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

                {/* Payment Dates Card - Hiển thị khi đã thanh toán */}
                {localReadOnly && (
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
                      <h4>Thông tin thanh toán</h4>
                    </div>
                    <div className="payment-dates-container">
                      <div className="payment-date-field">
                        <label className="payment-date-label">
                          NGÀY TẠO HÓA ĐƠN
                        </label>
                        <div className="payment-date-box">
                          {formatPaymentDate(payment.issuedAt || payment.IssuedAt)}
                        </div>
                      </div>
                      <div className="payment-date-field">
                        <label className="payment-date-label">
                          NGÀY THANH TOÁN
                        </label>
                        <div className="payment-date-box">
                          {formatPaymentDate(payment.paidAt || payment.PaidAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Status - For read-only mode */}
                {/* Removed status success card per request */}
                {/* (no visual success card here; toast already indicates success) */}

                {/* Action Button */}
                {!isReadOnly && (
                  <div className="payment-action-card">
                    {localReadOnly ? (
                      orderClosed ? (
                        <button
                          className="payment-confirm-btn"
                          onClick={() => {
                            window.dispatchEvent(
                              new Event("navigateToOrderManagement")
                            );
                            onClose && onClose();
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                          </svg>
                          Quay về Quản lý đơn hàng
                        </button>
                      ) : (
                        <button
                          className="payment-confirm-btn"
                          onClick={handleCloseOrder}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="btn-spinner"></div>Đang xử lý...
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
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                              </svg>
                              Đóng Đơn Hàng
                            </>
                          )}
                        </button>
                      )
                    ) : (
                      <button
                        className="payment-confirm-btn"
                        onClick={handleConfirmPayment}
                        disabled={isProcessing || paymentMethod === ""}
                      >
                        {isProcessing ? (
                          <>
                            <div className="btn-spinner"></div>Đang xử lý...
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
                    )}
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
