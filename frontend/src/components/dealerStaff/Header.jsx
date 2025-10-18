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
    <div className="header">
      <form className="search-bar" onSubmit={onSearchSubmit}>
        <div className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm nhanh..."
          value={searchQuery}
          onChange={onSearchChange}
          className="search-input"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search"
            onClick={onClearSearch}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </form>

      <div className="user-info">
        <div className="notification-container">
          <button className="notification-btn" onClick={onToggleNotifications}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Thông báo</h4>
                <button onClick={() => onToggleNotifications(false)}>✕</button>
              </div>
              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-icon">📋</div>
                  <div className="notification-content">
                    <div className="notification-title">
                      Đơn hàng mới #12345
                    </div>
                    <div className="notification-time">5 phút trước</div>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">📅</div>
                  <div className="notification-content">
                    <div className="notification-title">
                      Lịch hẹn lái thử sắp tới
                    </div>
                    <div className="notification-time">1 giờ trước</div>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">💰</div>
                  <div className="notification-content">
                    <div className="notification-title">
                      Thanh toán đã hoàn tất
                    </div>
                    <div className="notification-time">2 giờ trước</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="user-profile-button" onClick={onToggleUserDropdown}>
          <div className="user-details">
            <div className="user-name">Nguyễn Văn A</div>
            <div className="user-role">Dealer Staff</div>
          </div>
          <div className="user-dropdown-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
          <div className="user-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>Hồ sơ cá nhân</span>
              </div>
              <div className="dropdown-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Cài đặt</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
