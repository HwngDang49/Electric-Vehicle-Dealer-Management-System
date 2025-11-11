import React, { useState, useEffect } from "react";
import "./PaymentPopup.css";
import apiClient from "../../services/api";

const PaymentPopup = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
  onError,
}) => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get deposit requirement from contract or order data
  const depositRequirement =
    order?.contractData?.depositAmount || order?.depositRequirement || 0;
  const currentDeposit = order?.depositAmount || 0;
  const remainingAmount = Math.max(0, depositRequirement - currentDeposit);

  const formattedDepositRequirement = new Intl.NumberFormat("vi-VN").format(
    depositRequirement
  );
  const formattedCurrentDeposit = new Intl.NumberFormat("vi-VN").format(
    currentDeposit
  );
  const formattedRemainingAmount = new Intl.NumberFormat("vi-VN").format(
    remainingAmount
  );

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleAmountChange = (e) => {
    // Remove all non-digit characters
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
  };

  const formatCurrency = (value) => {
    if (!value || value === "0") return "";
    // Format with thousand separators
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handleConfirmPayment = async () => {
    if (!amount) {
      if (onError) {
        onError("Vui lòng nhập số tiền đặt cọc");
      }
      return;
    }

    const enteredAmount = parseInt(amount);

    // Allow any amount > 0, not just exactly 10%
    if (enteredAmount <= 0) {
      if (onError) {
        onError("Số tiền đặt cọc phải lớn hơn 0");
      }
      return;
    }

    if (!order.backendId) {
      if (onError) {
        onError("Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.");
      }
      return;
    }

    setIsProcessing(true);

    try {
      console.log("📤 Adding deposit to order:", order.backendId);
      console.log("📤 Deposit data:", {
        Amount: enteredAmount,
      });

      // Call backend API to add deposit
      const response = await apiClient.post(
        `/orders/${order.backendId}/deposits`,
        {
          Amount: enteredAmount,
        }
      );

      console.log("✅ Deposit added successfully:", response.data);

      // Close popup first
      onClose();

      // Call parent success handler with payment data (toast will be shown there)
      if (onPaymentSuccess) {
        onPaymentSuccess({
          amount: enteredAmount,
        });
      }
    } catch (error) {
      console.error("❌ Error adding deposit:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể thêm đặt cọc";
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-popup-overlay" onClick={handleClose}>
      <div className="payment-popup" onClick={(e) => e.stopPropagation()}>
        <div className="payment-popup-header">
          <h2>Thanh toán cọc</h2>
          <button
            className="close-btn"
            onClick={handleClose}
            disabled={isProcessing}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="payment-popup-content">
          <div className="payment-form">
            {/* Amount Input */}
            <div className="form-group">
              <label htmlFor="amount">
                Số tiền cọc
                <span className="required">*</span>
              </label>
              <div className="amount-input-wrapper">
                <input
                  type="text"
                  id="amount"
                  value={formatCurrency(amount)}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền khách hàng đặt cọc"
                  disabled={isProcessing}
                  className="amount-input"
                />
                <span className="currency-symbol">₫</span>
              </div>
              {remainingAmount > 0 && (
                <div className="suggestion-hint">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Số tiền cọc yêu cầu: {formattedRemainingAmount} ₫</span>
                </div>
              )}
            </div>
          </div>

          <div className="payment-actions">
            <button
              className="cancel-btn"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Hủy
            </button>
            <button
              className="confirm-btn"
              onClick={handleConfirmPayment}
              disabled={isProcessing || !amount}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Xác nhận thanh toán
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;
