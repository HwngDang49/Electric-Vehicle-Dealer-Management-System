import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import PageHeader from "./PageHeader";
import dealerApiService from "../../services/dealerApi";
import orderApiService from "../../services/orderApi";
import invoiceApiService from "../../services/invoiceApi";
import { vinApiService } from "../../services";
import authService from "../../services/AuthService";

const Dashboard = ({ onNavigate }) => {
  const [dealerCredit, setDealerCredit] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [currentDealerId, setCurrentDealerId] = useState(null);

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

  // Get current dealer ID from JWT token
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const dealerIdClaim = payload["dealer_id"];
        if (dealerIdClaim) {
          setCurrentDealerId(parseInt(dealerIdClaim));
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
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

  // Load pending and paid invoices count
  useEffect(() => {
    const loadInvoicesCount = async () => {
      if (currentDealerId === null) return;

      try {
        setInvoicesLoading(true);
        const data = await invoiceApiService.getList();
        let invoiceList = Array.isArray(data) ? data : [];

        // Filter invoices by current dealer ID
        invoiceList = invoiceList.filter(
          (invoice) => invoice.dealerId === currentDealerId
        );

        // Count pending invoices (status = "Pending")
        const pendingCount = invoiceList.filter(
          (invoice) =>
            invoice.status === "Pending" || invoice.status === "pending"
        ).length;

        // Count paid invoices (status = "Paid")
        const paidCount = invoiceList.filter(
          (invoice) => invoice.status === "Paid" || invoice.status === "paid"
        ).length;

        setPendingInvoices(pendingCount);
        setPaidInvoices(paidCount);

        // 👉 Tính doanh thu 6 tháng gần nhất (Paid invoices) cho dealer hiện tại
        const now = new Date();

        // Tạo danh sách 6 tháng (key để group + label hiển thị)
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // ví dụ: 2025-1
          const label = `T${d.getMonth() + 1}`;
          months.push({ key, label });
        }

        // Lọc invoices đã Paid, thuộc 6 tháng gần nhất
        const paidInvoicesForRevenue = invoiceList.filter((inv) => {
          const status = (inv.status || inv.Status || "").toLowerCase();
          if (status !== "paid") return false;

          const dateStr =
            inv.paidAt || inv.PaidAt || inv.issuedAt || inv.IssuedAt;
          if (!dateStr) return false;

          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime())) return false;

          const ym = `${d.getFullYear()}-${d.getMonth() + 1}`;
          return months.some((m) => m.key === ym);
        });

        // Group doanh thu theo month & loại invoice (đơn vị: VND - giữ nguyên)
        const revenueMap = {};
        paidInvoicesForRevenue.forEach((inv) => {
          const dateStr =
            inv.paidAt || inv.PaidAt || inv.issuedAt || inv.IssuedAt;
          const d = new Date(dateStr);
          const ym = `${d.getFullYear()}-${d.getMonth() + 1}`;

          const rawType =
            inv.invoiceType || inv.InvoiceType || inv.type || inv.Type || "";
          const type = rawType.toString().toLowerCase();
          const isB2B = type === "b2b" || type === "1";
          const isRetail = type === "retail" || type === "0";

          const amountVnd = Number(inv.amount || inv.Amount || 0);
          if (!revenueMap[ym]) {
            revenueMap[ym] = { b2b: 0, retail: 0 };
          }

          if (isB2B) {
            revenueMap[ym].b2b += amountVnd; // Giữ nguyên VND
          } else if (isRetail) {
            revenueMap[ym].retail += amountVnd; // Giữ nguyên VND
          } else {
            // Nếu không xác định type, cho vào B2B để không mất doanh thu
            revenueMap[ym].b2b += amountVnd; // Giữ nguyên VND
          }
        });

        // Build mảng cho chart (đảm bảo đủ 6 tháng, thiếu thì = 0 cho từng loại)
        const chartData = months.map((m) => {
          const entry = revenueMap[m.key] || { b2b: 0, retail: 0 };
          return {
            month: m.label,
            b2b: entry.b2b || 0, // Giữ nguyên VND
            retail: entry.retail || 0, // Giữ nguyên VND
          };
        });

        setRevenueByMonth(chartData);
      } catch (error) {
        console.error("❌ Error loading invoices count:", error);
        setPendingInvoices(0);
        setPaidInvoices(0);
        setRevenueByMonth([]);
      } finally {
        setInvoicesLoading(false);
      }
    };

    loadInvoicesCount();
  }, [currentDealerId]);

  // Load total vehicles in inventory (excluding Delivered status)
  useEffect(() => {
    const loadTotalVehicles = async () => {
      try {
        setVehiclesLoading(true);
        const response = await vinApiService.getVinList({});
        const warehouseData = Array.isArray(response)
          ? response
          : response?.data || [];

        // Calculate total vehicles from all branches (excluding Delivered)
        let total = 0;
        warehouseData.forEach((branch) => {
          const quantityInfo = branch.QuantityInfo || branch.quantityInfo;
          if (quantityInfo) {
            // Sum up InStock, Allocated, and Ready (exclude Delivered)
            const inStock = Number(
              quantityInfo.InStockQuantity || quantityInfo.inStockQuantity || 0
            );
            const allocated = Number(
              quantityInfo.AllocatedQuantity ||
                quantityInfo.allocatedQuantity ||
                0
            );
            const ready = Number(
              quantityInfo.ReadyQuantity || quantityInfo.readyQuantity || 0
            );

            total += inStock + allocated + ready;
          }
        });

        setTotalVehicles(total);
      } catch (error) {
        console.error("❌ Error loading total vehicles:", error);
        setTotalVehicles(0);
      } finally {
        setVehiclesLoading(false);
      }
    };

    loadTotalVehicles();
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
    {
      title: "Tổng số đơn hàng chờ thanh toán",
      value: invoicesLoading ? "Đang tải..." : formatCurrency(pendingInvoices),
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
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
    {
      title: "Tổng số đơn hàng đã thanh toán",
      value: invoicesLoading ? "Đang tải..." : formatCurrency(paidInvoices),
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
    {
      title: "Tổng số lượng xe có trong kho",
      value: vehiclesLoading ? "Đang tải..." : formatCurrency(totalVehicles),
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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
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

  // Split stats into two groups: first 4 and last 4
  const firstStatsGroup = stats.slice(0, 4);
  const secondStatsGroup = stats.slice(4, 8);

  const maxRevenue =
    revenueByMonth.length > 0
      ? Math.max(
          ...revenueByMonth.map((m) => Math.max(m.b2b || 0, m.retail || 0)),
          1
        )
      : 1;

  return (
    <div className="dashboard">
      <PageHeader title="Dashboard" subtitle="Tổng quan hoạt động của Dealer" />
      <div className="dashboard-content">
        {/* Debt Overview Section - First 4 cards */}
        <div className="content-section">
          <h2>Tổng quan công nợ</h2>
          <div className="stats-grid">
            {firstStatsGroup.map((stat, index) => (
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

        {/* Dealer Overview Section - Last 4 cards */}
        <div className="content-section">
          <h2>Tổng quan đại lý</h2>
          <div className="stats-grid">
            {secondStatsGroup.map((stat, index) => (
              <div key={index + 4} className="stat-card">
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

        {/* Charts Section - Doanh thu 6 tháng gần nhất */}
        <div className="content-section charts-section">
          <h2>Biểu đồ doanh thu (6 tháng gần nhất)</h2>
          <p className="charts-subtitle">
            Dữ liệu dựa trên các hóa đơn đã thanh toán (đơn vị: VND)
          </p>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Doanh thu theo tháng</div>
              {revenueByMonth.length === 0 ? (
                <div className="bar-chart-dual no-data">
                  Chưa có doanh thu trong 6 tháng gần đây
                </div>
              ) : (
                <>
                  <div className="bar-chart-dual">
                    {revenueByMonth.map((item) => {
                      const b2bHeight =
                        ((item.b2b || 0) / maxRevenue || 0) * 100;
                      const retailHeight =
                        ((item.retail || 0) / maxRevenue || 0) * 100;
                      return (
                        <div key={item.month} className="bar-dual-wrapper">
                          <div className="bar-dual-group">
                            <div
                              className="bar-dual bar-b2b"
                              style={{ height: `${b2bHeight}%` }}
                              title={`B2B: ${formatCurrency(item.b2b)} VND`}
                            >
                              {item.b2b > 0 && (
                                <span className="bar-dual-value">
                                  {formatCurrency(item.b2b)}
                                </span>
                              )}
                            </div>
                            <div
                              className="bar-dual bar-retail"
                              style={{ height: `${retailHeight}%` }}
                              title={`Retail: ${formatCurrency(item.retail)} VND`}
                            >
                              {item.retail > 0 && (
                                <span className="bar-dual-value">
                                  {formatCurrency(item.retail)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bar-dual-label">{item.month}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bar-chart-legend">
                    <div className="legend-item">
                      <span className="legend-color legend-b2b" />
                      <span>B2B</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-retail" />
                      <span>Retail</span>
                    </div>
                  </div>
                </>
              )}
            </div>
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
