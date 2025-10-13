import React, { useState } from "react";
import "./DealerManagerPage.css";
import Sidebar from "../../components/dealerManager/Sidebar";
import Header from "../../components/dealerManager/Header";
import Dashboard from "../../components/dealerManager/Dashboard";
import OrderManagement from "../../components/dealerManager/OrderManagement";
import PaymentManagement from "../../components/dealerManager/PaymentManagement";
import DebtManagement from "../../components/dealerManager/DebtManagement";
import PromotionManagement from "../../components/dealerManager/PromotionManagement";
import AnalyticsDashboard from "../../components/dealerManager/AnalyticsDashboard";

const DealerManagerPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(4);

  // State for orders management
  const [orders, setOrders] = useState([]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
  };

  const handleUpdateOrderStatus = (orderId, newStatus, newStatusType) => {
    console.log(
      `Updating order ${orderId} to status ${newStatus} (${newStatusType})`
    );
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusType: newStatusType,
            }
          : order
      );
      console.log("Updated orders after status change:", updatedOrders);
      return updatedOrders;
    });
  };

  const renderContent = () => {
    switch (activeItem) {
      case "Quản lý đơn hàng":
        return (
          <OrderManagement
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case "Thanh toán":
        return <PaymentManagement orders={orders} />;
      case "Công nợ":
        return <DebtManagement orders={orders} />;
      case "Khuyến mãi":
        return <PromotionManagement />;
      case "Dashboard":
        return <AnalyticsDashboard orders={orders} />;
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
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality here
    }
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
        />

        {renderContent()}
      </div>
    </div>
  );
};

export default DealerManagerPage;
