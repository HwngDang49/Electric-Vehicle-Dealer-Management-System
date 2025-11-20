import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import orderStatisticsApiService from "../../services/orderStatisticsApi";
import "./VehicleSalesChart.css";

const VehicleSalesChart = () => {
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

      // Lấy dữ liệu tháng hiện tại (không cần params)
      const response = await orderStatisticsApiService.getVehicleSalesStatistics();
      
      const responseData = response?.data || response;
      
      if (responseData && responseData.statistics) {
        // Format data for chart
        const chartData = responseData.statistics.map((stat) => ({
          name: stat.productName,
          value: stat.totalQuantity,
          percentage: stat.percentage,
        }));

        setData(chartData);
        setPeriodLabel(responseData.periodLabel || "");
      } else {
        setData([]);
        setPeriodLabel("");
      }
    } catch (err) {
      console.error("Error fetching vehicle sales statistics:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#84cc16",
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-icon">🚗</span>
            <p className="tooltip-label">{data.name}</p>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-item">
              <div className="tooltip-item-header">
                <span className="tooltip-item-label">Số lượng bán ra</span>
              </div>
              <span className="tooltip-value" style={{ color: data.payload.fill }}>
                {data.value} xe
              </span>
            </div>
            <div className="tooltip-item">
              <div className="tooltip-item-header">
                <span className="tooltip-item-label">Tỷ lệ</span>
              </div>
              <span className="tooltip-value" style={{ color: data.payload.fill }}>
                {data.payload.percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is >= 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="vehicle-sales-chart">
      <div className="chart-header">
        <h3>Thống kê số lượng xe bán ra theo mẫu xe</h3>
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
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontSize: '13px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default VehicleSalesChart;

