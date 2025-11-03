import React, { useState } from "react";
import "./DealerManagerPage.css";
import Sidebar from "../../components/dealerManager/Sidebar";
import Dashboard from "../../components/dealerManager/Dashboard";
import POManagement from "../../components/dealerManager/POManagement";
import BackorderedManagement from "../../components/dealerManager/BackorderedManagement";
import PaymentManagement from "../../components/dealerManager/PaymentManagement";
import DebtManagement from "../../components/dealerManager/DebtManagement";
import InventoryManagement from "../../components/dealerManager/InventoryManagement";
import ToastContainer from "../../components/shared/ToastContainer";

const DealerManagerPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");

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

  const handleBackToHome = () => {
    setActiveItem("Trang chủ");
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
            onNavigateToHome={handleBackToHome}
          />
        );
      case "Quản lý Backordered":
        return (
          <BackorderedManagement
            onNavigateToCreateOrder={handleNavigateWithOrderData}
            onNavigateToHome={handleBackToHome}
          />
        );
      case "Quản lý kho":
        return <InventoryManagement onNavigateToHome={handleBackToHome} />;
      case "Quản lý thanh toán":
        return <PaymentManagement onNavigateToHome={handleBackToHome} />;
      case "Quản lý công nợ":
        return <DebtManagement onNavigateToHome={handleBackToHome} />;
      case "Trang chủ":
      default:
        return <Dashboard onNavigate={handleNavClick} />;
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

      <div className="main-content">{renderContent()}</div>
      <ToastContainer />
    </div>
  );
};

export default DealerManagerPage;
