import React from "react";
import "./DebtManagement.css";

const DebtManagement = () => {
  return (
    <div className="evm-staff-debt-management">
      <div className="evm-staff-page-header">
        <h1>Quản lý công nợ</h1>
        <p>Theo dõi và quản lý công nợ với các đại lý</p>
      </div>

      <div className="evm-staff-content-placeholder">
        <div className="evm-staff-placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 7.05 11.4 7.05C13.28 7.05 13.94 7.84 14 9H16.21C16.14 7.42 15.45 6.03 13.93 5.37C12.41 4.71 10.7 4.71 9.18 5.37C7.66 6.03 6.97 7.42 6.9 9H9.1C9.16 8.19 9.5 7.5 10.1 7.05C10.7 6.6 11.4 6.4 12.1 6.4C13.8 6.4 14.8 7.2 14.8 8.75C14.8 9.7 14.1 10.31 11.8 10.9ZM9.2 16V14H14.8V16H9.2Z" />
          </svg>
        </div>
        <h2>Tính năng đang phát triển</h2>
        <p>Quản lý công nợ sẽ được triển khai trong phiên bản tiếp theo</p>
      </div>
    </div>
  );
};

export default DebtManagement;
