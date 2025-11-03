import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import "./Header.css";

const Header = ({
  showUserDropdown,
  onToggleUserDropdown,
  showNotifications,
  onToggleNotifications,
  notificationCount,
  onLogout,
  warningMessage,
  sidebarCollapsed = false,
}) => {
  const [userName, setUserName] = useState("EVM Staff");
  const [userEmail, setUserEmail] = useState("staff@evm.com");
  const [userRole, setUserRole] = useState("Staff Member");

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
          "EVM Staff";

        // Lấy email
        const email =
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] ||
          payload["email"] ||
          payload["Email"] ||
          "staff@evm.com";

        // Lấy role
        const role =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] ||
          payload["role"] ||
          payload["Role"] ||
          "Staff Member";

        setUserName(name);
        setUserEmail(email);
        setUserRole(role);
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  }, []);
  const notifications = [
    {
      id: 1,
      title: "Đơn hàng mới cần xử lý",
      time: "5 phút trước",
      icon: "📦",
    },
    {
      id: 2,
      title: "Cập nhật trạng thái kho",
      time: "15 phút trước",
      icon: "📊",
    },
    {
      id: 3,
      title: "Thông báo thanh toán",
      time: "1 giờ trước",
      icon: "💰",
    },
    {
      id: 4,
      title: "Báo cáo hàng tháng",
      time: "2 giờ trước",
      icon: "📈",
    },
  ];

  return (
    <div
      className={`evm-staff-header ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* Logo Section */}
      <div className="evm-staff-header-left">
        <div className="evm-staff-header-logo">
          <div className="evm-staff-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div className="evm-staff-logo-text">
            <span className="evm-staff-logo-title">EVM Staff Portal</span>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      {warningMessage && (
        <div className="evm-staff-header-warning">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>{warningMessage}</span>
        </div>
      )}

      {/* User Profile - Icon Only */}
      <div className="evm-staff-user-profile-container">
        <div
          className="evm-staff-header-user-icon"
          data-username={userName || "EVM Staff"}
          title={`${userName || "EVM Staff"}\n${userEmail || "staff@evm.com"}`}
          onClick={onToggleUserDropdown}
        >
          <div className="evm-staff-user-avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName || "EVM Staff"
              )}&background=20c997&color=fff`}
              alt="User"
            />
            <span className="evm-staff-user-status"></span>
          </div>
        </div>

        {/* User Dropdown */}
        {showUserDropdown && (
          <div className="evm-staff-user-dropdown">
            <div className="evm-staff-dropdown-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
              </svg>
              Hồ sơ cá nhân
            </div>
            <div className="evm-staff-dropdown-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" />
              </svg>
              Cài đặt
            </div>
            <div className="evm-staff-dropdown-divider"></div>
            <div
              className="evm-staff-dropdown-item evm-staff-logout"
              onClick={onLogout}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" />
              </svg>
              Đăng xuất
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
