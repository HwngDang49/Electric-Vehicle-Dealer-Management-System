import React, { useState, useEffect, useCallback } from "react";
import "./DealerStaffPage.css";
import DealerSidebar from "../../components/dealerStaff/DealerSidebar";
import CustomerManagement from "../../components/dealerStaff/CustomerManagement";
import QuotationManagement from "../../components/dealerStaff/QuotationManagement";
import OrderManagement from "../../components/dealerStaff/OrderManagement";
import VinAllocationManagement from "../../components/dealerStaff/VinAllocationManagement";
import DeliveryScheduleManagement from "../../components/dealerStaff/DeliveryScheduleManagement";
import PaymentManagement from "../../components/dealerStaff/PaymentManagement";
import CreateOrderForm from "../../components/dealerStaff/CreateOrderForm";
import orderApiService from "../../services/orderApiService";
import apiClient from "../../services/api";
import ToastContainer from "../../components/shared/ToastContainer";
import useLogout from "../../hooks/useLogout";

const DealerStaffPage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [selectedOrderForVinAllocation, setSelectedOrderForVinAllocation] =
    useState(null);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] =
    useState(null);
  const [createInvoiceFromDelivery, setCreateInvoiceFromDelivery] =
    useState(null);

  // Memoize callback to prevent re-creation on every render
  const handleNavigateToPayment = useCallback((delivery) => {
    setActiveSection("payment-management");
    setCreateInvoiceFromDelivery(delivery);
  }, []);

  // Clear createInvoiceFromDelivery after processing
  useEffect(() => {
    const handleClearCreateInvoice = () => {
      setCreateInvoiceFromDelivery(null);
    };

    window.addEventListener(
      "clearCreateInvoiceFromDelivery",
      handleClearCreateInvoice
    );
    return () =>
      window.removeEventListener(
        "clearCreateInvoiceFromDelivery",
        handleClearCreateInvoice
      );
  }, []);

  // Lắng nghe yêu cầu điều hướng từ PaymentDetailView
  useEffect(() => {
    const handler = async () => {
      await loadOrders();
      setActiveSection("order-management");
    };
    window.addEventListener("navigateToOrderManagement", handler);
    return () =>
      window.removeEventListener("navigateToOrderManagement", handler);
  }, []);
  const [dashboardStats, setDashboardStats] = useState({
    ordersToday: 0,
    appointmentsToday: 0,
    deliveredOrders: 0,
    newCustomers: 0,
  });

  // Load orders from backend
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await orderApiService.getAllOrders();
      const pagedResult = response?.value || response?.data || response;
      const ordersData = pagedResult?.items || pagedResult || [];

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
          vin: order.allocatedVin || null,
        };
      });

      setOrders(transformedOrders);

      // Calculate dashboard stats
      const today = new Date().toISOString().split("T")[0];
      const stats = {
        ordersToday: transformedOrders.filter(
          (o) => new Date(o.createdAt).toISOString().split("T")[0] === today
        ).length,
        appointmentsToday: transformedOrders.filter((o) => {
          if (!o.scheduledDeliveryDate) return false;
          return (
            new Date(o.scheduledDeliveryDate).toISOString().split("T")[0] ===
            today
          );
        }).length,
        deliveredOrders: transformedOrders.filter(
          (o) => o.status === "Delivered" || o.status === "DELIVERED"
        ).length,
        newCustomers: 0, // Will be updated separately
      };

      // Fetch customers for newCustomers stat
      try {
        const customersResponse = await apiClient.get("/customers");
        const customers =
          customersResponse.data?.value ||
          customersResponse.data?.data ||
          customersResponse.data ||
          [];
        stats.newCustomers = customers.filter((c) => {
          if (!c.createdAt && !c.CreatedAt) return false;
          return (
            new Date(c.createdAt || c.CreatedAt).toISOString().split("T")[0] ===
            today
          );
        }).length;
      } catch (error) {
        console.error("Error fetching customers:", error);
      }

      setDashboardStats(stats);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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
    await loadOrders();
  };

  const handleCreateQuotationFromCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCreateQuotation(true);
    setActiveSection("quotation-management");
  };

  const handleCreateOrderFromCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCreateOrder(true);
    setActiveSection("order-management");
  };

  const handleCloseCreateQuotation = () => {
    setShowCreateQuotation(false);
    setSelectedCustomer(null);
  };

  const handleNavigateToVinAllocation = (order) => {
    setSelectedOrderForVinAllocation(order);
    setActiveSection("vin-allocation");
  };

  const handleConvertToOrder = (orderData) => {
    setOrders((prev) => [...prev, orderData]);
    setActiveSection("order-management");
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

  // Handle section change - reset selectedOrderForVinAllocation when navigating from sidebar/dashboard
  const handleSectionChange = async (newSection) => {
    // Reset selected orders khi chuyển section (từ sidebar/dashboard)
    setSelectedOrderForVinAllocation(null);
    setSelectedOrderForDelivery(null);
    if (newSection === "order-management") {
      await loadOrders();
    }
    setActiveSection(newSection);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "customer-management":
        return (
          <CustomerManagement
            onCreateQuotation={handleCreateQuotationFromCustomer}
            onCreateOrder={handleCreateOrderFromCustomer}
          />
        );
      case "quotation-management":
        return (
          <QuotationManagement
            showCreateForm={showCreateQuotation}
            selectedCustomer={selectedCustomer}
            onCloseCreateForm={handleCloseCreateQuotation}
            onConvertToOrder={handleConvertToOrder}
            onReloadOrders={loadOrders}
            onNavigateToOrders={() => setActiveSection("order-management")}
          />
        );
      case "order-management":
        return (
          <>
            {showCreateOrder ? (
              <CreateOrderForm
                selectedCustomer={selectedCustomer}
                onBackToList={() => setShowCreateOrder(false)}
                onClose={() => setShowCreateOrder(false)}
                onSave={async (newOrder) => {
                  setOrders((prev) => [newOrder, ...prev]);
                  await loadOrders();
                  setShowCreateOrder(false);
                }}
              />
            ) : (
              <OrderManagement
                onNavigateToVinAllocation={handleNavigateToVinAllocation}
                onNavigateToDelivery={(orderData) => {
                  setSelectedOrderForDelivery(orderData);
                  setActiveSection("delivery-schedule");
                }}
                orders={orders}
                onContractCreated={handleContractCreated}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
          </>
        );
      case "vin-allocation":
        return (
          <VinAllocationManagement
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onNavigateToDelivery={(orderData) => {
              setSelectedOrderForDelivery(orderData);
              setActiveSection("delivery-schedule");
            }}
            selectedOrderForAllocation={selectedOrderForVinAllocation}
          />
        );
      case "delivery-schedule":
        return (
          <DeliveryScheduleManagement
            onNavigateToPayment={handleNavigateToPayment}
            selectedOrderForDelivery={selectedOrderForDelivery}
            onScheduleSuccess={loadOrders}
          />
        );
      case "payment-management":
        return (
          <PaymentManagement
            orders={orders}
            onCreateInvoiceFromDelivery={createInvoiceFromDelivery}
            onClearCreateInvoice={() => setCreateInvoiceFromDelivery(null)}
          />
        );
      case "dashboard":
      default:
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Đơn hàng hôm nay</h3>
                <div className="stat-number">{dashboardStats.ordersToday}</div>
              </div>
              <div className="stat-card">
                <h3>Lịch hẹn hôm nay</h3>
                <div className="stat-number">
                  {dashboardStats.appointmentsToday}
                </div>
              </div>
              <div className="stat-card">
                <h3>Xe đã giao</h3>
                <div className="stat-number">
                  {dashboardStats.deliveredOrders}
                </div>
              </div>
              <div className="stat-card">
                <h3>Khách hàng mới</h3>
                <div className="stat-number">{dashboardStats.newCustomers}</div>
              </div>
            </div>

            <div className="content-section">
              <h2>Quy trình bán hàng nhanh</h2>
              <div className="feature-grid">
                <div
                  className="feature-card"
                  onClick={() => handleSectionChange("customer-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </div>
                  <h3>Quản lý khách hàng</h3>
                  <p>Tạo và quản lý hồ sơ khách hàng</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => handleSectionChange("quotation-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                    </svg>
                  </div>
                  <h3>Tạo báo giá</h3>
                  <p>Lập báo giá cho khách hàng</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => handleSectionChange("order-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  </div>
                  <h3>Tạo đơn hàng</h3>
                  <p>Tạo đơn hàng mới</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => handleSectionChange("vin-allocation")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  </div>
                  <h3>Phân bổ VIN</h3>
                  <p>Quản lý phân bổ VIN cho đơn hàng</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => handleSectionChange("delivery-schedule")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                  </div>
                  <h3>Lịch giao xe</h3>
                  <p>Theo dõi lịch giao xe</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => handleSectionChange("payment-management")}
                >
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <h3>Thanh toán</h3>
                  <p>Quản lý thanh toán</p>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  const getSectionTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      "customer-management": "Quản lý khách hàng",
      "quotation-management": "Quản lý báo giá",
      "order-management": "Quản lý đơn hàng",
      "vin-allocation": "Phân bổ VIN",
      "delivery-schedule": "Lịch giao xe",
      "payment-management": "Thanh toán",
    };
    return titles[activeSection] || "Dashboard";
  };

  const getSectionSubtitle = () => {
    const subtitles = {
      dashboard: "Tổng quan hoạt động của dealer",
      "customer-management": "Quản lý thông tin khách hàng",
      "quotation-management": "Quản lý báo giá và đề xuất",
      "order-management": "Quản lý đơn đặt hàng",
      "vin-allocation": "Phân bổ VIN cho đơn hàng",
      "delivery-schedule": "Lịch trình giao xe",
      "payment-management": "Quản lý thanh toán và hóa đơn",
    };
    return subtitles[activeSection] || "Tổng quan hoạt động của dealer";
  };

  const handleLogout = useLogout();

  return (
    <div className="dealer-staff-page-wrapper">
      {/* Sidebar */}
      <DealerSidebar
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        userName="Dealer Staff"
        userEmail="staff@dealer.com"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="dealer-main-content">
        {/* Top Header */}
        <div className="content-header" key={`header-${activeSection}`}>
          <div className="header-left">
            <h1 className="page-title">{getSectionTitle()}</h1>
            <p className="page-subtitle">{getSectionSubtitle()}</p>
          </div>
          <div className="header-actions">
            {activeSection !== "dashboard" && (
              <button
                className="btn-back"
                onClick={() => handleSectionChange("dashboard")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area" key={activeSection}>
          {renderContent()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DealerStaffPage;
