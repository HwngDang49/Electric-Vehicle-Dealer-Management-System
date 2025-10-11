import React from "react";
import "./AdminPage.css";

const AdminPage = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Quản trị toàn bộ hệ thống</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng người dùng</h3>
            <div className="stat-number">1,250</div>
          </div>
          <div className="stat-card">
            <h3>Dealer hoạt động</h3>
            <div className="stat-number">45</div>
          </div>
          <div className="stat-card">
            <h3>Doanh thu hệ thống</h3>
            <div className="stat-number">15.2B VND</div>
          </div>
          <div className="stat-card">
            <h3>Đơn hàng hôm nay</h3>
            <div className="stat-number">89</div>
          </div>
        </div>

        <div className="content-section">
          <h2>Chức năng quản trị</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Quản lý người dùng</h3>
              <p>Thêm, sửa, xóa tài khoản người dùng</p>
            </div>
            <div className="feature-card">
              <h3>Phân quyền hệ thống</h3>
              <p>Cấu hình quyền truy cập</p>
            </div>
            <div className="feature-card">
              <h3>Báo cáo tổng hợp</h3>
              <p>Báo cáo toàn hệ thống</p>
            </div>
            <div className="feature-card">
              <h3>Cấu hình hệ thống</h3>
              <p>Thiết lập tham số hệ thống</p>
            </div>
            <div className="feature-card">
              <h3>Backup & Restore</h3>
              <p>Sao lưu và khôi phục dữ liệu</p>
            </div>
            <div className="feature-card">
              <h3>Audit Logs</h3>
              <p>Theo dõi hoạt động hệ thống</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
