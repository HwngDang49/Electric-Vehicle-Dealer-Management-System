import React from "react";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  return (
    <div className="evm-staff-inventory-management">
      <div className="evm-staff-page-header">
        <h1>Quản lý kho</h1>
        <p>Kiểm soát tồn kho và quản lý sản phẩm</p>
      </div>

      <div className="evm-staff-content-placeholder">
        <div className="evm-staff-placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" />
          </svg>
        </div>
        <h2>Tính năng đang phát triển</h2>
        <p>Quản lý kho sẽ được triển khai trong phiên bản tiếp theo</p>
      </div>
    </div>
  );
};

export default InventoryManagement;
