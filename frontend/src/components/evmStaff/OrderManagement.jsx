import React, { useState, useEffect, useMemo } from "react";
import "./OrderManagement.css";
import OrderDetailModal from "./OrderDetailModal";
import VinSelectionModal from "./VinSelectionModal";
import CustomDropdown from "../admin/CustomDropdown";
import { formatDate } from "../../utils/dateUtils";
import { fetchOrders, rejectOrder } from "../../services/orderService";
import invoiceApiService from "../../services/invoiceApi";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import { useToast } from "../../contexts/useToast";

const OrderManagement = ({ onCreateDeliveryOrder, onBack }) => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVinModalOpen, setIsVinModalOpen] = useState(false);

  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // "all", "has", "none"

  // Pagination state - client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load all orders on component mount (similar to PaymentManagement)
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all orders with large pageSize (similar to PaymentManagement)
      const result = await fetchOrders(1, 1000, "all");
      const allOrders = result.orders || [];

      // Sort by date descending (newest first)
      allOrders.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return dateB - dateA; // Descending order
      });

      setOrders(allOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
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
        return "Đã hủy";
      default:
        return status || "N/A";
    }
  };

  // Filter orders (similar to PaymentManagement)
  const filteredOrders = useMemo(() => {
    let list = orders;

    // Filter by status
    if (statusFilter !== "all") {
      list = list.filter(
        (order) =>
          (order.status?.toUpperCase() || "") === statusFilter.toUpperCase()
      );
    }

    // Filter by invoice status
    if (invoiceFilter === "has") {
      list = list.filter((order) => order.hasInvoice === true);
    } else if (invoiceFilter === "none") {
      list = list.filter((order) => !order.hasInvoice);
    }

    // Filter by search term
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((order) => {
        const poId = formatPOId(order.id).toLowerCase();
        const dealerName = (
          order.dealerName ||
          order.dealerId ||
          ""
        ).toLowerCase();
        return poId.includes(term) || dealerName.includes(term);
      });
    }

    return list;
  }, [orders, statusFilter, invoiceFilter, searchTerm]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, invoiceFilter]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations (similar to PaymentManagement)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get visible page numbers - Match Admin logic
  const getVisiblePages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("ellipsis");
      }
    }
    return pages;
  };

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

  // Dropdown options
  const statusFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "SUBMIT", label: "Đã gửi" },
    { value: "CONFIRM", label: "Xác nhận" },
    { value: "INTRANSIT", label: "Đang vận chuyển" },
    { value: "DELIVERY", label: "Đã giao" },
    { value: "CANCEL", label: "Đã hủy" },
  ];

  const invoiceFilterOptions = [
    { value: "all", label: "Tất cả hóa đơn" },
    { value: "has", label: "Đã có hóa đơn" },
    { value: "none", label: "Chưa có hóa đơn" },
  ];

  // AUTO CONFIRM - FIFO allocation
  const handleAutoConfirm = async (order) => {
    try {
      console.log("🤖 Auto confirming order (FIFO):", order.id);

      // Extract PO ID from "PO-30" format
      const poId = order.id.toString().replace("PO-", "");

      await purchaseOrderApiService.confirmPurchaseOrder(poId);

      // Reload all orders
      await loadOrders();

      handleCloseModal();
      toast.success("Thành công", {
        message: "Xác nhận đơn hàng thành công với VIN tự động (FIFO)!",
      });
    } catch (error) {
      console.error("❌ Error auto confirming order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi xác nhận đơn hàng: " + errorMsg,
      });
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

      // Reload all orders
      await loadOrders();

      setIsVinModalOpen(false);
      setSelectedOrder(null);
      toast.success("Thành công", {
        message: "Xác nhận đơn hàng thành công với VIN đã chọn!",
      });
    } catch (error) {
      console.error("❌ Error manual confirming order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi xác nhận đơn hàng: " + errorMsg,
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleRejectOrder = async (orderId) => {
    try {
      await rejectOrder(orderId);

      // Reload all orders
      await loadOrders();
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

      // Reload all orders
      await loadOrders();

      handleCloseModal();
      toast.success("Thành công", {
        message: "Tạo Invoice B2B thành công!",
      });
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi tạo Invoice: " + errorMsg,
      });
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      console.log("🚫 Cancelling order:", order.id);

      // Extract PO ID from "PO-30" format
      const poId = order.id.toString().replace("PO-", "");

      await purchaseOrderApiService.cancelPurchaseOrder(poId);

      // Reload all orders
      await loadOrders();

      handleCloseModal();
      toast.success("Thành công", {
        message: "Hủy đơn hàng thành công!",
      });
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi hủy đơn hàng: " + errorMsg,
      });
    }
  };

  if (loading) {
    return (
      <div className="evm-staff-order-management">
        <div className="evm-staff-loading">
          <div className="evm-staff-spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evm-staff-order-management">
        <div className="evm-staff-error-container">
          <div className="evm-staff-error-icon">⚠️</div>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button className="evm-staff-retry-btn" onClick={() => loadOrders()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evm-staff-order-management">
      <div className="order-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm đơn đặt hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={statusFilterOptions}
              placeholder="Chọn trạng thái"
              compact={true}
              minWidth="180px"
            />
            <CustomDropdown
              value={invoiceFilter}
              onChange={handleInvoiceFilterChange}
              options={invoiceFilterOptions}
              placeholder="Chọn loại hóa đơn"
              compact={true}
              minWidth="180px"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div
          className="orders-table-container"
          key={`page-${currentPage}-search-${searchTerm}`}
        >
          {loading && (
            <div className="table-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <table
            className="orders-table"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Đại lý</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    📋 Không tìm thấy đơn hàng. Thử thay đổi bộ lọc hoặc từ khóa
                    tìm kiếm
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="evm-staff-po-id">
                        {formatPOId(order.id)}
                      </span>
                    </td>
                    <td>
                      <span className="evm-staff-dealer-name">
                        {order.dealerName || order.dealerId}
                      </span>
                    </td>
                    <td>
                      <span className="evm-staff-amount">
                        {formatCurrency(order.amount)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`evm-staff-status evm-staff-status-${(
                          order.status || ""
                        ).toLowerCase()} ${
                          order.hasInvoice ? "has-invoice" : ""
                        }`}
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
                    </td>
                    <td>
                      <span className="evm-staff-date">
                        {formatDate(order.date)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => handleViewDetails(order)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Trước
              </button>

              <div className="pagination-numbers">
                {getVisiblePages().map((page, index) => {
                  if (page === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="pagination-ellipsis"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-number ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
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
        onCancelOrder={handleCancelOrder}
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
