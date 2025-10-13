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

  // State for quotation creation
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // State for VIN allocation navigation
  const [selectedOrderForVinAllocation, setSelectedOrderForVinAllocation] =
    useState(null);

  // State for orders management
  const [orders, setOrders] = useState([]);

  // State for delivery schedules
  // Delivery schedules state removed - UI only

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

  const handleNavigateToVinAllocation = (order) => {
    console.log(
      "DealerStaffPage handleNavigateToVinAllocation called with order:",
      order
    );

    // Update the order in the orders list with Pending status
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((o) =>
        o.id === order.id
          ? { ...o, status: "Pending", statusType: "pending" }
          : o
      );
      console.log("Updated orders list:", updatedOrders);
      return updatedOrders;
    });

    setSelectedOrderForVinAllocation(order);
    setActiveItem("Phân bổ VIN");
    console.log("Navigated to Phân bổ VIN page");
  };

  const handleConvertToOrder = (orderData) => {
    // Add new order to orders list
    setOrders((prevOrders) => [...prevOrders, orderData]);
    // Navigate to Order Management
    setActiveItem("Quản lý đơn hàng");
  };

  const handleUpdateOrderStatus = (
    orderId,
    newStatus,
    newStatusType,
    vin = null
  ) => {
    console.log(
      `Updating order ${orderId} to status ${newStatus} (${newStatusType}) with VIN ${vin}`
    );
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusType: newStatusType,
              vin: vin || order.vin,
            }
          : order
      );
      console.log("Updated orders after status change:", updatedOrders);
      return updatedOrders;
    });

    // Delivery schedule logic removed - UI only
  };

  // Delivery status update logic removed - UI only

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
            onConvertToOrder={handleConvertToOrder}
          />
        );
      case "Quản lý đơn hàng":
        return (
          <OrderManagement
            onNavigateToVinAllocation={handleNavigateToVinAllocation}
            orders={orders}
          />
        );
      case "Phân bổ VIN":
        console.log("DealerStaffPage rendering VinAllocationManagement");
        return (
          <VinAllocationManagement
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onNavigateToDelivery={(orderData) => {
              console.log(
                "Navigating to delivery schedule with order:",
                orderData
              );
              setActiveItem("Lịch giao xe");
              // Convert order to delivery schedule format
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
                console.log("Created delivery schedule:", deliverySchedule);
              }
            }}
          />
        );
      case "Lịch giao xe":
        return (
          <DeliveryScheduleManagementNew
            orders={orders}
            onNavigateToPayment={(schedule) => {
              console.log("Navigating to payment with schedule:", schedule);
              setActiveItem("Thanh toán");
            }}
          />
        );
      case "Thanh toán":
        return <PaymentManagement orders={orders} />;
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
