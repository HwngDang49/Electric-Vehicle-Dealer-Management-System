import React, { useState, useEffect, useRef } from "react";
import PaymentDetailView from "./PaymentDetailView";
import CustomDropdown from "./CustomDropdown";
import invoiceApiService from "../../services/invoiceApiService";
import "./PaymentManagement.css";

const PaymentManagement = ({ orders = [], onCreateInvoiceFromDelivery, onClearCreateInvoice }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [orderForInvoice, setOrderForInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const processedDeliveryRef = useRef(null);

  // Handle creating invoice from delivery
  useEffect(() => {
    if (onCreateInvoiceFromDelivery && processedDeliveryRef.current !== onCreateInvoiceFromDelivery.id) {
      processedDeliveryRef.current = onCreateInvoiceFromDelivery.id;
      handleCreateInvoiceFromDelivery(onCreateInvoiceFromDelivery);
    }
  }, [onCreateInvoiceFromDelivery]);

  // Clear createInvoiceFromDelivery when component mounts normally (not from delivery)
  useEffect(() => {
    if (onClearCreateInvoice) {
      onClearCreateInvoice();
    }
  }, [onClearCreateInvoice]);

  // Debounce search
  useEffect(() => {
    if (searchQuery !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchTerm]);

  // Fetch retail invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize: pageSize,
        search: debouncedSearchTerm || undefined,
        status: activeFilter !== "Tất cả" ? activeFilter : undefined,
        dealerId: 1 // You might want to get this from context
      };

      const response = await invoiceApiService.getRetailInvoices(params);
      setInvoices(response.data || response.value || []);
      setTotalCount(response.totalCount || response.total || 0);
    } catch (error) {
      console.error("Error fetching retail invoices:", error);
      setInvoices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices when dependencies change
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, debouncedSearchTerm, activeFilter]);

  const handleCreateInvoiceFromDelivery = async (delivery) => {
    try {
      setLoading(true);
      console.log("Creating invoice from delivery:", delivery);
      
      // Get order details from API
      const orderData = await invoiceApiService.getOrderForInvoice(delivery.orderId);
      console.log("Order data for invoice:", orderData);
      
      // Create retail invoice (simplified)
      const invoiceData = {
        OrderId: orderData.orderId,
        DealerId: orderData.dealerId || 1, // You might need to get this from context
        Note: `Invoice for delivery ${delivery.id}`
      };
      
      const invoiceResult = await invoiceApiService.createRetailInvoice(invoiceData);
      console.log("Invoice created:", invoiceResult);
      
      // Extract invoice ID from response
      const invoiceId = invoiceResult.value || invoiceResult.data?.value || invoiceResult;
      
      // Transform order data to payment format
      const paymentData = {
        id: orderData.orderId,
        invoiceId: invoiceId,
        orderId: orderData.orderId,
        customer: orderData.customer?.fullName || "N/A",
        customerPhone: orderData.customer?.phone || "N/A",
        customerEmail: orderData.customer?.email || "N/A",
        customerIdNumber: orderData.customer?.idNumber || "N/A",
        customerAddress: orderData.customer?.address || "N/A",
        orderName: orderData.item?.productName || "N/A",
        vehicleColor: orderData.item?.productColor || "N/A",
        vehicleBatteryKwh: orderData.item?.batteryKwh || null,
        vehicleMotorKw: orderData.item?.motorKw || null,
        vehicleRangeKm: orderData.item?.rangeKm || null,
        vin: orderData.item?.vin || "N/A",
        total: orderData.totalAmount || 0,
        remaining: orderData.outstandingAmount || 0,
        status: "Draft",
        statusType: "draft",
        createdAt: orderData.createdAt || new Date(),
      };
      
      setOrderForInvoice(paymentData);
      setShowInvoiceDetail(true);
      
    } catch (error) {
      console.error("Error creating invoice from delivery:", error);
      alert("Lỗi khi tạo hóa đơn: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter
  const handleStatusFilterChange = (status) => {
    setActiveFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle invoice selection
  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  // Handle close invoice detail
  const handleCloseInvoiceDetail = () => {
    setShowInvoiceDetail(false);
    setSelectedInvoice(null);
    setOrderForInvoice(null);
  };




  // Status options for dropdown
  const statusOptions = [
    { value: "Tất cả", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Draft", label: "Nháp", icon: "📝" },
    { value: "Pending", label: "Chờ thanh toán", icon: "⏳" },
    { value: "Paid", label: "Đã thanh toán", icon: "✅" },
    { value: "Cancelled", label: "Đã hủy", icon: "❌" },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      "Pending": { text: "Chờ thanh toán", class: "status-pending" },
      "Paid": { text: "Đã thanh toán", class: "status-paid" },
      "Cancelled": { text: "Đã hủy", class: "status-cancelled" },
      "Draft": { text: "Nháp", class: "status-draft" },
      "Chờ thanh toán": { text: "Chờ thanh toán", class: "status-pending" },
      "Đã thanh toán": { text: "Đã thanh toán", class: "status-paid" },
      "Đã hủy": { text: "Đã hủy", class: "status-cancelled" },
      "Nháp": { text: "Nháp", class: "status-draft" }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (showInvoiceDetail && (selectedInvoice || orderForInvoice)) {
    return (
      <PaymentDetailView
        payment={selectedInvoice || orderForInvoice}
        onClose={handleCloseInvoiceDetail}
        onBack={handleCloseInvoiceDetail}
        onPaymentSuccess={() => {
          handleCloseInvoiceDetail();
          fetchInvoices(); // Refresh the list
        }}
        isReadOnly={false}
      />
    );
  }

  return (
    <div className="dealer-staff-payment-management-app">
      <div className="order-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm hóa đơn theo mã, khách hàng, đơn hàng..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              {isSearching && (
                <div className="search-loading-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#20c997" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" />
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
              )}
              <button className="search-btn" onClick={handleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
            
            <CustomDropdown
              value={activeFilter}
              onChange={handleStatusFilterChange}
              options={statusOptions}
              minWidth="220px"
            />
          </div>
        </div>

        <div className="orders-table-container" key={`page-${currentPage}-search-${debouncedSearchTerm}`}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    📋 {debouncedSearchTerm 
                      ? "Không tìm thấy hóa đơn phù hợp với từ khóa tìm kiếm" 
                      : "Chưa có hóa đơn nào trong hệ thống"}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.invoiceId} onClick={() => handleInvoiceClick(invoice)}>
                    <td>
                      <span className="order-id">#{invoice.invoiceNo || invoice.invoiceId}</span>
                    </td>
                    <td>
                      <div className="order-customer-name">
                        #{invoice.salesDocId || invoice.orderId}
                      </div>
                      <div className="order-customer-phone">
                        {invoice.orderName || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="order-vehicle-name">
                        {invoice.customerName || invoice.customer || "N/A"}
                      </div>
                      <div className="order-vehicle-color">
                        {invoice.customerPhone || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="order-amount">
                        {formatCurrency(invoice.amount || invoice.total || 0)}
                      </div>
                    </td>
                    <td>
                      <div className="order-amount" style={{color: '#dc2626'}}>
                        {formatCurrency(invoice.outstandingAmount || invoice.remaining || 0)}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvoiceClick(invoice);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
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
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Trước
              </button>

              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Show PaymentDetailView when creating invoice from delivery */}
      {showInvoiceDetail && orderForInvoice && (
        <PaymentDetailView
          payment={orderForInvoice}
          onClose={() => {
            setShowInvoiceDetail(false);
            setOrderForInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentManagement;
