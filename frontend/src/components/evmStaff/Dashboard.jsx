import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import PageHeader from "./PageHeader";
import rebateApiService from "../../services/rebateApi";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import manufacturerInventoryApi from "../../services/manufacturerInventoryApi";
import invoiceApiService from "../../services/invoiceApi";

const Dashboard = ({ onNavigate }) => {
  const [totalDebt, setTotalDebt] = useState(0);
  const [ordersInProgress, setOrdersInProgress] = useState(0);
  const [productsInStock, setProductsInStock] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [paidOrders, setPaidOrders] = useState(0);
  const [debtLoading, setDebtLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [completedLoading, setCompletedLoading] = useState(true);
  const [paidLoading, setPaidLoading] = useState(true);
  // Quick access navigation items - matching sidebar features
  const quickAccessItems = [
    {
      id: "order-management",
      name: "Quản lý đơn hàng",
      subtitle: "Xử lý và quản lý các đơn hàng từ đại lý",
      path: "Quản lý đơn hàng",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      id: "inventory-management",
      name: "Quản lý kho",
      subtitle: "Quản lý và theo dõi tồn kho sản phẩm",
      path: "Quản lý kho",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
    },
    {
      id: "order-tracking",
      name: "Theo dõi đơn hàng",
      subtitle: "Theo dõi trạng thái và tiến độ đơn hàng",
      path: "Theo dõi đơn hàng",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
    },
    {
      id: "payment-management",
      name: "Quản lý thanh toán",
      subtitle: "Theo dõi và quản lý thanh toán",
      path: "Quản lý thanh toán",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      ),
    },
    {
      id: "debt-management",
      name: "Quản lý công nợ",
      subtitle: "Theo dõi và quản lý công nợ",
      path: "Quản lý công nợ",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
  ];

  // Load total debt (Pending + Approved claims)
  useEffect(() => {
    const loadTotalDebt = async () => {
      try {
        setDebtLoading(true);
        
        // Load Pending claims
        const pendingResponse = await rebateApiService.getClaims({
          status: "Pending",
          page: 1,
          pageSize: 1000, // Get all to calculate total
        });
        
        // Load Approved claims
        const approvedResponse = await rebateApiService.getClaims({
          status: "Approved",
          page: 1,
          pageSize: 1000, // Get all to calculate total
        });
        
        const pendingClaims = pendingResponse?.items || [];
        const approvedClaims = approvedResponse?.items || [];
        
        // Calculate total amount
        const totalPending = pendingClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
        const totalApproved = approvedClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
        
        const total = totalPending + totalApproved;
        setTotalDebt(total);
        
        console.log("📊 Total debt (Pending + Approved):", total);
      } catch (error) {
        console.error("❌ Error loading total debt:", error);
        setTotalDebt(0);
      } finally {
        setDebtLoading(false);
      }
    };
    
    loadTotalDebt();
  }, []);

  // Load orders in progress (PO with Submit status)
  useEffect(() => {
    const loadOrdersInProgress = async () => {
      try {
        setOrdersLoading(true);
        
        // Get all purchase orders with Submit status
        const response = await purchaseOrderApiService.getAllPurchaseOrders(1, 1000);
        
        // Backend returns PagedResult: { items: [...], page, pageSize, total, totalPages }
        const items = response?.data?.items || response?.items || [];
        
        // Filter PO with Submit status
        const submitOrders = items.filter(
          (po) => (po.Status || po.status || "").toLowerCase() === "submit"
        );
        
        setOrdersInProgress(submitOrders.length);
        
        console.log("📦 Orders in progress (Submit status):", submitOrders.length);
      } catch (error) {
        console.error("❌ Error loading orders in progress:", error);
        setOrdersInProgress(0);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    loadOrdersInProgress();
  }, []);

  // Load total products in stock (InStock quantity from manufacturer inventory)
  useEffect(() => {
    const loadProductsInStock = async () => {
      try {
        setInventoryLoading(true);
        
        // Get all manufacturer inventory
        const response = await manufacturerInventoryApi.getManufacturerInventoryList({});
        
        // Backend returns array of products with QuantityInfo
        const inventoryList = Array.isArray(response) ? response : response?.data || [];
        
        // Calculate total InStockQuantity from all products
        const totalInStock = inventoryList.reduce((sum, product) => {
          const inStockQty = 
            product.QuantityInfo?.InStockQuantity || 
            product.quantityInfo?.inStockQuantity || 
            0;
          return sum + inStockQty;
        }, 0);
        
        setProductsInStock(totalInStock);
        
        console.log("📦 Total products in stock (InStock):", totalInStock);
      } catch (error) {
        console.error("❌ Error loading products in stock:", error);
        setProductsInStock(0);
      } finally {
        setInventoryLoading(false);
      }
    };
    
    loadProductsInStock();
  }, []);

  // Load total completed orders (Purchase Orders with Delivery status)
  useEffect(() => {
    const loadCompletedOrders = async () => {
      try {
        setCompletedLoading(true);
        
        // Get all purchase orders
        const response = await purchaseOrderApiService.getAllPurchaseOrders(1, 1000);
        
        // Backend returns PagedResult: { items: [...], page, pageSize, total, totalPages }
        const items = response?.data?.items || response?.items || [];
        
        // Filter PO with Delivery status (đã hoàn thành)
        const deliveryOrders = items.filter(
          (po) => (po.Status || po.status || "").toLowerCase() === "delivery"
        );
        
        setCompletedOrders(deliveryOrders.length);
        
        console.log("✅ Total completed orders (Delivery status):", deliveryOrders.length);
      } catch (error) {
        console.error("❌ Error loading completed orders:", error);
        setCompletedOrders(0);
      } finally {
        setCompletedLoading(false);
      }
    };
    
    loadCompletedOrders();
  }, []);

  // Load total paid orders (Invoices with Paid status)
  useEffect(() => {
    const loadPaidOrders = async () => {
      try {
        setPaidLoading(true);
        
        // Get all invoices
        const invoices = await invoiceApiService.getList();
        const invoiceList = Array.isArray(invoices) ? invoices : invoices?.data || [];
        
        // Filter invoices with Paid status (đã thanh toán)
        const paidInvoices = invoiceList.filter(
          (invoice) => (invoice.Status || invoice.status || "").toLowerCase() === "paid"
        );
        
        setPaidOrders(paidInvoices.length);
        
        console.log("💰 Total paid orders (Paid invoices):", paidInvoices.length);
      } catch (error) {
        console.error("❌ Error loading paid orders:", error);
        setPaidOrders(0);
      } finally {
        setPaidLoading(false);
      }
    };
    
    loadPaidOrders();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `₫${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₫${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="evm-staff-dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Hệ thống quản lý EVM Staff - Quản lý đơn hàng, kho hàng và theo dõi hoạt động"
      />

      {/* Metrics Cards */}
      <div className="evm-staff-dashboard-content">
        <div className="evm-staff-metrics-grid">
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">
                {completedLoading ? "Đang tải..." : completedOrders}
              </div>
              <div className="evm-staff-metric-title">Tổng đơn hàng đã hoàn thành</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                  <path d="M7 14h.01M17 14h.01"></path>
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">
                {paidLoading ? "Đang tải..." : paidOrders}
              </div>
              <div className="evm-staff-metric-title">Tổng số lượng các đơn hàng đã thanh toán</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">
                {inventoryLoading ? "Đang tải..." : productsInStock}
              </div>
              <div className="evm-staff-metric-title">Sản phẩm trong kho</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">
                {ordersLoading ? "Đang tải..." : ordersInProgress}
              </div>
              <div className="evm-staff-metric-title">Đơn hàng đang xử lý</div>
            </div>
          </div>
          <div className="evm-staff-metric-card">
            <div className="evm-staff-metric-header">
              <div
                className="evm-staff-metric-icon"
                style={{
                  backgroundColor: "#20c997",
                  color: "#FFFFFF",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div className="evm-staff-metric-content">
              <div className="evm-staff-metric-value">
                {debtLoading ? "Đang tải..." : formatCurrency(totalDebt)}
              </div>
              <div className="evm-staff-metric-title">Tổng công nợ</div>
            </div>
          </div>
        </div>

        {/* Quick Sale Process Section */}
        <div className="evm-staff-content-section">
          <h2>Quy trình bán hàng nhanh</h2>
          <div className="evm-staff-feature-grid">
            {quickAccessItems.map((item) => (
              <div
                key={item.id}
                className="evm-staff-feature-card"
                onClick={() => onNavigate && onNavigate(item.path)}
              >
                <div className="evm-staff-feature-icon">{item.icon}</div>
                <h3>{item.name}</h3>
                <p>{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
