import React, { useState } from "react";
import "./DealerManagerPage.css";
import Sidebar from "../../components/dealerManager/Sidebar";
import Header from "../../components/dealerManager/Header";
import Dashboard from "../../components/dealerManager/Dashboard";
import POManagement from "../../components/dealerManager/POManagement";
import BackorderedManagement from "../../components/dealerManager/BackorderedManagement";
import PaymentManagement from "../../components/dealerManager/PaymentManagement";
import DebtManagement from "../../components/dealerManager/DebtManagement";
import PromotionManagement from "../../components/dealerManager/PromotionManagement";
import AnalyticsDashboard from "../../components/dealerManager/AnalyticsDashboard";
import InventoryManagement from "../../components/dealerManager/InventoryManagement";
import useLogout from "../../hooks/useLogout";

const DealerManagerPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(4);

  const handleLogout = useLogout();

  // State for passing order data from Backordered to PO Management
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
    // Clear pending order data when navigating away
    if (itemName !== "Quản lý đơn hàng") {
      setPendingOrderData(null);
    }
  };

  // Handler to navigate from Backordered to PO Management with order data
  const handleNavigateWithOrderData = (sectionName, orderData) => {
    setActiveItem(sectionName);
    if (orderData) {
      setPendingOrderData(orderData);
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case "Quản lý đơn hàng":
        return (
          <POManagement
            initialOrderData={pendingOrderData}
            onInitialDataUsed={() => setPendingOrderData(null)}
          />
        );
      case "Quản lý Backordered":
        return (
          <BackorderedManagement
            onNavigateToCreateOrder={handleNavigateWithOrderData}
          />
        );
      case "Quản lý kho":
        return <InventoryManagement />;
      case "Quản lý thanh toán":
        return <PaymentManagement />;
      case "Quản lý công nợ":
        return <DebtManagement />;
      case "Quản lý khuyến mãi":
        return <PromotionManagement />;
      case "Dashboard":
        return <AnalyticsDashboard />;
      case "Trang chủ":
      default:
        return <Dashboard />;
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotificationCount(0);
    }
  };

  return (
    <div className="dealer-manager-app">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        activeItem={activeItem}
        onToggleSidebar={toggleSidebar}
        onNavClick={handleNavClick}
      />

      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          showUserDropdown={showUserDropdown}
          onToggleUserDropdown={toggleUserDropdown}
          showNotifications={showNotifications}
          onToggleNotifications={toggleNotifications}
          notificationCount={notificationCount}
          onLogout={handleLogout}
        />

        {renderContent()}
      </div>
    </div>
  );
};

export default DealerManagerPage;
