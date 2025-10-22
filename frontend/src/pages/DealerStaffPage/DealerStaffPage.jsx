import React, { useState, useEffect } from "react";
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
import CreateOrderForm from "../../components/dealerStaff/CreateOrderForm";
import orderApiService from "../../services/orderApiService";

const DealerStaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const [selectedOrderForVinAllocation, setSelectedOrderForVinAllocation] =
    useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Load orders from backend
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log("📤 Loading orders from backend...");
      const response = await orderApiService.getAllOrders();
      console.log("✅ Orders response:", response);

      // Extract orders from PagedResult response
      const pagedResult = response?.value || response?.data || response;
      const ordersData = pagedResult?.items || pagedResult || [];

      console.log("📦 Orders data:", ordersData);

      // Transform backend data to frontend format
      const transformedOrders = ordersData.map((order) => {
        const date = new Date(order.createdAt);
        const dateStr = `${String(date.getDate()).padStart(2, "0")}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${date.getFullYear()}`;

        return {
          id: order.orderCode || `DH${order.orderId}`,
          backendId: order.orderId,
          customer: {
            name: order.customerName || "N/A",
            phone: order.customerPhone || "N/A",
            email: order.customerEmail || "N/A",
          },
          vehicle: {
            name: order.vehicleName || "N/A",
            color: order.vehicleColor || "N/A",
          },
          amount: order.amount || 0,
          status: order.status || "Draft",
          statusType: (order.status || "draft").toLowerCase(),
          date: dateStr,
          createdAt: order.createdAt,
          // Contract information from backend
          hasContract: order.hasContract || false,
          contractData: order.hasContract
            ? {
                contractNumber: order.contractNumber,
                depositAmount: order.depositAmount || 0,
                depositRequirement: order.depositRequirement || 0,
              }
            : null,
          depositAmount: order.depositAmount || 0,
          depositRequirement: order.depositRequirement || 0,
        };
      });

      setOrders(transformedOrders);
      console.log("✅ Orders loaded successfully:", transformedOrders.length);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      // Don't show alert, just log the error
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContractCreated = (orderId, contractInfo) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, hasContract: true, contractData: contractInfo }
          : order
      )
    );
  };

  const handlePaymentSuccess = async (orderId) => {
    console.log("💰 Payment success for order:", orderId);

    // Reload orders from backend to get updated deposit amount
    await loadOrders();

    console.log("✅ Orders reloaded after payment");
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
    setSelectedCustomer(customer);
    setShowCreateOrder(true);
    setActiveItem("Quản lý đơn hàng");
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
          <>
            {showCreateOrder ? (
              <CreateOrderForm
                selectedCustomer={selectedCustomer}
                onBackToList={() => {
                  setShowCreateOrder(false);
                }}
                onClose={() => {
                  setShowCreateOrder(false);
                }}
                onSave={async (newOrder) => {
                  // Add to local state first for immediate UI update
                  setOrders((prev) => [newOrder, ...prev]);

                  // Reload orders from backend to ensure data consistency
                  await loadOrders();

                  // Close the form
                  setShowCreateOrder(false);
                }}
              />
            ) : (
              <OrderManagement
                onNavigateToVinAllocation={handleNavigateToVinAllocation}
                orders={orders}
                onContractCreated={handleContractCreated}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
          </>
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
