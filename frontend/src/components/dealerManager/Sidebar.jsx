import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import "./Sidebar.css";

const Sidebar = ({
  sidebarCollapsed,
  activeItem,
  onToggleSidebar,
  onNavClick,
}) => {
  const [userName, setUserName] = useState("Dealer Manager");
  const [userEmail, setUserEmail] = useState("manager@dealer.com");

  useEffect(() => {
    // Lấy thông tin user từ JWT token
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Lấy tên
        const name =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ] ||
          payload["name"] ||
          payload["fullName"] ||
          payload["FullName"] ||
          "Dealer Manager";
        
        // Lấy email
        const email =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] ||
          payload["email"] ||
          payload["Email"] ||
          "manager@dealer.com";

        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  }, []);
  const menuItems = [
    {
      id: "home",
      name: "Trang chủ",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      path: "Trang chủ",
    },
    {
      id: "orders",
      name: "Quản lý đơn hàng",
      icon: (
        <svg
          width="20"
          height="20"
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
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      path: "Quản lý đơn hàng",
    },
    {
      id: "backordered",
      name: "Quản lý Backordered",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      path: "Quản lý Backordered",
    },
    {
      id: "inventory",
      name: "Quản lý kho",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
      path: "Quản lý kho",
    },
    {
      id: "payment",
      name: "Quản lý thanh toán",
      icon: (
        <svg
          width="20"
          height="20"
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
      path: "Quản lý thanh toán",
    },
    {
      id: "debt",
      name: "Quản lý công nợ",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      path: "Quản lý công nợ",
    },
    {
      id: "promotion",
      name: "Quản lý khuyến mãi",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      ),
      path: "Quản lý khuyến mãi",
    },
    {
      id: "dashboard",
      name: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
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
      path: "Dashboard",
    },
  ];

  return (
    <div className={`dealer-manager-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="logo-text">
              <div className="logo-title">FVDMS</div>
              <div className="logo-subtitle">Dealer Portal</div>
            </div>
          )}
        </div>
        <button
          className="toggle-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {sidebarCollapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${
                    activeItem === item.path ? "active" : ""
                  }`}
                  onClick={() => onNavClick(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="nav-text">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Info */}
      <div className="sidebar-user-info">
        <div className="sidebar-user-avatar">
          <div className="sidebar-avatar-placeholder">DM</div>
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{userEmail}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
