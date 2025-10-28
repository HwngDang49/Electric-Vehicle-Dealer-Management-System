import React, { useState } from "react";
import "./AdminPage.css";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DealerManagement from "../../components/admin/DealerManagement";
import BranchManagement from "../../components/admin/BranchManagement";
import ProductCatalog from "../../components/admin/ProductCatalog";
import PricebookManagement from "../../components/admin/PricebookManagement";
import PromotionManagement from "../../components/admin/PromotionManagement";

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dealer-management":
        return <DealerManagement />;
      case "branch-management":
        return <BranchManagement />;
      case "user-management":
        return (
          <div className="placeholder-content">
            <h2>Quản lý người dùng</h2>
            <p>Chức năng đang được phát triển...</p>
          </div>
        );
      case "system-config":
        return (
          <div className="placeholder-content">
            <h2>Cấu hình hệ thống</h2>
            <p>Chức năng đang được phát triển...</p>
          </div>
        );
      case "product-management":
        return <ProductCatalog />;
      case "pricebook-management":
        return <PricebookManagement />;
      case "promotion-management":
        return <PromotionManagement />;
      case "reports":
        return (
          <div className="placeholder-content">
            <h2>Báo cáo tổng hợp</h2>
            <p>Chức năng đang được phát triển...</p>
          </div>
        );
      case "dashboard":
      default:
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Tổng người dùng</h3>
                <div className="stat-number">1,250</div>
              </div>
              <div className="stat-card">
                <h3>Dealer hoạt động</h3>
                <div className="stat-number">45</div>
              </div>
              <div className="stat-card">
                <h3>Doanh thu hệ thống</h3>
                <div className="stat-number">15.2B VND</div>
              </div>
              <div className="stat-card">
                <h3>Đơn hàng hôm nay</h3>
                <div className="stat-number">89</div>
              </div>
            </div>

            <div className="content-section">
              <h2>Chức năng quản trị</h2>
              <div className="feature-grid">
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("dealer-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3>Quản lý Dealer</h3>
                  <p>Quản lý thông tin và trạng thái các dealer</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("product-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM12 3.84 18.74 8 12 12.16 5.26 8 12 3.84zM5 9.27l6 3.46v6.42L5 15.69V9.27zm8 9.88v-6.42l6-3.46v6.42l-6 3.46z" />
                    </svg>
                  </div>
                  <h3>Quản lý Sản phẩm</h3>
                  <p>Danh mục xe và phiên bản</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("branch-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3>Quản lý Chi nhánh</h3>
                  <p>Quản lý thông tin và trạng thái các chi nhánh</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("pricebook-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <h3>Quản lý Bảng giá</h3>
                  <p>Quản lý bảng giá sản phẩm</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("promotion-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                    </svg>
                  </div>
                  <h3>Quản lý Khuyến mãi</h3>
                  <p>Quản lý các chương trình khuyến mãi</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("user-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.5-1.85 1.26L14 15h2v7h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.15-3.26A1.5 1.5 0 0 0 6.54 8H5.46c-.8 0-1.54.5-1.85 1.26L2.5 15H5v7h2.5z" />
                    </svg>
                  </div>
                  <h3>Quản lý người dùng</h3>
                  <p>Thêm, sửa, xóa tài khoản người dùng</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h3>Phân quyền hệ thống</h3>
                  <p>Cấu hình quyền truy cập</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("reports")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  </div>
                  <h3>Báo cáo tổng hợp</h3>
                  <p>Báo cáo toàn hệ thống</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveSection("system-config")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                    </svg>
                  </div>
                  <h3>Cấu hình hệ thống</h3>
                  <p>Thiết lập tham số hệ thống</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3M19,19H5V5H16.17L19,7.83V19M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M6,6H15V10H6V6Z" />
                    </svg>
                  </div>
                  <h3>Backup & Restore</h3>
                  <p>Sao lưu và khôi phục dữ liệu</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                    </svg>
                  </div>
                  <h3>Audit Logs</h3>
                  <p>Theo dõi hoạt động hệ thống</p>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-page-wrapper">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userName="Admin User"
        userEmail="admin@evdms.com"
      />

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Top Header */}
        <div className="content-header" key={`header-${activeSection}`}>
          <div className="header-left">
            <h1 className="page-title">
              {activeSection === "dashboard" && "Dashboard"}
              {activeSection === "dealer-management" && "Quản lý Dealer"}
              {activeSection === "branch-management" && "Quản lý Chi nhánh"}
              {activeSection === "product-management" && "Quản lý Sản phẩm"}
              {activeSection === "pricebook-management" && "Quản lý Bảng giá"}
              {activeSection === "promotion-management" && "Quản lý Khuyến mãi"}
              {activeSection === "user-management" && "Quản lý Người dùng"}
              {activeSection === "reports" && "Báo cáo"}
              {activeSection === "system-config" && "Cấu hình hệ thống"}
            </h1>
            <p className="page-subtitle">
              {activeSection === "dashboard" && "Tổng quan về hệ thống"}
              {activeSection === "dealer-management" &&
                "Quản lý thông tin và trạng thái các dealer"}
              {activeSection === "branch-management" &&
                "Quản lý thông tin các chi nhánh"}
              {activeSection === "product-management" &&
                "Quản lý danh mục sản phẩm"}
              {activeSection === "pricebook-management" &&
                "Quản lý bảng giá và chính sách giá"}
              {activeSection === "promotion-management" &&
                "Quản lý các chương trình khuyến mãi"}
              {activeSection === "user-management" &&
                "Quản lý tài khoản người dùng"}
              {activeSection === "reports" && "Báo cáo và thống kê hệ thống"}
              {activeSection === "system-config" &&
                "Cấu hình và tùy chỉnh hệ thống"}
            </p>
          </div>
          <div className="header-actions">
            {activeSection !== "dashboard" && (
              <button
                className="btn-back"
                onClick={() => setActiveSection("dashboard")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area" key={activeSection}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
