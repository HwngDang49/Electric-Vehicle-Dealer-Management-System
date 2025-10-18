import React, { useState } from "react";
import "./DealerStaffPage.css";
import Sidebar from "../../components/dealerStaff/Sidebar";
import Header from "../../components/dealerStaff/Header";
import Dashboard from "../../components/dealerStaff/Dashboard";
import CustomerManagement from "../../components/dealerStaff/CustomerManagement";
import QuotationManagement from "../../components/dealerStaff/QuotationManagement";
import OrderManagement from "../../components/dealerStaff/OrderManagement";
import VinAllocationManagement from "../../components/dealerStaff/VinAllocationManagement";
import DeliveryScheduleManagementNew from "../../components/dealerStaff/DeliveryScheduleManagementNew";
import PaymentManagement from "../../components/dealerStaff/PaymentManagement";

const DealerStaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [selectedOrderForVinAllocation, setSelectedOrderForVinAllocation] =
    useState(null);
  const [orders, setOrders] = useState([]);

  const handleContractCreated = (orderId, contractInfo) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, hasContract: true, contractData: contractInfo }
          : order
      )
    );
  };

  const handlePaymentSuccess = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: "Confirmed", statusType: "confirmed" }
          : order
      )
    );
  };

  const toggleSidebar = () => setSidebarCollapsed((s) => !s);

  const handleNavClick = (itemName) => {
    setActiveItem(itemName);
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

  const handleCreateOrderFromCustomer = (customer) => {
    alert(
      `Tạo đơn hàng cho khách hàng: ${customer.name ?? customer.fullName} (${
        customer.id
      })`
    );
  };

  const handleCloseCreateQuotation = () => {
    setShowCreateQuotation(false);
    setSelectedCustomer(null);
  };

  const handleNavigateToVinAllocation = (order) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, status: "Pending", statusType: "pending" }
          : o
      )
    );
    setSelectedOrderForVinAllocation(order);
    setActiveItem("Phân bổ VIN");
  };

  const handleConvertToOrder = (orderData) => {
    setOrders((prev) => [...prev, orderData]);
    setActiveItem("Quản lý đơn hàng");
  };

  const handleUpdateOrderStatus = (
    orderId,
    newStatus,
    newStatusType,
    vin = null
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusType: newStatusType,
              vin: vin || order.vin,
            }
          : order
      )
    );
  };

  const renderContent = () => {
    switch (activeItem) {
      case "Quản lý khách hàng":
        return (
          <CustomerManagement
            onCreateQuotation={handleCreateQuotationFromCustomer}
            onCreateOrder={handleCreateOrderFromCustomer}
          />
        );
      case "Quản lý báo giá":
        return (
          <QuotationManagement
            showCreateForm={showCreateQuotation}
            selectedCustomer={selectedCustomer}
            onCloseCreateForm={handleCloseCreateQuotation}
            onConvertToOrder={handleConvertToOrder}
          />
        );
      case "Quản lý đơn hàng":
        return (
          <OrderManagement
            onNavigateToVinAllocation={handleNavigateToVinAllocation}
            orders={orders}
            onContractCreated={handleContractCreated}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      case "Phân bổ VIN":
        return (
          <VinAllocationManagement
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onNavigateToDelivery={(orderData) => {
              setActiveItem("Lịch giao xe");
              if (orderData) {
                const deliverySchedule = {
                  id: `DLV-${orderData.id.slice(-4)}`,
                  orderId: orderData.id,
                  customer:
                    orderData.customer?.name || orderData.customer || "N/A",
                  place: "Chưa cập nhật",
                  time: "Chưa cập nhật",
                  status: "Delivered",
                  statusType: "delivered",
                  vin: orderData.vin || "N/A",
                  vehicle: orderData.vehicle || "N/A",
                };
              }
            }}
          />
        );
      case "Lịch giao xe":
        return (
          <DeliveryScheduleManagementNew
            orders={orders}
            onNavigateToPayment={() => setActiveItem("Thanh toán")}
          />
        );
      case "Thanh toán":
        return <PaymentManagement orders={orders} />;
      case "Trang chủ":
      default:
        return <Dashboard />;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
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
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default DealerStaffPage;
