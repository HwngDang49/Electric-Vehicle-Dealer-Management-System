import React from "react";
import "./PaymentManagement.css";

const PaymentManagement = ({ orders }) => {
  return (
    <div className="payment-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý thanh toán</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các giao dịch thanh toán
        </p>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">💳</div>
        <h2>Quản lý thanh toán</h2>
        <p>Chức năng đang được phát triển...</p>
      </div>
    </div>
  );
};

export default PaymentManagement;
