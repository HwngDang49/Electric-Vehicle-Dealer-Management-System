import React, { useState } from "react";
import "./EVMStaffPage.css";
import Sidebar from "../../components/evmStaff/Sidebar";
import Header from "../../components/evmStaff/Header";
import Dashboard from "../../components/evmStaff/Dashboard";
import OrderManagement from "../../components/evmStaff/OrderManagement";
import InventoryManagement from "../../components/evmStaff/InventoryManagement";
import OrderTracking from "../../components/evmStaff/OrderTracking";
import DebtManagement from "../../components/evmStaff/DebtManagement";
import PaymentManagement from "../../components/evmStaff/PaymentManagement";
import CreateDeliveryOrderPage from "../../components/evmStaff/CreateDeliveryOrderPage";
import useLogout from "../../hooks/useLogout";

const EVMStaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
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
          <OrderManagement onCreateDeliveryOrder={handleCreateDeliveryOrder} />
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
      />
      <div className="evm-staff-main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={() => setSearchQuery("")}
          showUserDropdown={showUserDropdown}
          onToggleUserDropdown={() => setShowUserDropdown((s) => !s)}
          showNotifications={showNotifications}
          onToggleNotifications={() => {
            setShowNotifications((s) => !s);
            if (!showNotifications) setNotificationCount(0);
          }}
          notificationCount={notificationCount}
          onLogout={handleLogout}
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default EVMStaffPage;
