import React, { useState, useEffect } from "react";
import "./PaymentPopup.css";

const PaymentPopup = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [amount, setAmount] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate 10% deposit amount
  const depositAmount = order ? Math.round(order.amount * 0.1) : 0;
  const formattedDepositAmount = new Intl.NumberFormat("vi-VN").format(
    depositAmount
  );

  useEffect(() => {
    if (isOpen) {
      setAmount(depositAmount.toString());
      setReferenceNo("");
      setIsProcessing(false);
    }
  }, [isOpen, depositAmount]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
    setAmount(value);
  };

  const handleReferenceChange = (e) => {
    setReferenceNo(e.target.value);
  };

  const handleConfirmPayment = () => {
    if (!amount || !referenceNo) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const enteredAmount = parseInt(amount);
    if (enteredAmount !== depositAmount) {
      alert(
        `Số tiền cọc phải đúng 10% tổng hóa đơn (${formattedDepositAmount} ₫)`
      );
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
      onClose();
    }, 2000);
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
            ×
          </button>
        </div>

        <div className="payment-popup-content">
          <div className="order-info">
            <h3>Thông tin đơn hàng</h3>
            <div className="info-row">
              <span className="label">Mã đơn hàng:</span>
              <span className="value">{order?.id}</span>
            </div>
            <div className="info-row">
              <span className="label">Khách hàng:</span>
              <span className="value">{order?.customer?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Tổng giá trị đơn hàng:</span>
              <span className="value">
                {new Intl.NumberFormat("vi-VN").format(order?.amount || 0)} ₫
              </span>
            </div>
          </div>

          <div className="payment-form">
            <h3>Thông tin thanh toán</h3>

            <div className="form-group">
              <label htmlFor="amount">Số tiền cọc (10% tổng hóa đơn)</label>
              <div className="amount-input-container">
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder={`Nhập ${formattedDepositAmount}`}
                  disabled={isProcessing}
                />
                <span className="currency">₫</span>
              </div>
              <div className="amount-suggestion">
                <span className="suggestion-text">
                  Gợi ý: {formattedDepositAmount} ₫ (10% của{" "}
                  {new Intl.NumberFormat("vi-VN").format(order?.amount || 0)} ₫)
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reference">Mã tham chiếu</label>
              <input
                type="text"
                id="reference"
                value={referenceNo}
                onChange={handleReferenceChange}
                placeholder="Nhập mã tham chiếu thanh toán"
                disabled={isProcessing}
              />
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
              disabled={isProcessing || !amount || !referenceNo}
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;
