import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import PageHeader from "./PageHeader";
import dealerApiService from "../../services/dealerApi";
import orderApiService from "../../services/orderApi";
import invoiceApiService from "../../services/invoiceApi";
import { vinApiService } from "../../services";
import authService from "../../services/AuthService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Custom Tooltip component - hiển thị cố định ở vị trí cột
const CustomTooltip = ({ active, payload, coordinate, formatCurrency }) => {
  if (!active || !payload || payload.length === 0) return null;

  // Tính toán vị trí cố định:
  // - X: ở giữa cột (coordinate.x) - không đổi khi cursor di chuyển trong cột
  // - Y: cố định ở phía trên (margin top của chart)
  const x = coordinate?.x || 0;
  const y = 20; // Cố định ở phía trên chart (margin top)

  return (
    <div
      className="custom-tooltip-fixed"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="custom-tooltip-month">
        {payload[0]?.payload?.month || ""}
      </div>
      {payload.map((entry, index) => (
        <div
          key={index}
          className="custom-tooltip-item"
          style={{ color: entry.color }}
        >
          <span className="custom-tooltip-label">
            {entry.name === "b2b" ? "Tổng tiền mua hàng" : "Tổng tiền bán hàng"}
            :
          </span>
          <span className="custom-tooltip-value">
            {formatCurrency(entry.value)} VND
          </span>
        </div>
      ))}
    </div>
  );
};

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(null); // null = tất cả quý
  const [selectedMonth, setSelectedMonth] = useState(null); // null = tất cả tháng

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

        // Tính doanh thu theo filter năm/quý/tháng (Paid invoices) cho dealer hiện tại
        // Tạo danh sách tháng cần hiển thị
        const months = [];
        if (selectedMonth !== null) {
          // Chỉ hiển thị tháng được chọn
          const key = `${selectedYear}-${selectedMonth}`;
          const label = `T${selectedMonth}`;
          months.push({ key, label });
        } else if (selectedQuarter !== null) {
          // Hiển thị các tháng trong quý được chọn
          // Q1: 1-3, Q2: 4-6, Q3: 7-9, Q4: 10-12
          const startMonth = (selectedQuarter - 1) * 3 + 1;
          const endMonth = selectedQuarter * 3;
          for (let m = startMonth; m <= endMonth; m++) {
            const key = `${selectedYear}-${m}`;
            const label = `T${m}`;
            months.push({ key, label });
          }
        } else {
          // Hiển thị tất cả 12 tháng trong năm được chọn
          for (let m = 1; m <= 12; m++) {
            const key = `${selectedYear}-${m}`;
            const label = `T${m}`;
            months.push({ key, label });
          }
        }

        // Lọc invoices đã Paid, theo năm/tháng được chọn
        const paidInvoicesForRevenue = invoiceList.filter((inv) => {
          const status = (inv.status || inv.Status || "").toLowerCase();
          if (status !== "paid") return false;

          const dateStr =
            inv.paidAt || inv.PaidAt || inv.issuedAt || inv.IssuedAt;
          if (!dateStr) return false;

          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime())) return false;

          const invYear = d.getFullYear();
          const invMonth = d.getMonth() + 1;

          // Filter theo năm
          if (invYear !== selectedYear) return false;

          // Filter theo quý (nếu có chọn)
          if (selectedQuarter !== null) {
            const invQuarter = Math.ceil(invMonth / 3);
            if (invQuarter !== selectedQuarter) return false;
          }

          // Filter theo tháng (nếu có chọn) - ưu tiên tháng hơn quý
          if (selectedMonth !== null && invMonth !== selectedMonth)
            return false;

          return true;
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
  }, [currentDealerId, selectedYear, selectedQuarter, selectedMonth]);

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

        {/* Charts Section - Doanh thu theo năm/tháng */}
        <div className="content-section charts-section">
          <div className="charts-header">
            <div>
              <h2>Biểu đồ doanh thu</h2>
              <p className="charts-subtitle">
                Dữ liệu dựa trên các hóa đơn đã thanh toán (đơn vị: VND)
              </p>
            </div>
            <div className="chart-filters">
              <div className="filter-group">
                <label htmlFor="year-filter">Năm:</label>
                <select
                  id="year-filter"
                  className="filter-select"
                  value={selectedYear}
                  onChange={(e) => {
                    const newYear = Number(e.target.value);
                    setSelectedYear(newYear);
                    // Giữ nguyên quý/tháng nếu hợp lệ
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="quarter-filter">Quý:</label>
                <select
                  id="quarter-filter"
                  className="filter-select"
                  value={selectedQuarter || ""}
                  onChange={(e) => {
                    const quarter =
                      e.target.value === "" ? null : Number(e.target.value);
                    setSelectedQuarter(quarter);
                    // Reset tháng khi chọn quý
                    if (quarter !== null) {
                      setSelectedMonth(null);
                    }
                  }}
                >
                  <option value="">Tất cả</option>
                  {[1, 2, 3, 4].map((q) => (
                    <option key={q} value={q}>
                      Quý {q}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="month-filter">Tháng:</label>
                <select
                  id="month-filter"
                  className="filter-select"
                  value={selectedMonth || ""}
                  onChange={(e) => {
                    const month =
                      e.target.value === "" ? null : Number(e.target.value);
                    setSelectedMonth(month);
                    // Tự động set quý tương ứng khi chọn tháng
                    if (month !== null) {
                      const quarter = Math.ceil(month / 3);
                      setSelectedQuarter(quarter);
                    } else {
                      setSelectedQuarter(null);
                    }
                  }}
                >
                  <option value="">Tất cả</option>
                  {(() => {
                    // Nếu đã chọn quý, chỉ hiển thị các tháng trong quý đó
                    if (selectedQuarter !== null) {
                      const startMonth = (selectedQuarter - 1) * 3 + 1;
                      const endMonth = selectedQuarter * 3;
                      return Array.from(
                        { length: endMonth - startMonth + 1 },
                        (_, i) => {
                          const month = startMonth + i;
                          return (
                            <option key={month} value={month}>
                              Tháng {month}
                            </option>
                          );
                        }
                      );
                    }
                    // Nếu chưa chọn quý, hiển thị tất cả 12 tháng
                    return Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <option key={month} value={month}>
                          Tháng {month}
                        </option>
                      );
                    });
                  })()}
                </select>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Doanh thu theo tháng</div>
              {revenueByMonth.length === 0 ? (
                <div className="recharts-wrapper no-data">
                  {selectedMonth
                    ? `Chưa có doanh thu trong tháng ${selectedMonth}/${selectedYear}`
                    : selectedQuarter
                    ? `Chưa có doanh thu trong quý ${selectedQuarter}/${selectedYear}`
                    : `Chưa có doanh thu trong năm ${selectedYear}`}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barCategoryGap="20%"
                    barGap={8}
                    barSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(0)}K`;
                        }
                        return value.toString();
                      }}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip formatCurrency={formatCurrency} />
                      }
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      position={{ x: undefined, y: undefined }}
                      allowEscapeViewBox={{ x: true, y: true }}
                      isAnimationActive={false}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "b2b"
                          ? "Tổng tiền mua hàng"
                          : "Tổng tiền bán hàng"
                      }
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    />
                    <Bar
                      dataKey="b2b"
                      name="b2b"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="retail"
                      name="retail"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
