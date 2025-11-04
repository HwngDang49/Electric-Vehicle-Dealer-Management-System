import React from "react";
import "./Dashboard.css";
import PageHeader from "./PageHeader";

const Dashboard = ({ onNavigate }) => {
  // Quick access navigation items - matching sidebar features
  const quickAccessItems = [
    {
      id: "order-management",
      name: "Quản lý đơn hàng",
      subtitle: "Xử lý và quản lý các đơn hàng từ đại lý",
      path: "Quản lý đơn hàng",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      id: "inventory-management",
      name: "Quản lý kho",
      subtitle: "Quản lý và theo dõi tồn kho sản phẩm",
      path: "Quản lý kho",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
    },
    {
      id: "order-tracking",
      name: "Theo dõi đơn hàng",
      subtitle: "Theo dõi trạng thái và tiến độ đơn hàng",
      path: "Theo dõi đơn hàng",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
    },
    {
      id: "payment-management",
      name: "Quản lý thanh toán",
      subtitle: "Theo dõi và quản lý thanh toán",
      path: "Quản lý thanh toán",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      ),
    },
    {
      id: "debt-management",
      name: "Quản lý công nợ",
      subtitle: "Theo dõi và quản lý công nợ",
      path: "Quản lý công nợ",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
  ];

  return (
    <div className="evm-staff-dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Hệ thống quản lý EVM Staff - Quản lý đơn hàng, kho hàng và theo dõi hoạt động"
      />

      {/* Metrics Cards */}
      <div className="evm-staff-dashboard-content">
        <div className="evm-staff-metrics-grid">
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H7zm12 3H5v9h14V7z" />
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">24</div>
              <div className="evm-staff-metric-title">Đơn hàng mới</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">156</div>
              <div className="evm-staff-metric-title">Sản phẩm trong kho</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">8</div>
              <div className="evm-staff-metric-title">Đơn hàng đang xử lý</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">₫2.5M</div>
              <div className="evm-staff-metric-title">Tổng công nợ</div>
            </div>
          </div>
        </div>

        {/* Quick Sale Process Section */}
        <div className="evm-staff-content-section">
          <h2>Quy trình bán hàng nhanh</h2>
          <div className="evm-staff-feature-grid">
            {quickAccessItems.map((item) => (
              <div
                key={item.id}
                className="evm-staff-feature-card"
                onClick={() => onNavigate && onNavigate(item.path)}
              >
                <div className="evm-staff-feature-icon">{item.icon}</div>
                <h3>{item.name}</h3>
                <p>{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
