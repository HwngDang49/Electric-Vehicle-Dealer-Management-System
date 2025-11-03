import React from "react";
import "./AnalyticsDashboard.css";
import PageHeader from "./PageHeader";

const AnalyticsDashboard = ({ onNavigateToHome }) => {
  return (
    <div className="analytics-dashboard">
      <PageHeader
        title="Dashboard phân tích"
        subtitle="Thống kê và báo cáo chi tiết"
        showBackButton={true}
        onBack={onNavigateToHome}
      />

      <div className="analytics-dashboard-content">
        <div className="content-placeholder">
          <div className="placeholder-icon">📊</div>
          <h2>Dashboard phân tích</h2>
          <p>Chức năng đang được phát triển...</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
