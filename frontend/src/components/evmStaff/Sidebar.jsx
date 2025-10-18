import React from "react";
import "./Sidebar.css";

const Sidebar = ({
  sidebarCollapsed,
  activeItem,
  onToggleSidebar,
  onNavClick,
}) => {
  const navItems = [
    {
      name: "Trang chủ",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      name: "Quản lý đơn hàng",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
        </svg>
      ),
    },
    {
      name: "Quản lý kho",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" />
        </svg>
      ),
    },
    {
      name: "Theo dõi đơn hàng",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM16.59 7L12 11.59L7.41 7L6 8.41L12 14.41L18 8.41L16.59 7Z" />
        </svg>
      ),
    },
    {
      name: "Quản lý công nợ",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 7.05 11.4 7.05C13.28 7.05 13.94 7.84 14 9H16.21C16.14 7.42 15.45 6.03 13.93 5.37C12.41 4.71 10.7 4.71 9.18 5.37C7.66 6.03 6.97 7.42 6.9 9H9.1C9.16 8.19 9.5 7.5 10.1 7.05C10.7 6.6 11.4 6.4 12.1 6.4C13.8 6.4 14.8 7.2 14.8 8.75C14.8 9.7 14.1 10.31 11.8 10.9ZM9.2 16V14H14.8V16H9.2Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`evm-staff-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="evm-staff-sidebar-header">
        <div className="evm-staff-logo">
          <div className="evm-staff-logo-icon">EVM</div>
          <div className="evm-staff-logo-text">
            <div className="evm-staff-logo-title">EVM Staff</div>
            <div className="evm-staff-logo-subtitle">Management System</div>
          </div>
        </div>
        <button
          className="evm-staff-collapse-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="evm-staff-sidebar-nav">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`evm-staff-nav-item ${
              activeItem === item.name ? "active" : ""
            }`}
            onClick={() => onNavClick(item.name)}
          >
            <div className="evm-staff-nav-icon">{item.icon}</div>
            <span className="evm-staff-nav-label">{item.name}</span>
            {activeItem === item.name && (
              <div className="evm-staff-nav-indicator"></div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="evm-staff-sidebar-footer">
        <div className="evm-staff-user-info">
          <div className="evm-staff-user-avatar">EVM</div>
          <div className="evm-staff-user-details">
            <div className="evm-staff-user-name">EVM Staff</div>
            <div className="evm-staff-user-role">Staff Member</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
