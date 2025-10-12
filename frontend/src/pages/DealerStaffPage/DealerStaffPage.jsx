import React, { useState } from "react";
import "./DealerStaffPage.css";
import Sidebar from "../../components/dealerStaff/Sidebar";
import Header from "../../components/dealerStaff/Header";
import Dashboard from "../../components/dealerStaff/Dashboard";
import CustomerManagement from "../../components/dealerStaff/CustomerManagement";
import QuotationManagement from "../../components/dealerStaff/QuotationManagement";
import OrderManagement from "../../components/dealerStaff/OrderManagement";
import VinAllocationManagement from "../../components/dealerStaff/VinAllocationManagement";

const DealerStaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // State for quotation creation
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
    // Reset quotation creation state when navigating
    if (itemName !== "Quản lý báo giá") {
      setShowCreateQuotation(false);
      setSelectedCustomer(null);
    }
  };

  const handleCreateQuotationFromCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCreateQuotation(true);
    setActiveItem("Quản lý báo giá");
  };

  const handleCloseCreateQuotation = () => {
    setShowCreateQuotation(false);
    setSelectedCustomer(null);
  };

  const renderContent = () => {
    switch (activeItem) {
      case "Quản lý khách hàng":
        return (
          <CustomerManagement
            onCreateQuotation={handleCreateQuotationFromCustomer}
          />
        );
      case "Quản lý báo giá":
        return (
          <QuotationManagement
            showCreateForm={showCreateQuotation}
            selectedCustomer={selectedCustomer}
            onCloseCreateForm={handleCloseCreateQuotation}
          />
        );
      case "Quản lý đơn hàng":
        return <OrderManagement />;
      case "Phân bổ VIN":
        return <VinAllocationManagement />;
      case "Thanh toán":
        return (
          <div className="placeholder-content">
            <h1>Thanh toán</h1>
            <p>Trang thanh toán sẽ được phát triển trong tương lai.</p>
          </div>
        );
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
    <div className="app">
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

export default DealerStaffPage;
