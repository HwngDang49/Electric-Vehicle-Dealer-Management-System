import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Chào mừng đến với FVDMS</h1>
        <p>
          Hệ thống quản lý đại lý xe hơi - Quy trình bán hàng tối ưu từ khách
          hàng đến giao xe
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </div>
          <div className="metric-number">12</div>
          <div className="metric-label">Đơn hàng hôm nay</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
            </svg>
          </div>
          <div className="metric-number">8</div>
          <div className="metric-label">Lịch hẹn hôm nay</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
            </svg>
          </div>
          <div className="metric-number">5</div>
          <div className="metric-label">Xe đã giao</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M15,12C17.21,12 19,10.21 19,8C19,5.79 17.21,4 15,4C12.79,4 11,5.79 11,8C11,10.21 12.79,12 15,12M15,6A2,2 0 0,1 17,8A2,2 0 0,1 15,10A2,2 0 0,1 13,8A2,2 0 0,1 15,6M15,14C12.33,14 7,15.34 7,18V20H23V18C23,15.34 17.67,14 15,14M9,12C11.21,12 13,10.21 13,8C13,5.79 11.21,4 9,4C6.79,4 5,5.79 5,8C5,10.21 6.79,12 9,12M9,6A2,2 0 0,1 11,8A2,2 0 0,1 9,10A2,2 0 0,1 7,8A2,2 0 0,1 9,6M9,14C6.33,14 1,15.34 1,18V20H7V18C7,16.11 7.9,14.45 9.5,13.44C8.56,13.75 8.1,14.5 8.1,15.5C8.1,16.44 8.56,17.19 9.5,17.5C10.44,17.19 10.9,16.44 10.9,15.5C10.9,14.5 10.44,13.75 9.5,13.44Z" />
            </svg>
          </div>
          <div className="metric-number">3</div>
          <div className="metric-label">Khách hàng mới</div>
        </div>
      </div>

      {/* Sales Process Section */}
      <div className="sales-process">
        <h2>Quy trình bán hàng nhanh</h2>
        <div className="process-cards">
          <div className="process-card">
            <div className="process-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </div>
            <div className="process-title">Bắt đầu với khách hàng mới</div>
            <div className="process-description">
              Tạo hồ sơ khách hàng và bắt đầu quy trình bán hàng
            </div>
          </div>
          <div className="process-card">
            <div className="process-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,6A2,2 0 0,0 14,8A2,2 0 0,0 16,10A2,2 0 0,0 18,8A2,2 0 0,0 16,6M16,13C18.67,13 22,14.34 22,17V20H10V17C10,14.34 13.33,13 16,13M8,12C10.21,12 12,10.21 12,8C12,5.79 10.21,4 8,4C5.79,4 4,5.79 4,8C4,10.21 5.79,12 8,12M8,6A2,2 0 0,1 10,8A2,2 0 0,1 8,10A2,2 0 0,1 6,8A2,2 0 0,1 8,6M8,13C10.67,13 14,14.34 14,17V20H2V17C2,14.34 5.33,13 8,13Z" />
              </svg>
            </div>
            <div className="process-title">Quản lý khách hàng hiện tại</div>
            <div className="process-description">
              Theo dõi và quản lý thông tin khách hàng hiện có
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
