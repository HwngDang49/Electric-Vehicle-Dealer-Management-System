import React from "react";
import "./Sidebar.css";

const Sidebar = ({
  sidebarCollapsed,
  activeItem,
  onToggleSidebar,
  onNavClick,
}) => {
  return (
    <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">FV</div>
          {!sidebarCollapsed && (
            <div className="logo-text">
              <div className="logo-title">FVDMS</div>
              <div className="logo-subtitle">Hệ thống quản lý đại lý</div>
            </div>
          )}
        </div>
        <button className="collapse-btn" onClick={onToggleSidebar}>
          {sidebarCollapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activeItem === "Trang chủ" ? "active" : ""}`}
          onClick={() => onNavClick("Trang chủ")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Trang chủ</span>}
        </div>
        <div
          className={`nav-item ${
            activeItem === "Xem danh mục" ? "active" : ""
          }`}
          onClick={() => onNavClick("Xem danh mục")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Xem danh mục</span>}
        </div>
        <div
          className={`nav-item ${
            activeItem === "Quản lý khách hàng" ? "active" : ""
          }`}
          onClick={() => onNavClick("Quản lý khách hàng")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.5-1.85 1.26L14 15h2v7h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.15-3.26A1.5 1.5 0 0 0 6.54 8H5.46c-.8 0-1.54.5-1.85 1.26L2.5 15H5v7h2.5z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Quản lý khách hàng</span>}
        </div>

        <div
          className={`nav-item ${
            activeItem === "Quản lý báo giá" ? "active" : ""
          }`}
          onClick={() => onNavClick("Quản lý báo giá")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Quản lý báo giá</span>}
        </div>
        <div
          className={`nav-item ${
            activeItem === "Quản lý đơn hàng" ? "active" : ""
          }`}
          onClick={() => onNavClick("Quản lý đơn hàng")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H7zm12 3H5v9h14V7z" />
              <path d="M9 9h6v2H9V9zm0 3h6v2H9v-2z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Quản lý đơn hàng</span>}
        </div>
        <div
          className={`nav-item ${
            activeItem === "Lịch nhận giao xe" ? "active" : ""
          }`}
          onClick={() => onNavClick("Lịch nhận giao xe")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              <path d="M12 6v2h2v-2h-2zm0 4v2h2v-2h-2zm-4-4v2h2V6H8zm0 4v2h2v-2H8zm8 0v2h2v-2h-2zm0-4v2h2V6h-2z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Lịch nhận giao xe</span>}
        </div>
        <div
          className={`nav-item ${
            activeItem === "Lịch hẹn lái thử" ? "active" : ""
          }`}
          onClick={() => onNavClick("Lịch hẹn lái thử")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Lịch hẹn lái thử</span>}
        </div>
        <div
          className={`nav-item ${
            activeItem === "Quản lý thanh toán" ? "active" : ""
          }`}
          onClick={() => onNavClick("Quản lý thanh toán")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Quản lý thanh toán</span>}
        </div>
        <div
          className={`nav-item ${activeItem === "Feedback" ? "active" : ""}`}
          onClick={() => onNavClick("Feedback")}
        >
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </div>
          {!sidebarCollapsed && <span>Feedback</span>}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
