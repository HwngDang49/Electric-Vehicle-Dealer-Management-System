import React from "react";
import "./DebtManagement.css";

const DebtManagement = ({ orders }) => {
  return (
    <div className="debt-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý công nợ</h1>
        <p className="page-subtitle">Theo dõi và quản lý các khoản công nợ</p>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">💰</div>
        <h2>Quản lý công nợ</h2>
        <p>Chức năng đang được phát triển...</p>
      </div>
    </div>
  );
};

export default DebtManagement;
