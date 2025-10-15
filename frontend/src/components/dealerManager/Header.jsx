import React from "react";
import "./Header.css";

const Header = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  showUserDropdown,
  onToggleUserDropdown,
  showNotifications,
  onToggleNotifications,
  notificationCount,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <div className="logo-icon">DM</div>
          <div className="logo-text">
            <span className="logo-title">Dealer Manager Portal</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          {/* Notifications */}
          <div className="notification-container">
            <button
              className="notification-btn"
              onClick={onToggleNotifications}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Thông báo</h3>
                  <button className="close-btn" onClick={onToggleNotifications}>
                    ✕
                  </button>
                </div>
                <div className="notification-list">
                  <div className="notification-item">
                    <div className="notification-icon">📦</div>
                    <div className="notification-content">
                      <div className="notification-title">
                        Đơn hàng mới cần xử lý
                      </div>
                      <div className="notification-time">5 phút trước</div>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon">💰</div>
                    <div className="notification-content">
                      <div className="notification-title">
                        Thanh toán đã được xác nhận
                      </div>
                      <div className="notification-time">1 giờ trước</div>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon">🏷️</div>
                    <div className="notification-content">
                      <div className="notification-title">
                        Khuyến mãi mới đã được tạo
                      </div>
                      <div className="notification-time">2 giờ trước</div>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon">📊</div>
                    <div className="notification-content">
                      <div className="notification-title">
                        Báo cáo tháng đã sẵn sàng
                      </div>
                      <div className="notification-time">1 ngày trước</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="user-menu-container">
            <button className="user-menu-btn" onClick={onToggleUserDropdown}>
              <div className="user-avatar">
                <div className="avatar-placeholder">DM</div>
              </div>
            </button>
            {showUserDropdown && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <div className="avatar-placeholder">DM</div>
                  </div>
                  <div className="user-details">
                    <div className="user-name">Dealer Manager</div>
                    <div className="user-email">manager@dealer.com</div>
                    <div className="user-role">Manager</div>
                  </div>
                </div>
                <div className="user-menu-actions">
                  <button className="menu-action">
                    <span className="menu-icon">👤</span>
                    Thông tin cá nhân
                  </button>
                  <button className="menu-action">
                    <span className="menu-icon">⚙️</span>
                    Cài đặt
                  </button>
                  <button className="menu-action">
                    <span className="menu-icon">❓</span>
                    Trợ giúp
                  </button>
                  <hr className="menu-divider" />
                  <button className="menu-action logout">
                    <span className="menu-icon">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
