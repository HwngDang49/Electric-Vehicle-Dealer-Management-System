import React from "react";
import "./OrderTracking.css";

const OrderTracking = () => {
  return (
    <div className="evm-staff-order-tracking">
      <div className="evm-staff-page-header">
        <h1>Theo dõi đơn hàng</h1>
        <p>Giám sát tiến độ thực hiện đơn hàng</p>
      </div>

      <div className="evm-staff-content-placeholder">
        <div className="evm-staff-placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
          </svg>
        </div>
        <h2>Tính năng đang phát triển</h2>
        <p>Theo dõi đơn hàng sẽ được triển khai trong phiên bản tiếp theo</p>
      </div>
    </div>
  );
};

export default OrderTracking;
