import React, { useState, useEffect } from "react";
import authService from "../../services/AuthService";
import { getUserInfoFromToken } from "../../utils/jwtDecoder";
import "./Header.css";

const Header = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  showUserDropdown,
  onToggleUserDropdown,
  onLogout,
  sidebarCollapsed = false,
}) => {
  const [userName, setUserName] = useState("Dealer Manager");
  const [userEmail, setUserEmail] = useState("manager@dealer.com");
  const [userRole, setUserRole] = useState("Manager");

  useEffect(() => {
    // Lấy thông tin user từ JWT token
    const token = authService.getToken();
    if (token) {
      try {
        const userInfo = getUserInfoFromToken(token);
        
        setUserName(userInfo.name || "Dealer Manager");
        setUserEmail(userInfo.email || "manager@dealer.com");
        setUserRole(userInfo.role || "Manager");
      } catch (error) {
        console.error("Error getting user info from token:", error);
      }
    }
  }, []);
  return (
    <header className={`header ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="header-left">
        <div className="header-logo">
          <div className="logo-icon">
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
                    <div className="user-name">{userName}</div>
                    <div className="user-email">{userEmail}</div>
                    <div className="user-role">{userRole}</div>
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
