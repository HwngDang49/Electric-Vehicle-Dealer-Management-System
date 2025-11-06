import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import PageHeader from "./PageHeader";
import dealerApiService from "../../services/dealerApi";
import orderApiService from "../../services/orderApi";

const Dashboard = ({ onNavigate }) => {
  const [dealerCredit, setDealerCredit] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Format currency (without currency symbol)
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0";
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load dealer credit info
  useEffect(() => {
    const loadDealerCredit = async () => {
      try {
        setLoading(true);
        const creditInfo = await dealerApiService.getMyDealerCredit();

        const data = creditInfo?.data || creditInfo;

        // Handle both camelCase and PascalCase from backend
        const walletBalance = data?.walletBalance ?? data?.WalletBalance ?? 0;
        const creditUsed = data?.creditUsed ?? data?.CreditUsed ?? 0;
        const creditLimit = data?.creditLimit ?? data?.CreditLimit ?? 0;
        const creditAvailable =
          data?.creditAvailable ?? data?.CreditAvailable ?? 0;

        setDealerCredit({
          walletBalance: Number(walletBalance) || 0,
          creditUsed: Number(creditUsed) || 0,
          creditLimit: Number(creditLimit) || 0,
          creditAvailable: Number(creditAvailable) || 0,
        });
      } catch (error) {
        console.error("❌ Error loading dealer credit:", error);
        // Set default values on error
        setDealerCredit({
          walletBalance: 0,
          creditUsed: 0,
          creditLimit: 0,
          creditAvailable: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDealerCredit();
  }, []);

  // Load total orders count
  useEffect(() => {
    const loadTotalOrders = async () => {
      try {
        setOrdersLoading(true);
        // Get orders with pageSize=1 to only get totalCount without loading all data
        // Backend returns PagedResult with format: { items, page, pageSize, total, totalPages }
        const response = await orderApiService.getOrders({
          page: 1,
          pageSize: 1,
        });

        // Response format after handleApiResponse: { status, data: { items, page, pageSize, total, totalPages }, ... }
        // The 'total' field contains the real count from database (CountAsync query)
        const total =
          response?.data?.total ||
          response?.total ||
          response?.pagination?.totalCount ||
          0;

        console.log("📊 Total orders count from database:", total);
        setTotalOrders(Number(total) || 0);
      } catch (error) {
        console.error("❌ Error loading total orders:", error);
        setTotalOrders(0);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadTotalOrders();
  }, []);

  const stats = [
    {
      title: "Hạn mức còn lại",
      value: loading
        ? "Đang tải..."
        : formatCurrency(dealerCredit?.creditAvailable ?? 0),
      change: null,
      changeType: "neutral",
      iconBg: "#20c997", // Primary green
      iconColor: "#FFFFFF",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H7zm12 3H5v9h14V7z" />
        </svg>
      ),
    },
    {
      title: "Tổng doanh thu",
      value: loading
        ? "Đang tải..."
        : formatCurrency(dealerCredit?.walletBalance ?? 0),
      change: null,
      changeType: "neutral",
      iconBg: "#20c997", // Primary green
      iconColor: "#FFFFFF",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    {
      title: "Hạn mức",
      value: loading
        ? "Đang tải..."
        : formatCurrency(dealerCredit?.creditLimit ?? 0),
      change: null,
      changeType: "neutral",
      iconBg: "#20c997", // Primary green
      iconColor: "#FFFFFF",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H17c-.8 0-1.54.37-2.01.99L14 9.5 12.01 7.99A1.5 1.5 0 0 0 10 7H8.46c-.8 0-1.54.37-2.01.99L4 8.5V18h2v-6h2v6h2v-6h2v6h2v-6h2v6h2z" />
        </svg>
      ),
    },
    {
      title: "Tổng công nợ",
      value: loading
        ? "Đang tải..."
        : formatCurrency(dealerCredit?.creditUsed ?? 0),
      change: null,
      changeType: "neutral",
      iconBg: "#20c997", // Primary green
      iconColor: "#FFFFFF",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
        </svg>
      ),
    },
    {
      title: "Tổng số đơn hàng bán cho khách",
      value: ordersLoading ? "Đang tải..." : formatCurrency(totalOrders),
      change: null,
      changeType: "neutral",
      iconBg: "#20c997", // Primary green
      iconColor: "#FFFFFF",
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
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14l2 2 4-4"></path>
        </svg>
      ),
    },
  ];

  // Quick access navigation items - matching sidebar features
  const quickAccessItems = [
    {
      id: "orders",
      name: "Quản lý đơn hàng",
      subtitle: "Quản lý đơn đặt hàng từ hãng",
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
    {
      id: "inventory",
      name: "Quản lý kho",
      subtitle: "Quản lý và theo dõi các kho",
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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
    },
    {
      id: "payment",
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
      id: "debt",
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
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <PageHeader title="Dashboard" subtitle="Tổng quan hoạt động của dealer" />
      <div className="dashboard-content">
        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="section-title">Tổng quan</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <div
                    className="stat-icon"
                    style={{
                      backgroundColor: stat.iconBg,
                      color: stat.iconColor,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-title">{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Sale Process Section */}
        <div className="content-section">
          <h2>Quy trình bán hàng nhanh</h2>
          <div className="feature-grid">
            {quickAccessItems.map((item) => (
              <div
                key={item.id}
                className="feature-card"
                onClick={() => onNavigate && onNavigate(item.path)}
              >
                <div className="feature-icon">{item.icon}</div>
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
