import React, { useState } from "react";
import api from "../../services/api";
import "./VNPayButton.css";

const VNPayButton = ({
  invoiceId,
  amount,
  disabled = false,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleVNPayPayment = async () => {
    if (!invoiceId || disabled) return;

    try {
      setLoading(true);

      // Call API to create VNPay payment URL using api service
      const response = await api.post("/vnpay/create", {
        invoiceId,
      });

      if (response.data && response.data.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl;

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (error) {
      console.error("VNPay payment error:", error);
      if (onError) {
        onError(error.message);
      } else {
        alert("Lỗi: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`vnpay-button ${loading ? "loading" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onClick={handleVNPayPayment}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <div className="vnpay-spinner"></div>
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          <svg
            className="vnpay-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Thanh toán VNPay</span>
        </>
      )}
    </button>
  );
};

export default VNPayButton;
