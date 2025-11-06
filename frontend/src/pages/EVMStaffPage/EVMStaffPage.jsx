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
        <div className="evm-staff-page-content-wrapper" key={activeItem}>
          {renderContent()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EVMStaffPage;
