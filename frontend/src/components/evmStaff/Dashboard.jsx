import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="evm-staff-dashboard">
      <div className="evm-staff-welcome-section">
        <h1>Chào mừng đến với EVM Staff Dashboard</h1>
        <p>
          Hệ thống quản lý EVM Staff - Quản lý đơn hàng, kho hàng và theo dõi
          hoạt động
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="evm-staff-metrics-grid">
        <div className="evm-staff-metric-card">
          <div className="evm-staff-metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
            </svg>
          </div>
          <div className="evm-staff-metric-number">24</div>
          <div className="evm-staff-metric-label">Đơn hàng mới</div>
        </div>
        <div className="evm-staff-metric-card">
          <div className="evm-staff-metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" />
            </svg>
          </div>
          <div className="evm-staff-metric-number">156</div>
          <div className="evm-staff-metric-label">Sản phẩm trong kho</div>
        </div>
        <div className="evm-staff-metric-card">
          <div className="evm-staff-metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
            </svg>
          </div>
          <div className="evm-staff-metric-number">8</div>
          <div className="evm-staff-metric-label">Đơn hàng đang xử lý</div>
        </div>
        <div className="evm-staff-metric-card">
          <div className="evm-staff-metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 7.05 11.4 7.05C13.28 7.05 13.94 7.84 14 9H16.21C16.14 7.42 15.45 6.03 13.93 5.37C12.41 4.71 10.7 4.71 9.18 5.37C7.66 6.03 6.97 7.42 6.9 9H9.1C9.16 8.19 9.5 7.5 10.1 7.05C10.7 6.6 11.4 6.4 12.1 6.4C13.8 6.4 14.8 7.2 14.8 8.75C14.8 9.7 14.1 10.31 11.8 10.9ZM9.2 16V14H14.8V16H9.2Z" />
            </svg>
          </div>
          <div className="evm-staff-metric-number">₫2.5M</div>
          <div className="evm-staff-metric-label">Tổng công nợ</div>
        </div>
      </div>

      {/* Management Process */}
      <div className="evm-staff-management-process">
        <h2>Quy trình quản lý EVM</h2>
        <div className="evm-staff-process-cards">
          <div className="evm-staff-process-card">
            <div className="evm-staff-process-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
              </svg>
            </div>
            <div className="evm-staff-process-title">Quản lý đơn hàng</div>
            <div className="evm-staff-process-description">
              Xử lý và quản lý các đơn hàng từ đại lý, theo dõi trạng thái và
              tiến độ
            </div>
          </div>

          <div className="evm-staff-process-card">
            <div className="evm-staff-process-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" />
              </svg>
            </div>
            <div className="evm-staff-process-title">Quản lý kho</div>
            <div className="evm-staff-process-description">
              Kiểm soát tồn kho, nhập xuất hàng và đảm bảo sẵn sàng giao hàng
            </div>
          </div>

          <div className="evm-staff-process-card">
            <div className="evm-staff-process-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
              </svg>
            </div>
            <div className="evm-staff-process-title">Theo dõi đơn hàng</div>
            <div className="evm-staff-process-description">
              Giám sát tiến độ thực hiện đơn hàng và cập nhật trạng thái cho đại
              lý
            </div>
          </div>

          <div className="evm-staff-process-card">
            <div className="evm-staff-process-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 7.05 11.4 7.05C13.28 7.05 13.94 7.84 14 9H16.21C16.14 7.42 15.45 6.03 13.93 5.37C12.41 4.71 10.7 4.71 9.18 5.37C7.66 6.03 6.97 7.42 6.9 9H9.1C9.16 8.19 9.5 7.5 10.1 7.05C10.7 6.6 11.4 6.4 12.1 6.4C13.8 6.4 14.8 7.2 14.8 8.75C14.8 9.7 14.1 10.31 11.8 10.9ZM9.2 16V14H14.8V16H9.2Z" />
              </svg>
            </div>
            <div className="evm-staff-process-title">Quản lý công nợ</div>
            <div className="evm-staff-process-description">
              Theo dõi và quản lý công nợ với các đại lý, đảm bảo thanh toán
              đúng hạn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
