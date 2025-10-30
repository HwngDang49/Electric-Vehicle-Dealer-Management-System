import React from "react";
import "./Header.css";

const Header = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  showUserDropdown,
  onToggleUserDropdown,
  onLogout,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-title">Dealer Manager Portal</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
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
                  <div className="user-details">
                    <div className="user-name">Dealer Manager</div>
                    <div className="user-email">manager@dealer.com</div>
                    <div className="user-role">Manager</div>
                  </div>
                </div>
                <div className="user-menu-actions">
                  <button className="menu-action">
                    <span className="menu-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    Thông tin cá nhân
                  </button>
                  <button className="menu-action">
                    <span className="menu-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                      </svg>
                    </span>
                    Cài đặt
                  </button>
                  <button className="menu-action">
                    <span className="menu-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </span>
                    Trợ giúp
                  </button>
                  <hr className="menu-divider" />
                  <button className="menu-action logout" onClick={onLogout}>
                    <span className="menu-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </span>
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
