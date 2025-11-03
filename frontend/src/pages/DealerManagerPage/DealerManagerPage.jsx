import React, { useState } from "react";
import "./DealerManagerPage.css";
import Sidebar from "../../components/dealerManager/Sidebar";
import Dashboard from "../../components/dealerManager/Dashboard";
import POManagement from "../../components/dealerManager/POManagement";
import PaymentManagement from "../../components/dealerManager/PaymentManagement";
import DebtManagement from "../../components/dealerManager/DebtManagement";
import InventoryManagement from "../../components/dealerManager/InventoryManagement";
import ToastContainer from "../../components/shared/ToastContainer";

const DealerManagerPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
  };

  const handleBackToHome = () => {
    setActiveItem("Trang chủ");
  };

  const renderContent = () => {
    switch (activeItem) {
      case "Quản lý đơn hàng":
        return <POManagement onNavigateToHome={handleBackToHome} />;
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

      <div className="main-content">
        <div className="dealer-manager-page-content-wrapper" key={activeItem}>
          {renderContent()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DealerManagerPage;
