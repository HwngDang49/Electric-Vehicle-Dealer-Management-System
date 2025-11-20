import React, { useState, useEffect } from "react";
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
import orderStatisticsApiService from "../../services/orderStatisticsApi";
import "./OrderStatisticsChart.css";

const OrderStatisticsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodLabel, setPeriodLabel] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy dữ liệu tháng hiện tại
      const now = new Date();
      const params = {
        period: "month",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      };

      const response = await orderStatisticsApiService.getOrderStatistics(params);
      
      // handleApiResponse returns { status, data, ... } where data contains the actual response
      const responseData = response?.data || response;
      
      if (responseData && responseData.statistics) {
        // Format data for chart
        const chartData = responseData.statistics.map((stat) => ({
          dealer: stat.dealerName || stat.dealerCode,
          orders: stat.orderCount,
          purchaseOrders: stat.purchaseOrderCount || 0,
        }));

        setData(chartData);
        setPeriodLabel(responseData.periodLabel || "");
      } else {
        setData([]);
        setPeriodLabel("");
      }
    } catch (err) {
      console.error("Error fetching order statistics:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const ordersValue = payload.find(p => p.dataKey === 'orders')?.value || 0;
      const purchaseOrdersValue = payload.find(p => p.dataKey === 'purchaseOrders')?.value || 0;
      
      return (
        <div className="chart-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-icon">📊</span>
            <p className="tooltip-label">{payload[0].payload.dealer}</p>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-item">
              <div className="tooltip-item-header">
                <span className="tooltip-indicator" style={{ backgroundColor: '#6366f1' }}></span>
                <span className="tooltip-item-label">Số đơn hàng</span>
              </div>
              <span className="tooltip-value" style={{ color: '#6366f1' }}>
                {ordersValue}
              </span>
            </div>
            <div className="tooltip-item">
              <div className="tooltip-item-header">
                <span className="tooltip-indicator" style={{ backgroundColor: '#10b981' }}></span>
                <span className="tooltip-item-label">Số đơn mua</span>
              </div>
              <span className="tooltip-value" style={{ color: '#10b981' }}>
                {purchaseOrdersValue} đơn
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="order-statistics-chart">
      <div className="chart-header">
        <h3>Thống kê đơn hàng theo Dealer</h3>
      </div>

      {loading ? (
        <div className="chart-loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="chart-error">{error}</div>
      ) : data.length === 0 ? (
        <div className="chart-empty">
          Không có dữ liệu cho kỳ {periodLabel || "đã chọn"}
        </div>
      ) : (
        <div className="chart-content">
          {periodLabel && (
            <p className="period-label">Kỳ: {periodLabel}</p>
          )}
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={data}
              margin={{
                top: 30,
                right: 40,
                left: 20,
                bottom: 80,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e0e7ff"
                opacity={0.5}
              />
              <XAxis
                dataKey="dealer"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                stroke="#64748b"
                fontSize={12}
                fontWeight={500}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left"
                stroke="#6366f1"
                fontSize={12}
                fontWeight={500}
                tick={{ fill: '#6366f1' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#10b981"
                fontSize={12}
                fontWeight={500}
                tick={{ fill: '#10b981' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Bar
                yAxisId="left"
                dataKey="orders"
                name="Số đơn hàng"
                fill="url(#colorOrders)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="purchaseOrders"
                name="Số đơn mua"
                fill="url(#colorAmount)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OrderStatisticsChart;

