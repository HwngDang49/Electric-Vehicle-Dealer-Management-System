import React, { useState, useEffect } from "react";
import VNPayButton from "../shared/VNPayButton";
import authService from "../../services/AuthService";
import dealerApiService from "../../services/dealerApi";
import "./VNPayPaymentModal.css";

const VNPayPaymentModal = ({ invoice, onClose }) => {
  const [dealerName, setDealerName] = useState("N/A");

  useEffect(() => {
    // Lấy dealerId từ JWT token
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const dealerId = payload["dealer_id"];

        if (dealerId) {
          // Gọi API để lấy tên dealer
          dealerApiService
            .getDealerById(dealerId)
            .then((response) => {
              const dealerData = response?.data || response;
              const name = dealerData?.name || dealerData?.dealerName || "N/A";
              setDealerName(name);
            })
            .catch((error) => {
              console.error("Error fetching dealer name:", error);
              setDealerName("N/A");
            });
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="vnpay-modal-overlay" onClick={onClose}>
      <div className="vnpay-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vnpay-modal-header">
          <h2>Thanh toán qua VNPay</h2>
          <button className="vnpay-close-button" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="vnpay-modal-body">
          <div className="vnpay-invoice-info">
            <h3>Thông tin hóa đơn</h3>
            <div className="vnpay-info-grid">
              <div className="vnpay-info-row">
                <span className="vnpay-label">Số hóa đơn:</span>
                <span className="vnpay-value">{invoice.invoiceNo}</span>
              </div>
              <div className="vnpay-info-row">
                <span className="vnpay-label">Khách hàng:</span>
                <span className="vnpay-value">{dealerName}</span>
              </div>
              <div className="vnpay-info-row vnpay-total">
                <span className="vnpay-label">Tổng tiền:</span>
                <span className="vnpay-value">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="vnpay-payment-info">
            <div className="vnpay-info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="vnpay-info-text">
              Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay.
              <br />
              Vui lòng chuẩn bị thông tin thẻ hoặc tài khoản ngân hàng.
            </p>
          </div>

          <div className="vnpay-action-buttons">
            <button className="vnpay-cancel-button" onClick={onClose}>
              Hủy
            </button>
            <VNPayButton
              invoiceId={invoice.invoiceId}
              amount={invoice.amount}
              onSuccess={() => {
                // onClose sẽ được gọi sau khi redirect về
              }}
              onError={(error) => {
                alert("Lỗi: " + error);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPayPaymentModal;
