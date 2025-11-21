import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import useLogout from "../../hooks/useLogout";
import { getUserInfoFromToken } from "../../utils/jwtDecoder";
import "./Sidebar.css";

const Sidebar = ({
  sidebarCollapsed,
  activeItem,
  onToggleSidebar,
  onNavClick,
}) => {
  const [userName, setUserName] = useState("Dealer Manager");
  const [userEmail, setUserEmail] = useState("manager@dealer.com");
  const handleLogout = useLogout();

  // Lấy thông tin user từ JWT token
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const userInfo = getUserInfoFromToken(token);
        
        setUserName(userInfo.name || "Dealer Manager");
        setUserEmail(userInfo.email || "manager@dealer.com");
      } catch (error) {
        console.error("Error getting user info from token:", error);
      }
    }
  }, []);
  const menuItems = [
    {
      id: "home",
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
  ];

  return (
    <div
      className={`dealer-manager-sidebar ${
        sidebarCollapsed ? "collapsed" : ""
      }`}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div
          className="brand"
          onClick={() => sidebarCollapsed && onToggleSidebar()}
        >
          <div className="brand-icon">
            <svg
              className="lightning-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="logo-text">
              <div className="logo-title">Dealer Manager</div>
              {/* <div className="logo-subtitle">Manager Portal</div> */}
            </div>
          )}
        </div>
        <button
          className="toggle-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {sidebarCollapsed ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#20c997"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#20c997"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!sidebarCollapsed && (
            <div className="nav-section-title">MENU CHÍNH</div>
          )}
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${
                    activeItem === item.path ? "active" : ""
                  }`}
                  onClick={() => onNavClick(item.path)}
                  title={sidebarCollapsed ? item.name : ""}
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

      {/* User Profile */}
      <div
        className="sidebar-user-wrapper"
        data-username={userName || "Dealer Manager"}
        title={
          sidebarCollapsed
            ? `${userName || "Dealer Manager"}\n${
                userEmail || "manager@dealer.com"
              }`
            : ""
        }
      >
        <div className="sidebar-user">
          <div className="user-avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName || "Dealer Manager"
              )}&background=20c997&color=fff`}
              alt="User"
            />
            <span className="user-status"></span>
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{userName || "Dealer Manager"}</div>
              <div className="user-email">
                {userEmail || "manager@dealer.com"}
              </div>
            </div>
          )}
          <button
            className="user-logout-btn"
            onClick={handleLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc3545"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
