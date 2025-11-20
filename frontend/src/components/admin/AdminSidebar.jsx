import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import useLogout from "../../hooks/useLogout";
import "./AdminSidebar.css";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("Admin User");
  const [userEmail, setUserEmail] = useState("admin@evdms.com");
  const handleLogout = useLogout();

  // Lấy thông tin user từ JWT token
  useEffect(() => {
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
          "Admin User";

        // Lấy email
        const email =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] ||
          payload["email"] ||
          payload["Email"] ||
          "admin@evdms.com";

        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        // Silent error handling
      }
    }
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      id: "dealer-management",
      label: "Quản lý Dealer",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      id: "branch-management",
      label: "Quản lý Chi nhánh",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
    },
    {
      id: "product-management",
      label: "Quản lý Sản phẩm",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
    },
    {
      id: "pricebook-management",
      label: "Quản lý Bảng giá",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      id: "promotion-management",
      label: "Quản lý Khuyến mãi",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
    },
    {
      id: "agreement-management",
      label: "Hợp đồng Rebate",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
    {
      id: "user-management",
      label: "Quản lý Người dùng",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
  ];

  const bottomMenuItems = [
    {
      id: "notifications",
      label: "Thông báo",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      ),
      badge: 3,
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Logo & Brand */}
      <div className="sidebar-header">
        <div
          className="brand"
          onClick={() => isCollapsed && setIsCollapsed(false)}
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
          {!isCollapsed && <span className="brand-name">EVDMS Admin</span>}
        </div>
        {!isCollapsed ? (
          <button
            key="collapse-btn"
            className="collapse-btn"
            onClick={() => setIsCollapsed(true)}
            title="Thu gọn"
            aria-label="Thu gọn"
            type="button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                display: 'block',
                width: '20px',
                height: '20px',
                color: 'inherit',
                flexShrink: 0
              }}
            >
              <polyline points="15 18 9 12 15 6" style={{ fill: 'none', stroke: 'currentColor' }}></polyline>
            </svg>
          </button>
        ) : null}
      </div>

      {/* Search - only show when not collapsed */}
      {!isCollapsed && (
        <div className="sidebar-search">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
      )}

      {/* Main Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-title">MENU CHÍNH</div>}
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
              title={isCollapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Bottom Menu */}
        <div className="nav-section nav-bottom">
          {!isCollapsed && <div className="nav-section-title">HỆ THỐNG</div>}
          {bottomMenuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
              title={isCollapsed ? item.label : ""}
            >
              <span className="nav-icon">
                {item.icon}
                {item.badge && <span className="badge">{item.badge}</span>}
              </span>
              {!isCollapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div
        className="sidebar-user"
        data-username={userName || "Admin User"}
        title={
          isCollapsed
            ? `${userName || "Admin User"}\n${userEmail || "admin@evdms.com"}`
            : ""
        }
      >
        <div className="user-avatar">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              userName || "Admin"
            )}&background=20c997&color=fff`}
            alt="User"
          />
          <span className="user-status"></span>
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{userName || "Admin User"}</div>
            <div className="user-email">{userEmail || "admin@evdms.com"}</div>
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
  );
};

export default AdminSidebar;
