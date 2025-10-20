import React, { useState, useEffect } from "react";
import "./OrderManagement.css";
import OrderDetailModal from "./OrderDetailModal";
import { formatDate } from "../../utils/dateUtils";
import {
  fetchOrders,
  approveOrder,
  rejectOrder,
  filterOrders,
  sortOrders,
  canApproveOrder,
  canRejectOrder,
} from "../../services/orderService";

const OrderManagement = ({ onCreateDeliveryOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load orders on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await fetchOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  // Filter and sort orders
  const filteredOrders = sortOrders(
    filterOrders(orders, {
      searchQuery,
      statusFilter,
    }),
    sortBy,
    sortOrder
  );

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleApproveOrder = async (orderId) => {
    try {
      const updatedOrder = await approveOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error approving order:", error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const updatedOrder = await rejectOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const handleCreateDeliveryOrder = (order) => {
    if (onCreateDeliveryOrder) {
      onCreateDeliveryOrder(order);
    }
    handleCloseModal();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="evm-staff-order-management">
        <div className="evm-staff-loading">
          <div className="evm-staff-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evm-staff-order-management">
      <div className="evm-staff-page-header">
        <h1>Quản lý đơn hàng</h1>
        <p>Xử lý và quản lý các đơn hàng từ đại lý</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="evm-staff-controls">
        <div className="evm-staff-search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo PO ID, Dealer ID, tên đại lý..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="evm-staff-search-input"
          />
        </div>
        <div className="evm-staff-filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="evm-staff-filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="evm-staff-sort-select"
          >
            <option value="date">Sắp xếp theo ngày</option>
            <option value="amount">Sắp xếp theo số tiền</option>
            <option value="dealerName">Sắp xếp theo tên đại lý</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="evm-staff-sort-btn"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="evm-staff-table-container">
        <div className="evm-staff-table-header">
          <div className="evm-staff-table-cell">PO ID</div>
          <div className="evm-staff-table-cell">Dealer ID</div>
          <div className="evm-staff-table-cell">Số tiền</div>
          <div className="evm-staff-table-cell">Trạng thái</div>
          <div className="evm-staff-table-cell">Ngày</div>
          <div className="evm-staff-table-cell">Thao tác</div>
        </div>
        <div className="evm-staff-table-body">
          {filteredOrders.length === 0 ? (
            <div className="evm-staff-empty-state">
              <p>Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="evm-staff-table-row">
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-po-id">{order.id}</span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-dealer-id">{order.dealerId}</span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-amount">
                    {formatCurrency(order.amount)}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span
                    className={`evm-staff-status evm-staff-status-${order.status}`}
                  >
                    {order.statusText}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <span className="evm-staff-date">
                    {formatDate(order.date)}
                  </span>
                </div>
                <div className="evm-staff-table-cell">
                  <button
                    className="evm-staff-view-details-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApproveOrder}
        onReject={handleRejectOrder}
        onCreateDeliveryOrder={handleCreateDeliveryOrder}
      />
    </div>
  );
};

export default OrderManagement;
