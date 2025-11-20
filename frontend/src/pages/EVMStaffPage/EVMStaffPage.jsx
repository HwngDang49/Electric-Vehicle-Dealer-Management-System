import React, { useState } from "react";
import "./EVMStaffPage.css";
import Sidebar from "../../components/evmStaff/Sidebar";
import Dashboard from "../../components/evmStaff/Dashboard";
import OrderManagement from "../../components/evmStaff/OrderManagement";
import InventoryManagement from "../../components/evmStaff/InventoryManagement";
import OrderTracking from "../../components/evmStaff/OrderTracking";
import DebtManagement from "../../components/evmStaff/DebtManagement";
import PaymentManagement from "../../components/evmStaff/PaymentManagement";
import NotificationManagement from "../../components/evmStaff/NotificationManagement";
import CreateDeliveryOrderPage from "../../components/evmStaff/CreateDeliveryOrderPage";
import ToastContainer from "../../components/shared/ToastContainer";

const EVMStaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const toggleSidebar = () => setSidebarCollapsed((s) => !s);

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
    setCurrentPage("main");
  };

  const handleCreateDeliveryOrder = (order) => {
    setSelectedOrder(order);
    setCurrentPage("createDelivery");
  };

  const handleBackToMain = () => {
    setCurrentPage("main");
    setSelectedOrder(null);
  };

  const handleSaveDeliveryOrder = (deliveryData) => {
    // TODO: Save delivery order to backend
    console.log("Saving delivery order:", deliveryData);
    // For now, just go back to main page
    handleBackToMain();
  };

  const renderContent = () => {
    // If we're on create delivery page, show that instead
    if (currentPage === "createDelivery") {
      return (
        <CreateDeliveryOrderPage
          order={selectedOrder}
          onBack={handleBackToMain}
          onSave={handleSaveDeliveryOrder}
        />
      );
    }

    // Otherwise show the normal content based on active item
    switch (activeItem) {
      case "Quản lý đơn hàng":
        return (
          <OrderManagement
            onCreateDeliveryOrder={handleCreateDeliveryOrder}
            onBack={() => handleNavClick("Dashboard")}
          />
        );
      case "Quản lý kho":
        return (
          <InventoryManagement onBack={() => handleNavClick("Dashboard")} />
        );
      case "Theo dõi đơn hàng":
        return <OrderTracking onBack={() => handleNavClick("Dashboard")} />;
      case "Quản lý công nợ":
        return <DebtManagement onBack={() => handleNavClick("Dashboard")} />;
      case "Quản lý thanh toán":
        return <PaymentManagement onBack={() => handleNavClick("Dashboard")} />;
      case "Thông báo":
        return <NotificationManagement onBack={() => handleNavClick("Dashboard")} />;
      case "Dashboard":
      default:
        return <Dashboard onNavigate={handleNavClick} />;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      Dashboard: "Dashboard",
      "Quản lý đơn hàng": "Quản lý đơn hàng",
      "Quản lý kho": "Quản lý kho",
      "Theo dõi đơn hàng": "Theo dõi đơn hàng",
      "Quản lý công nợ": "Quản lý công nợ",
      "Quản lý thanh toán": "Quản lý thanh toán",
      "Thông báo": "Thông báo",
    };
    return titles[activeItem] || "Dashboard";
  };

  const getSectionSubtitle = () => {
    const subtitles = {
      Dashboard: "Tổng quan hoạt động của EVM",
      "Quản lý đơn hàng": "Xử lý và quản lý các đơn hàng từ đại lý",
      "Quản lý kho": "Quản lý tồn kho và sản phẩm",
      "Theo dõi đơn hàng": "Theo dõi trạng thái đơn hàng",
      "Quản lý công nợ": "Quản lý công nợ và thanh toán",
      "Quản lý thanh toán": "Quản lý thanh toán và hóa đơn",
      "Thông báo": "Quản lý thông báo hệ thống",
    };
    return subtitles[activeItem] || "Tổng quan hoạt động của EVM";
  };

  return (
    <div className="evm-staff-app">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        activeItem={activeItem}
        onToggleSidebar={toggleSidebar}
        onNavClick={handleNavClick}
      />
      <div
        className={`evm-staff-main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Top Header */}
        <div className="content-header" key={`header-${activeItem}`}>
          <div className="header-left">
            <h1 className="page-title">{getSectionTitle()}</h1>
            <p className="page-subtitle">{getSectionSubtitle()}</p>
          </div>
          <div className="header-actions">
            {activeItem !== "Dashboard" && (
              <button
                className="btn-back"
                onClick={() => handleNavClick("Dashboard")}
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
        <div className="content-area" key={activeItem}>
          {renderContent()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EVMStaffPage;
