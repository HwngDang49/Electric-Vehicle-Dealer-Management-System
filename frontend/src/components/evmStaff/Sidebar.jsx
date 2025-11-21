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
  const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed || false);
  const [userName, setUserName] = useState("EVM Staff");
  const [userEmail, setUserEmail] = useState("staff@evm.com");
  const [notificationCount, setNotificationCount] = useState(0);
  const handleLogout = useLogout();

  // Sync with parent state
  useEffect(() => {
    setIsCollapsed(sidebarCollapsed || false);
  }, [sidebarCollapsed]);

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
          "EVM Staff";

        // Lấy email
        const email =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] ||
          payload["email"] ||
          payload["Email"] ||
          "staff@evm.com";

        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  }, []);

  // Load notification count from sessionStorage (no API calls, use WebSocket for real-time updates)
  useEffect(() => {
    loadNotificationCount();
    
    // Listen for manual refresh events from WebSocket
    const handleRefresh = () => {
      loadNotificationCount();
    };
    window.addEventListener('evmStaffRefreshNotifications', handleRefresh);

    return () => {
      window.removeEventListener('evmStaffRefreshNotifications', handleRefresh);
    };
  }, []);

  const loadNotificationCount = () => {
    try {
      const readNotificationIds = JSON.parse(
        localStorage.getItem("evmStaffReadNotificationIds") || "[]"
      );

      let unreadCount = 0;

      // Count notifications from sessionStorage (set by WebSocket)
      try {
        const notifications = JSON.parse(
          sessionStorage.getItem('evmStaffNotifications') || "[]"
        );
        
        notifications.forEach((notification) => {
          // Only count if not in readNotificationIds
          if (!readNotificationIds.includes(notification.id)) {
            unreadCount++;
          }
        });
      } catch (error) {
        console.error("Error loading notifications from sessionStorage:", error);
      }

      // Check for payment confirmation notifications from localStorage
      try {
        const paymentNotifications = JSON.parse(
          localStorage.getItem("evmStaffPaymentNotifications") || "[]"
        );

        paymentNotifications.forEach((notification) => {
          if (!readNotificationIds.includes(notification.id)) {
            unreadCount++;
          }
        });
      } catch (error) {
        console.error("Error loading payment notifications:", error);
      }

      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error loading notification count:", error);
      setNotificationCount(0);
    }
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggleSidebar();
  };

  // Map activeItem string to id for consistency
  const getActiveId = () => {
    const itemMap = {
      Dashboard: "dashboard",
      "Quản lý đơn hàng": "order-management",
      "Quản lý thanh toán": "payment-management",
      "Quản lý kho": "inventory-management",
      "Theo dõi đơn hàng": "order-tracking",
      "Quản lý công nợ": "debt-management",
      "Thông báo": "notifications",
      "Cài đặt": "settings",
    };
    return itemMap[activeItem] || "dashboard";
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      navItem: "Dashboard",
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
      id: "order-management",
      label: "Quản lý đơn hàng",
      navItem: "Quản lý đơn hàng",
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
      id: "payment-management",
      label: "Quản lý thanh toán",
      navItem: "Quản lý thanh toán",
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
      id: "inventory-management",
      label: "Quản lý kho",
      navItem: "Quản lý kho",
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
      id: "order-tracking",
      label: "Theo dõi đơn hàng",
      navItem: "Theo dõi đơn hàng",
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
      id: "debt-management",
      label: "Quản lý công nợ",
      navItem: "Quản lý công nợ",
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
  ];

  const bottomMenuItems = [
    {
      id: "notifications",
      label: "Thông báo",
      navItem: "Thông báo",
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
      badge: notificationCount > 0 ? notificationCount : null,
    },
    {
      id: "settings",
      label: "Cài đặt",
      navItem: "Cài đặt",
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

  const activeSection = getActiveId();

  return (
    <div className={`evm-staff-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Logo & Brand */}
      <div className="sidebar-header">
        <div
          className="brand"
          onClick={() => isCollapsed && handleToggleCollapse()}
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
          {!isCollapsed && <span className="brand-name">EVM Staff</span>}
        </div>
        {!isCollapsed && (
          <button
            key="collapse-btn"
            type="button"
            className="collapse-btn"
            onClick={() => {
              setIsCollapsed(true);
              onToggleSidebar();
            }}
            title="Thu gọn"
            aria-label="Thu gọn"
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
                display: "block",
                width: "20px",
                height: "20px",
                color: "inherit",
                flexShrink: 0,
              }}
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
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
              onClick={() => onNavClick(item.navItem)}
              title={isCollapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Bottom Menu - Hệ thống */}
        <div className="nav-section nav-bottom">
          {!isCollapsed && <div className="nav-section-title">HỆ THỐNG</div>}
          {bottomMenuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => {
                // If notification item, open popup instead of navigating
                if (item.id === "notifications" && onOpenNotification) {
                  onOpenNotification();
                } else {
                  onNavClick(item.navItem);
                }
              }}
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
        data-username={userName || "EVM Staff"}
        title={
          isCollapsed
            ? `${userName || "EVM Staff"}\n${userEmail || "staff@evm.com"}`
            : ""
        }
      >
        <div className="user-avatar">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              userName || "EVM Staff"
            )}&background=20c997&color=fff`}
            alt="User"
          />
          <span className="user-status"></span>
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{userName || "EVM Staff"}</div>
            <div className="user-email">{userEmail || "staff@evm.com"}</div>
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

export default Sidebar;
