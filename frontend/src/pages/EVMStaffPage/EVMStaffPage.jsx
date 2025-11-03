import React, { useState } from "react";
import "./EVMStaffPage.css";
import Sidebar from "../../components/evmStaff/Sidebar";
import Dashboard from "../../components/evmStaff/Dashboard";
import OrderManagement from "../../components/evmStaff/OrderManagement";
import InventoryManagement from "../../components/evmStaff/InventoryManagement";
import OrderTracking from "../../components/evmStaff/OrderTracking";
import DebtManagement from "../../components/evmStaff/DebtManagement";
import PaymentManagement from "../../components/evmStaff/PaymentManagement";
import CreateDeliveryOrderPage from "../../components/evmStaff/CreateDeliveryOrderPage";
import ToastContainer from "../../components/shared/ToastContainer";
import useLogout from "../../hooks/useLogout";

const EVMStaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleLogout = useLogout();

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
          />
        );
      case "Quản lý kho":
        return <InventoryManagement />;
      case "Theo dõi đơn hàng":
        return <OrderTracking />;
      case "Quản lý công nợ":
        return <DebtManagement />;
      case "Quản lý thanh toán":
        return <PaymentManagement />;
      case "Trang chủ":
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="evm-staff-app">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        activeItem={activeItem}
        onToggleSidebar={toggleSidebar}
        onNavClick={handleNavClick}
        onLogout={handleLogout}
      />
      <div
        className={`evm-staff-main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {renderContent()}
      </div>
      <ToastContainer />
    </div>
  );
};

export default EVMStaffPage;
