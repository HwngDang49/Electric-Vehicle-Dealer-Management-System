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
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM17 16H7V14H17V16ZM17 8H7V6H17V8Z" />
        </svg>
      ),
    },
    {
      name: "Quản lý kho",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6H16L14 4H10L8 6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM20 19H4V8H6.83L8.83 6H15.17L17.17 8H20V19ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17Z" />
        </svg>
      ),
    },
    {
      name: "Theo dõi đơn hàng",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19 11H5L6.5 6.5ZM7 13.5C7.83 13.5 8.5 14.17 8.5 15S7.83 16.5 7 16.5S5.5 15.83 5.5 15S6.17 13.5 7 13.5ZM17 13.5C17.83 13.5 18.5 14.17 18.5 15S17.83 16.5 17 16.5S15.5 15.83 15.5 15S16.17 13.5 17 13.5Z" />
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
          <div className="evm-staff-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" />
            </svg>
          </div>
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
