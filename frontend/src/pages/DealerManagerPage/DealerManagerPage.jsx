import React from "react";
import "./DealerManagerPage.css";

const DealerManagerPage = () => {
  return (
    <div className="dealer-manager-page">
      <div className="page-header">
        <h1>Dealer Manager Dashboard</h1>
        <p>Quản lý toàn bộ hệ thống dealer</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng số Dealer</h3>
            <div className="stat-number">25</div>
          </div>
          <div className="stat-card">
            <h3>Doanh thu tháng</h3>
            <div className="stat-number">2.5B VND</div>
          </div>
          <div className="stat-card">
            <h3>Đơn hàng mới</h3>
            <div className="stat-number">156</div>
          </div>
        </div>

        <div className="content-section">
          <h2>Chức năng quản lý</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Quản lý Dealer</h3>
              <p>Thêm, sửa, xóa thông tin dealer</p>
            </div>
            <div className="feature-card">
              <h3>Báo cáo doanh thu</h3>
              <p>Xem báo cáo chi tiết doanh thu</p>
            </div>
            <div className="feature-card">
              <h3>Quản lý nhân viên</h3>
              <p>Phân quyền và quản lý nhân viên</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerManagerPage;
