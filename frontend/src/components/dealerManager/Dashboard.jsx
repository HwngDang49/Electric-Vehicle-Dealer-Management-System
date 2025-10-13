import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const stats = [
    {
      title: "Tổng đơn hàng",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H7zm12 3H5v9h14V7z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
    {
      title: "Doanh thu tháng",
      value: "₫2.5B",
      change: "+8%",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
    {
      title: "Khách hàng mới",
      value: "89",
      change: "+15%",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H17c-.8 0-1.54.37-2.01.99L14 9.5 12.01 7.99A1.5 1.5 0 0 0 10 7H8.46c-.8 0-1.54.37-2.01.99L4 8.5V18h2v-6h2v6h2v-6h2v6h2v-6h2v6h2z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: "23.5%",
      change: "+3%",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Nguyễn Văn A",
      vehicle: "VinFast VF8",
      amount: "₫1,200,000,000",
      status: "Đang xử lý",
      statusType: "processing",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Trần Thị B",
      vehicle: "VinFast VF9",
      amount: "₫1,800,000,000",
      status: "Đã xác nhận",
      statusType: "confirmed",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      customer: "Lê Văn C",
      vehicle: "VinFast VF6",
      amount: "₫800,000,000",
      status: "Đang giao hàng",
      statusType: "shipping",
      date: "2024-01-13",
    },
  ];

  const quickActions = [
    {
      title: "Danh mục sản phẩm",
      description: "Xem và đặt hàng sản phẩm từ hãng",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
    {
      title: "Quản lý đơn hàng",
      description: "Xem và quản lý tất cả đơn hàng",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
    {
      title: "Thanh toán",
      description: "Thanh toán theo chính sách 70/30",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
        </svg>
      ),
      color: "#e6e6e6",
    },
  ];

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-card">
          <h1 className="welcome-title">Dealer Manager Portal</h1>
          <p className="welcome-subtitle">
            Trang chủ dành cho dealer manager quản lý đặt hàng, khuyến mãi và
            thanh toán sản phẩm.
          </p>
          <p className="welcome-instruction">
            Chọn một mục từ menu để bắt đầu.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h2 className="section-title">Tổng quan</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Thao tác nhanh</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card">
              <div
                className="action-icon"
                style={{ backgroundColor: action.color }}
              >
                {action.icon}
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
