import React, { useState, useEffect, useRef } from "react";
import "./DealerManagerPage.css";
import Sidebar from "../../components/dealerManager/Sidebar";
import Dashboard from "../../components/dealerManager/Dashboard";
import POManagement from "../../components/dealerManager/POManagement";
import PaymentManagement from "../../components/dealerManager/PaymentManagement";
import DebtManagement from "../../components/dealerManager/DebtManagement";
import InventoryManagement from "../../components/dealerManager/InventoryManagement";
import NotificationPopup from "../../components/dealerManager/NotificationPopup";
import ToastContainer from "../../components/shared/ToastContainer";
import signalRService from "../../services/signalRService";
import authService from "../../services/AuthService";

const DealerManagerPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const signalRInitialized = useRef(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (itemName) => {
    // If clicking on "Thông báo", open popup instead of navigating
    if (itemName === "Thông báo") {
      setShowNotificationPopup(true);
    } else {
      setActiveItem(itemName);
    }
  };

  const handleNotificationPopupClose = () => {
    setShowNotificationPopup(false);
    // Trigger refresh notification count
    setTimeout(() => {
      window.dispatchEvent(new Event('dealerManagerRefreshNotifications'));
    }, 500);
  };

  const handleNotificationsRead = () => {
    // Trigger refresh notification count
    window.dispatchEvent(new Event('dealerManagerRefreshNotifications'));
  };

  const handleBackToHome = () => {
    setActiveItem("Trang chủ");
  };

  // Initialize SignalR connection for Dealer Manager
  useEffect(() => {
    if (!signalRInitialized.current) {
      signalRInitialized.current = true;
      
      // Get dealerId from JWT token
      let dealerId = null;
      try {
        const token = authService.getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          dealerId = payload["dealer_id"] || payload["DealerId"];
        }
      } catch (error) {
        console.error("Error parsing token for dealerId:", error);
      }

      if (!dealerId) {
        console.warn("No dealerId found, cannot connect to SignalR");
        return;
      }

      const handleClaimSettled = (data) => {
        console.log("Dealer Manager received claim settled notification:", data);
        // Trigger refresh notification count in sidebar
        window.dispatchEvent(new Event('dealerManagerRefreshNotifications'));
      };

      const handleDealerCreditUpdated = (data) => {
        console.log("Dealer Manager received credit updated notification:", data);
        // Trigger refresh dashboard credit data
        window.dispatchEvent(new CustomEvent('dealerManagerCreditUpdated', { detail: data }));
      };

      signalRService.startConnection(
        dealerId.toString(),
        null, // onVinAvailable
        null, // onVinsReceived
        handleClaimSettled, // onClaimSettled
        handleDealerCreditUpdated // onDealerCreditUpdated
      ).catch(error => {
        console.error("Failed to start SignalR connection:", error);
      });
    }

    // Cleanup on unmount
    return () => {
      // Keep connection alive for the session, don't stop on unmount
    };
  }, []);

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
        onOpenNotification={() => setShowNotificationPopup(true)}
      />

      <div className="main-content">
        <div className="dealer-manager-page-content-wrapper" key={activeItem}>
          {renderContent()}
        </div>
      </div>
      <ToastContainer />
      {/* Notification Popup */}
      <NotificationPopup
        isOpen={showNotificationPopup}
        onClose={handleNotificationPopupClose}
        onNotificationsRead={handleNotificationsRead}
      />
    </div>
  );
};

export default DealerManagerPage;
