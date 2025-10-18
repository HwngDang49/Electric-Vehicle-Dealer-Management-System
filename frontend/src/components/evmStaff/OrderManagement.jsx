import React from "react";
import "./OrderManagement.css";

const OrderManagement = () => {
  return (
    <div className="evm-staff-order-management">
      <div className="evm-staff-page-header">
        <h1>Quản lý đơn hàng</h1>
        <p>Xử lý và quản lý các đơn hàng từ đại lý</p>
      </div>

      <div className="evm-staff-content-placeholder">
        <div className="evm-staff-placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
          </svg>
        </div>
        <h2>Tính năng đang phát triển</h2>
        <p>Quản lý đơn hàng sẽ được triển khai trong phiên bản tiếp theo</p>
      </div>
    </div>
  );
};

export default OrderManagement;
