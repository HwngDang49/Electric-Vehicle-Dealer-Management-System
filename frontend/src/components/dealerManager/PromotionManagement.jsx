import React from "react";
import "./PromotionManagement.css";
import PageHeader from "./PageHeader";

const PromotionManagement = ({ onNavigateToHome }) => {
  return (
    <div className="promotion-management">
      <PageHeader
        title="Quản lý khuyến mãi"
        subtitle="Tạo và quản lý các chương trình khuyến mãi"
        showBackButton={true}
        onBack={onNavigateToHome}
      />

      <div className="promotion-management-content">
        <div className="content-placeholder">
          <div className="placeholder-icon">🏷️</div>
          <h2>Quản lý khuyến mãi</h2>
          <p>Chức năng đang được phát triển...</p>
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement;
