import React, { useState, useEffect } from "react";
import "./OrderManagement.css";
import OrderDetailModal from "./OrderDetailModal";
import VinSelectionModal from "./VinSelectionModal";
import { formatDate } from "../../utils/dateUtils";
import { fetchOrders, rejectOrder } from "../../services/orderService";
import invoiceApiService from "../../services/invoiceApi";
import purchaseOrderApiService from "../../services/purchaseOrderApi";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVinModalOpen, setIsVinModalOpen] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // "all", "has", "none"

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
        const result = await fetchOrders(currentPage, 5, statusFilter);
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
  }, [currentPage, statusFilter]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleInvoiceFilterChange = (filter) => {
    setInvoiceFilter(filter);
    setCurrentPage(1);
  };

  // AUTO CONFIRM - FIFO allocation
  const handleAutoConfirm = async (order) => {
    try {
      console.log("🤖 Auto confirming order (FIFO):", order.id);

      // Extract PO ID from "PO-30" format
      const poId = order.id.toString().replace("PO-", "");

      await purchaseOrderApiService.confirmPurchaseOrder(poId);

      // Reload orders
      const result = await fetchOrders(currentPage, 5, statusFilter);
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
      alert("✅ Xác nhận đơn hàng thành công với VIN tự động (FIFO)!");
    } catch (error) {
      console.error("❌ Error auto confirming order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      alert("❌ Lỗi khi xác nhận đơn hàng: " + errorMsg);
    }
  };

  // MANUAL CONFIRM - User selects VINs
  const handleManualConfirm = (order) => {
    console.log("✋ Opening manual VIN selection for:", order.id);
    setSelectedOrder(order);
    setIsModalOpen(false); // Close detail modal
    setIsVinModalOpen(true); // Open VIN selection modal
  };

  const handleManualConfirmSubmit = async (vinAllocations) => {
    try {
      console.log("🔧 Manual confirming order with VINs:", vinAllocations);

      // Extract PO ID
      const poId = selectedOrder.id.toString().replace("PO-", "");

      await purchaseOrderApiService.confirmPurchaseOrderManual({
        poId: parseInt(poId),
        vinAllocations: vinAllocations,
      });

      // Reload orders
      const result = await fetchOrders(currentPage, 5, statusFilter);
      setOrders(result.orders || []);
      setPagination(
        result.pagination || {
          totalCount: 0,
          pageNumber: 1,
          pageSize: 5,
          totalPages: 0,
        }
      );

      setIsVinModalOpen(false);
      setSelectedOrder(null);
      alert("✅ Xác nhận đơn hàng thành công với VIN đã chọn!");
    } catch (error) {
      console.error("❌ Error manual confirming order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      alert("❌ Lỗi khi xác nhận đơn hàng: " + errorMsg);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleRejectOrder = async (orderId) => {
    try {
      await rejectOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: "Cancel", statusText: "Cancel" }
            : order
        )
      );
      handleCloseModal();
    } catch {
      // Silent fail
    }
  };

  const handleCreateInvoice = async (order) => {
    try {
      console.log("📄 Creating invoice for order:", order);

      // Convert order.id from "PO-30" to 30
      const poId = order.id.toString().replace("PO-", "");

      const invoiceData = {
        poId: poId,
        dealerId: order.dealerId,
        branchId: order.branchId,
        amount: order.amount,
      };

      console.log("📤 Sending invoice data:", invoiceData);
      await invoiceApiService.createInvoice(invoiceData);

      // Reload orders from backend to get updated data
      const result = await fetchOrders(currentPage, 5, statusFilter);
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
      alert("✅ Tạo Invoice B2B thành công!");
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      alert("❌ Lỗi khi tạo Invoice: " + errorMsg);
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

  const formatPOId = (id) => {
    // If already in PO-XX format, return as is
    if (typeof id === "string" && id.startsWith("PO-")) {
      return id;
    }
    // Otherwise, format as PO-XX
    return `PO-${id}`;
  };

  // Get order status text in Vietnamese
  const getOrderStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "SUBMIT":
        return "Đã gửi";
      case "CONFIRM":
        return "Xác nhận";
      case "INTRANSIT":
        return "Đang vận chuyển";
      case "DELIVERY":
        return "Đã giao";
      case "DRAFT":
        return "Nháp";
      case "REJECT":
        return "Từ chối";
      case "CANCEL":
        return "Hủy";
      default:
        return status || "N/A";
    }
  };

  // Filter orders based on invoice status
  const filteredOrders = orders.filter((order) => {
    // Filter by invoice status
    const hasInvoice = order.hasInvoice || false;
    if (invoiceFilter === "has") {
      if (!hasInvoice) return false;
    } else if (invoiceFilter === "none") {
      if (hasInvoice) return false;
    }
    // "all" - no invoice filter

    return true;
  });

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
      <div className="evm-staff-content-card">
        <div className="evm-staff-header-filter-row">
          <div className="evm-staff-page-header">
            <h1>Quản lý đơn hàng</h1>
            <p>Xử lý và quản lý các đơn hàng từ đại lý</p>
          </div>

          {/* Filter Bar */}
          <div className="evm-staff-search-filter-bar">
            <div className="evm-staff-filter-section">
              <label
                htmlFor="status-filter"
                style={{ fontWeight: "bold", marginRight: "8px" }}
              >
                Trạng thái:
              </label>
              <div className="evm-staff-filter-dropdown">
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="evm-staff-status-select"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="SUBMIT">Submit</option>
                  <option value="CONFIRM">Confirm</option>
                  <option value="INTRANSIT">In Transit</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
                <div className="evm-staff-dropdown-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>

              <label
                htmlFor="invoice-filter"
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                }}
              >
                Hóa đơn:
              </label>
              <div className="evm-staff-filter-dropdown">
                <select
                  id="invoice-filter"
                  value={invoiceFilter}
                  onChange={(e) => handleInvoiceFilterChange(e.target.value)}
                  className="evm-staff-status-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="has">Đã có hóa đơn</option>
                  <option value="none">Chưa có hóa đơn</option>
                </select>
                <div className="evm-staff-dropdown-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="evm-staff-table-container">
          <div className="evm-staff-table-header">
            <div className="evm-staff-table-cell">PO ID</div>
            <div className="evm-staff-table-cell">Name</div>
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
                    <span className="evm-staff-po-id">
                      {formatPOId(order.id)}
                    </span>
                  </div>
                  <div className="evm-staff-table-cell">
                    <span className="evm-staff-dealer-name">
                      {order.dealerName || order.dealerId}
                    </span>
                  </div>
                  <div className="evm-staff-table-cell">
                    <span className="evm-staff-amount">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <div className="evm-staff-table-cell">
                    <div className="evm-staff-status-container">
                      <span
                        className={`evm-staff-status evm-staff-status-${
                          order.status
                        } ${order.hasInvoice ? "has-invoice" : ""}`}
                      >
                        {getOrderStatusText(order.status || order.statusText)}
                        {order.hasInvoice && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="evm-staff-invoice-icon"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        )}
                      </span>
                    </div>
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
              {Math.min(
                currentPage * pagination.pageSize,
                pagination.totalCount
              )}{" "}
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
                {(() => {
                  const totalPages = pagination.totalPages;

                  // Build pages array - max 3 numbers
                  const pages = [];

                  // Always show page 1
                  pages.push(1);

                  // Show appropriate middle page
                  if (totalPages > 1) {
                    if (currentPage === 1) {
                      // If on first page, show page 2
                      if (totalPages > 1) pages.push(2);
                    } else if (currentPage === totalPages) {
                      // If on last page, show second to last page
                      if (totalPages > 2) pages.push(totalPages - 1);
                    } else {
                      // Show current page
                      pages.push(currentPage);
                    }
                  }

                  // Show last page if totalPages > 1
                  if (totalPages > 1) {
                    if (!pages.includes(totalPages)) {
                      pages.push(totalPages);
                    }
                  }

                  // Return JSX without ellipsis
                  return pages.map((page) => {
                    return (
                      <button
                        key={page}
                        className={`evm-staff-pagination-page ${
                          page === currentPage ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
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
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAutoConfirm={handleAutoConfirm}
        onManualConfirm={handleManualConfirm}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* VIN Selection Modal */}
      <VinSelectionModal
        isOpen={isVinModalOpen}
        onClose={() => {
          setIsVinModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleManualConfirmSubmit}
      />
    </div>
  );
};

export default OrderManagement;
