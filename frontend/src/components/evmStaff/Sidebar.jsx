import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import useLogout from "../../hooks/useLogout";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import "./Sidebar.css";

const Sidebar = ({
  sidebarCollapsed,
  activeItem,
  onToggleSidebar,
  onNavClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed || false);
  const [userName, setUserName] = useState("EVM Staff");
  const [userEmail, setUserEmail] = useState("staff@evm.com");
  const [_notificationCount, setNotificationCount] = useState(0);
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

  // Load notification count
  useEffect(() => {
    loadNotificationCount();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const readNotificationIds = JSON.parse(
        localStorage.getItem("evmStaffReadNotificationIds") || "[]"
      );

      let unreadCount = 0;

      // Check for new Purchase Orders with Submit status
      try {
        const poResponse = await purchaseOrderApiService.getAllPurchaseOrders(
          1,
          1000
        );
        const poItems = poResponse?.data?.items || poResponse?.items || [];

        const submitPOs = poItems.filter(
          (po) => (po.Status || po.status || "").toLowerCase() === "submit"
        );

        submitPOs.forEach((po) => {
          const notificationId = `po-submit-${po.poId || po.PoId}`;
          if (!readNotificationIds.includes(notificationId)) {
            unreadCount++;
          }
        });
      } catch (error) {
        console.error(
          "Error loading purchase orders for notifications:",
          error
        );
      }

      // Check for orders ready for delivery
      // try {
      //   const orderResponse = await apiClient.get("/orders", {
      //     params: {
      //       status: "Ready",
      //       pageNumber: 1,
      //       pageSize: 100,
      //     },
      //   });

      //   const ordersData = orderResponse.data?.value?.items || orderResponse.data?.items || [];

      //   ordersData.forEach((order) => {
      //     const notificationId = `order-ready-${order.orderId}`;
      //     if (!readNotificationIds.includes(notificationId)) {
      //       unreadCount++;
      //     }
      //   });
      // } catch (error) {
      //   console.error("Error loading ready orders for notifications:", error);
      // }

      // Check for payment confirmation notifications
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
        <button
          className="toggle-btn"
          onClick={handleToggleCollapse}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? (
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
