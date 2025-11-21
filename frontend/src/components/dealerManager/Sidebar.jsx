import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import useLogout from "../../hooks/useLogout";
import "./Sidebar.css";

const Sidebar = ({
  sidebarCollapsed,
  activeItem,
  onToggleSidebar,
  onNavClick,
  onOpenNotification,
}) => {
  const [userName, setUserName] = useState("Dealer Manager");
  const [userEmail, setUserEmail] = useState("manager@dealer.com");
  const [notificationCount, setNotificationCount] = useState(0);
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
        // Silent error handling
      }
    }
  }, []);

  // Load notification count (tạm thời chưa có logic, chỉ UI)
  useEffect(() => {
    loadNotificationCount();
    
    // Listen for manual refresh events
    const handleRefresh = () => {
      loadNotificationCount();
    };
    window.addEventListener('dealerManagerRefreshNotifications', handleRefresh);

    return () => {
      window.removeEventListener('dealerManagerRefreshNotifications', handleRefresh);
    };
  }, []);

  const loadNotificationCount = () => {
    try {
      const readNotificationIds = JSON.parse(
        localStorage.getItem("dealerManagerReadNotificationIds") || "[]"
      );

      let unreadCount = 0;

      // Count notifications from sessionStorage (tạm thời chưa có logic)
      try {
        const notifications = JSON.parse(
          sessionStorage.getItem('dealerManagerNotifications') || "[]"
        );
        
        notifications.forEach((notification) => {
          if (!readNotificationIds.includes(notification.id)) {
            unreadCount++;
          }
        });
      } catch (error) {
        console.error("Error loading notifications from sessionStorage:", error);
      }

      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error loading notification count:", error);
      setNotificationCount(0);
    }
  };

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

  const bottomMenuItems = [
    {
      id: "notifications",
      name: "Thông báo",
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      ),
      badge: notificationCount > 0 ? notificationCount : null,
    },
    {
      id: "settings",
      name: "Cài đặt",
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
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
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

        {/* Bottom Menu - Hệ thống */}
        <div className="nav-section nav-bottom">
          {!sidebarCollapsed && (
            <div className="nav-section-title">HỆ THỐNG</div>
          )}
          <ul className="nav-list">
            {bottomMenuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${
                    activeItem === item.name ? "active" : ""
                  }`}
                  onClick={() => {
                    // If notification item, open popup instead of navigating
                    if (item.id === "notifications" && onOpenNotification) {
                      onOpenNotification();
                    } else {
                      onNavClick(item.name);
                    }
                  }}
                  title={sidebarCollapsed ? item.name : ""}
                >
                  <span className="nav-icon">
                    {item.icon}
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="nav-text">{item.name}</span>
                      {item.badge && <span className="badge">{item.badge}</span>}
                    </>
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
