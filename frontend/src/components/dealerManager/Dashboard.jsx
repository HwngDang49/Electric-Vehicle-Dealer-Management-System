import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import PageHeader from "./PageHeader";
import dealerApiService from "../../services/dealerApi";
import orderApiService from "../../services/orderApi";
import invoiceApiService from "../../services/invoiceApi";
import { vinApiService } from "../../services";
import authService from "../../services/AuthService";
import branchApiService from "../../services/branchApi";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// Custom Tooltip component - hiển thị cố định ở vị trí cột
const CustomTooltip = ({ active, payload, coordinate, branches }) => {
  if (!active || !payload || payload.length === 0) return null;

  // Tính toán vị trí cố định:
  // - X: ở giữa cột (coordinate.x) - không đổi khi cursor di chuyển trong cột
  // - Y: cố định ở phía trên (margin top của chart)
  const x = coordinate?.x || 0;
  const y = 20; // Cố định ở phía trên chart (margin top)

  // Tạo map branchId -> branchName
  const branchMap = {};
  branches.forEach((branch) => {
    const branchId = branch.branchId || branch.BranchId;
    if (branchId) {
      branchMap[`branch_${branchId}`] =
        branch.name || branch.Name || `Chi nhánh ${branchId}`;
    }
  });

  return (
    <div
      className="custom-tooltip-fixed"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="custom-tooltip-month">
        {payload[0]?.payload?.branchName || "Chi nhánh"}
      </div>
      <div className="custom-tooltip-item" style={{ color: payload[0]?.color }}>
        <span className="custom-tooltip-label">Số lượng xe:</span>
        <span className="custom-tooltip-value">
          {payload[0]?.value || 0} xe
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dealerCredit, setDealerCredit] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [modelSalesData, setModelSalesData] = useState([]); // Dữ liệu model xe bán được cho pie chart
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [currentDealerId, setCurrentDealerId] = useState(null);
  const [branches, setBranches] = useState([]); // Danh sách chi nhánh
  const [yAxisMax, setYAxisMax] = useState(1); // Max value cho Y-axis

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

        // Tính số lượng xe bán được trong tháng hiện tại theo chi nhánh
        // Sử dụng invoiceList đã filter theo dealerId (lấy tất cả invoices của dealer, từ tất cả branches)
        // invoiceList từ GetListInvoice API đã có BranchId và đã được filter theo currentDealerId
        const now = new Date();
        const targetMonth = now.getMonth() + 1;
        const targetYear = now.getFullYear();

        // Lọc invoices đã Paid trong tháng hiện tại
        // invoiceList đã được filter theo currentDealerId (tất cả invoices của dealer, từ tất cả branches)
        const paidInvoicesForSales = invoiceList.filter((inv) => {
          const status = (inv.status || inv.Status || "").toLowerCase();
          if (status !== "paid") return false;

          const dateStr =
            inv.paidAt || inv.PaidAt || inv.issuedAt || inv.IssuedAt;
          if (!dateStr) return false;

          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime())) return false;

          const invYear = d.getFullYear();
          const invMonth = d.getMonth() + 1;

          // Chỉ lấy invoices trong tháng hiện tại
          return invYear === targetYear && invMonth === targetMonth;
        });

        console.log(
          `📊 Found ${paidInvoicesForSales.length} paid invoices in current month (all branches of dealer)`
        );

        // Group số lượng xe bán được theo branchId trong tháng
        // Mỗi invoice = 1 xe được bán
        // Lấy tất cả invoices của dealer (từ tất cả branches)
        const branchSalesMap = {}; // { branchId1: 5, branchId2: 3, ... }
        let invoicesWithoutBranch = 0;
        paidInvoicesForSales.forEach((inv) => {
          const branchId = inv.branchId || inv.BranchId || null;
          if (!branchId) {
            invoicesWithoutBranch++;
            return; // Bỏ qua invoice không có branchId
          }

          // Đếm số lượng xe (mỗi invoice = 1 xe)
          if (!branchSalesMap[branchId]) {
            branchSalesMap[branchId] = 0;
          }
          branchSalesMap[branchId] += 1;
        });

        // Debug log
        if (invoicesWithoutBranch > 0) {
          console.log(
            `⚠️ Có ${invoicesWithoutBranch} invoice không có branchId`
          );
        }
        console.log("📊 Branch sales map:", branchSalesMap);
        console.log("📊 Branches:", branches);

        // Build chart data - mỗi branch là một bar
        // Tạo mảng data với tên branch và số lượng xe
        const chartData = branches
          .map((branch) => {
            const branchId = branch.branchId || branch.BranchId;
            if (!branchId) return null;

            const branchName =
              branch.name || branch.Name || `Chi nhánh ${branchId}`;
            const salesCount = branchSalesMap[branchId] || 0;

            return {
              branchName: branchName,
              branchId: branchId,
              sales: salesCount,
            };
          })
          .filter((item) => item !== null);

        // Tính max value từ chartData để set Y-axis domain
        let maxValue = 0;
        chartData.forEach((item) => {
          if (item && typeof item.sales === "number") {
            maxValue = Math.max(maxValue, item.sales);
          }
        });
        // Nếu maxValue = 0, set thành 1 để có ít nhất 1 tick mark
        const yAxisMax = maxValue === 0 ? 1 : Math.ceil(maxValue * 1.1); // Thêm 10% padding

        setRevenueByMonth(chartData);
        setYAxisMax(yAxisMax);

        // Tính số lượng xe bán được theo tên xe cho pie chart
        // Sử dụng API GetRetailInvoicesForManager từ Purchase Orders
        const fetchModelSalesData = async () => {
          try {
            if (!currentDealerId) return;

            // Gọi API GetRetailInvoicesForManager
            // Backend sẽ tự động lấy DealerId từ JWT token và trả về pie chart data đã aggregate
            const response =
              await purchaseOrderApiService.getRetailInvoicesForManager();

            // Handle response format
            const pieChartData =
              response?.pieChartData ||
              response?.data?.pieChartData ||
              response?.value?.pieChartData ||
              [];

            console.log("📊 Pie chart data from API:", pieChartData);
            setModelSalesData(pieChartData);
          } catch (error) {
            console.error("❌ Error loading model sales data:", error);
            setModelSalesData([]);
          }
        };

        fetchModelSalesData();
      } catch (error) {
        console.error("❌ Error loading invoices count:", error);
        setPendingInvoices(0);
        setPaidInvoices(0);
        setRevenueByMonth([]);
        setModelSalesData([]);
      } finally {
        setInvoicesLoading(false);
      }
    };

    loadInvoicesCount();
  }, [currentDealerId, branches]);

  // Load branches for current dealer
  useEffect(() => {
    const loadBranches = async () => {
      if (!currentDealerId) return;

      try {
        const response = await branchApiService.getBranches({
          dealerId: currentDealerId,
        });
        const paged = response?.data ?? response;
        const fetchedBranches = Array.isArray(paged)
          ? paged
          : paged?.items ?? [];
        setBranches(fetchedBranches || []);
      } catch (error) {
        console.error("❌ Error loading branches:", error);
        setBranches([]);
      }
    };

    loadBranches();
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

  // Get first 4 stats for debt overview
  const firstStatsGroup = stats.slice(0, 4);

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

        {/* Charts Section - Doanh thu theo năm/tháng */}
        <div className="content-section charts-section">
          <div className="charts-grid charts-grid-two-columns">
            {/* Bar Chart - Left Column (50%) */}
            <div className="chart-card chart-card-half">
              <div className="chart-title">
                Số lượng xe bán được trong tháng {new Date().getMonth() + 1}/
                {new Date().getFullYear()}
              </div>
              {revenueByMonth.length === 0 ? (
                <div className="recharts-wrapper no-data">
                  {`Chưa có xe bán được trong tháng ${
                    new Date().getMonth() + 1
                  }/${new Date().getFullYear()}`}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barCategoryGap="20%"
                    barSize={60}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="branchName"
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                      angle={0}
                      textAnchor="middle"
                      height={60}
                    />
                    <YAxis
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                      label={{
                        value: "Số lượng xe",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      allowDecimals={false}
                      domain={[0, yAxisMax]}
                    />
                    <Tooltip
                      content={<CustomTooltip branches={branches} />}
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      position={{ x: undefined, y: undefined }}
                      allowEscapeViewBox={{ x: true, y: true }}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="sales"
                      name="Số lượng xe"
                      radius={[4, 4, 0, 0]}
                    >
                      {revenueByMonth.map((entry, index) => {
                        const colors = [
                          "#0ea5e9",
                          "#22c55e",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#ec4899",
                          "#14b8a6",
                          "#f97316",
                        ];
                        return (
                          <Cell
                            key={entry.branchId || index}
                            fill={colors[index % colors.length]}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart - Right Column (50%) */}
            <div className="chart-card chart-card-half">
              <div className="chart-title">
                Thống kê model xe bán được trong tháng{" "}
                {new Date().getMonth() + 1}/{new Date().getFullYear()}
              </div>
              {modelSalesData.length === 0 ? (
                <div className="recharts-wrapper no-data">
                  {`Chưa có dữ liệu model xe bán được trong tháng ${
                    new Date().getMonth() + 1
                  }/${new Date().getFullYear()}`}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelSalesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {modelSalesData.map((entry, index) => {
                        const colors = [
                          "#0ea5e9",
                          "#22c55e",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#ec4899",
                          "#14b8a6",
                          "#f97316",
                        ];
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value} xe`}
                      labelFormatter={(label) => `Model: ${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
