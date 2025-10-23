import React, { useState, useEffect } from "react";
import "./OrderManagement.css";
import OrderDetailModal from "./OrderDetailModal";
import { formatDate } from "../../utils/dateUtils";
import {
  fetchOrders,
  approveOrder,
  rejectOrder,
} from "../../services/orderService";
import invoiceApiService from "../../services/invoiceApi";

const OrderManagement = ({ onCreateDeliveryOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 0,
  });

  // Load orders on component mount and page change
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const result = await fetchOrders(currentPage, 5);
        setOrders(result.orders || []);
        setPagination(
          result.pagination || {
            totalCount: 0,
            pageNumber: 1,
            pageSize: 5,
            totalPages: 0,
          }
        );
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [currentPage]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmOrder = async (order) => {
    try {
      console.log("🔄 Confirming order:", order.id);
      const updatedOrder = await approveOrder(order.id); // Call Confirm-po API (api/Confirm-po)

      // Reload orders to get fresh data including hasInvoice status
      const result = await fetchOrders(currentPage, 5);
      setOrders(result.orders || []);
      setPagination(
        result.pagination || {
          totalCount: 0,
          pageNumber: 1,
          pageSize: 5,
          totalPages: 0,
        }
      );

      handleCloseModal();
      alert("✅ Xác nhận đơn hàng thành công!");
    } catch (error) {
      console.error("❌ Error confirming order:", error);
      alert("Lỗi khi xác nhận đơn hàng: " + (error.message || "Unknown error"));
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const updatedOrder = await rejectOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: "Cancel", statusText: "Cancel" }
            : order
        )
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const handleCreateInvoice = async (order) => {
    try {
      console.log("Creating invoice for order:", order);
      const invoiceData = {
        poId: order.id,
        dealerId: order.dealerId,
        branchId: order.branchId,
        amount: order.amount,
      };

      await invoiceApiService.createInvoice(invoiceData);

      // Update order to mark it has invoice
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === order.id ? { ...o, hasInvoice: true } : o
        )
      );

      // Update selected order if it's the same
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, hasInvoice: true });
      }

      alert("Tạo Invoice thành công!");
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Lỗi khi tạo Invoice: " + (error.message || "Unknown error"));
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
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
          {orders.length === 0 ? (
            <div className="evm-staff-empty-state">
              <p>Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            orders.map((order) => (
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="evm-staff-pagination">
          <div className="evm-staff-pagination-info">
            Hiển thị {(currentPage - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(currentPage * pagination.pageSize, pagination.totalCount)}{" "}
            trong tổng số {pagination.totalCount} đơn hàng
          </div>
          <div className="evm-staff-pagination-controls">
            <button
              className="evm-staff-pagination-btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              ← Trước
            </button>

            <div className="evm-staff-pagination-pages">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  className={`evm-staff-pagination-page ${
                    page === currentPage ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="evm-staff-pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === pagination.totalPages}
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmOrder}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
};

export default OrderManagement;
