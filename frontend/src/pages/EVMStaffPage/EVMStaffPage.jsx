import React from "react";
import "./EVMStaffPage.css";

const EVMStaffPage = () => {
  return (
    <div className="evm-staff-page">
      <div className="page-header">
        <h1>EVM Staff Dashboard</h1>
        <p>Quản lý hệ thống xe điện và dịch vụ</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng số xe</h3>
            <div className="stat-number">1,250</div>
          </div>
          <div className="stat-card">
            <h3>Xe đã bán</h3>
            <div className="stat-number">890</div>
          </div>
          <div className="stat-card">
            <h3>Xe trong kho</h3>
            <div className="stat-number">360</div>
          </div>
          <div className="stat-card">
            <h3>Đang sửa chữa</h3>
            <div className="stat-number">15</div>
          </div>
        </div>

        <div className="content-section">
          <h2>Chức năng quản lý</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Quản lý kho xe</h3>
              <p>Theo dõi tình trạng xe trong kho</p>
            </div>
            <div className="feature-card">
              <h3>Bảo trì xe</h3>
              <p>Lịch bảo trì và sửa chữa</p>
            </div>
            <div className="feature-card">
              <h3>Báo cáo tồn kho</h3>
              <p>Báo cáo chi tiết tồn kho</p>
            </div>
            <div className="feature-card">
              <h3>Quản lý phụ tùng</h3>
              <p>Quản lý phụ tùng thay thế</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVMStaffPage;
