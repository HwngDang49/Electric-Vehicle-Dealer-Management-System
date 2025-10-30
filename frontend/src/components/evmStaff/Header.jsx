import React from "react";
import "./Header.css";

const Header = ({
  showUserDropdown,
  onToggleUserDropdown,
  showNotifications,
  onToggleNotifications,
  notificationCount,
  onLogout,
}) => {
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
    <div className="evm-staff-header">
      {/* User Info */}
      <div className="evm-staff-user-info">
        {/* Notifications */}
        <div className="evm-staff-notification-container">
          <button
            className="evm-staff-notification-btn"
            onClick={onToggleNotifications}
            title="Thông báo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5S10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
            </svg>
            {notificationCount > 0 && (
              <span className="evm-staff-notification-badge">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="evm-staff-notification-dropdown">
              <div className="evm-staff-notification-header">
                <h4>Thông báo</h4>
                <button onClick={onToggleNotifications}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
                  </svg>
                </button>
              </div>
              <div className="evm-staff-notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="evm-staff-notification-item"
                  >
                    <div className="evm-staff-notification-icon">
                      {notification.icon}
                    </div>
                    <div className="evm-staff-notification-content">
                      <div className="evm-staff-notification-title">
                        {notification.title}
                      </div>
                      <div className="evm-staff-notification-time">
                        {notification.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="evm-staff-user-profile-container">
          <button
            className="evm-staff-user-profile-button"
            onClick={onToggleUserDropdown}
          >
            <div className="evm-staff-user-avatar">EVM</div>
            <div className="evm-staff-user-details">
              <div className="evm-staff-user-name">EVM Staff</div>
              <div className="evm-staff-user-role">Staff Member</div>
            </div>
            <div className="evm-staff-user-dropdown-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 10L12 15L17 10H7Z" />
              </svg>
            </div>
          </button>

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
    </div>
  );
};

export default Header;
