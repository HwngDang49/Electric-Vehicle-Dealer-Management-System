import React, { useState, useEffect } from "react";
import PaymentDetailView from "./PaymentDetailView";
import "./PaymentManagement.css";

const PaymentManagement = ({ orders = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [paymentInvoices, setPaymentInvoices] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    console.log("PaymentManagement - Orders received:", orders);
    console.log(
      "PaymentManagement - Orders with allocated/scheduled status:",
      orders.filter(
        (order) =>
          order.statusType === "allocated" ||
          order.status === "Allocated" ||
          order.status === "ALLOCATED" ||
          order.statusType === "scheduled" ||
          order.status === "Scheduled" ||
          order.statusType === "delivered" ||
          order.status === "Delivered"
      )
    );

    const invoices = orders
      .filter(
        (order) =>
          order.statusType === "allocated" ||
          order.status === "Allocated" ||
          order.status === "ALLOCATED" ||
          order.statusType === "scheduled" ||
          order.status === "Scheduled" ||
          order.statusType === "delivered" ||
          order.status === "Delivered"
      )
      .map((order) => ({
        id: `INV${order.id.slice(-4)}`,
        invoiceId: `#INV${order.id.slice(-4)}`,
        orderId: order.id,
        orderName: order.vehicle?.name || order.vehicle || "N/A",
        customer: order.customer?.name || order.customer || "N/A",
        customerPhone: order.customer?.phone || "N/A",
        total: 1130050000,
        remaining: 904040000,
        status: "Draft",
        statusType: "draft",
        createdAt: new Date().toISOString(),
      }));

    console.log("PaymentManagement - Final payment invoices:", invoices);
    setPaymentInvoices(invoices);
  }, [orders]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleBackToList = () => {
    setSelectedPayment(null);
  };

  const handlePaymentSuccess = (payment) => {
    setPaymentInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === payment.id
          ? { ...invoice, status: "Paid", statusType: "paid" }
          : invoice
      )
    );
    setSelectedPayment(null);
  };

  const handleViewInvoice = (payment) => {
    setSelectedPayment({ ...payment, isReadOnly: true });
  };

  const filteredInvoices = paymentInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerPhone?.includes(searchQuery);

    const matchesFilter =
      activeFilter === "Tất cả" ||
      (activeFilter === "Draft" && invoice.statusType === "draft") ||
      (activeFilter === "Paid" && invoice.statusType === "paid");

    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (selectedPayment) {
    return (
      <PaymentDetailView
        payment={selectedPayment}
        onBack={handleBackToList}
        onPaymentSuccess={handlePaymentSuccess}
        isReadOnly={selectedPayment.isReadOnly}
      />
    );
  }

  return (
    <div className="payment-management">
      <div className="payment-content">
        {/* Header Section */}
        <div className="payment-header">
          <div className="header-title">
            <h1>Quản lý thanh toán</h1>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span>Tổng hóa đơn</span>
              <span className="stat-value">
                {paymentInvoices.length} hóa đơn
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="payment-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hóa đơn, đơn hàng, khách hàng..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${
                activeFilter === "Tất cả" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("Tất cả")}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "Draft" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("Draft")}
            >
              Draft
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "Paid" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("Paid")}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Payment Invoices Table */}
        <div className="payment-table">
          <div className="table-header">
            <div className="header-cell">Invoice ID</div>
            <div className="header-cell">Order</div>
            <div className="header-cell">Customer</div>
            <div className="header-cell">Total</div>
            <div className="header-cell">Remaining</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Action</div>
          </div>

          <div className="table-body">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="table-row">
                  <div className="cell invoice-cell">
                    <span className="invoice-id">{invoice.invoiceId}</span>
                  </div>
                  <div className="cell order-cell">
                    <div className="order-info">
                      <span className="order-id">{invoice.orderId}</span>
                      <span className="order-name">{invoice.orderName}</span>
                    </div>
                  </div>
                  <div className="cell customer-cell">
                    <div className="customer-info">
                      <span className="customer-name">{invoice.customer}</span>
                      <span className="customer-phone">
                        {invoice.customerPhone}
                      </span>
                    </div>
                  </div>
                  <div className="cell total-cell">
                    <span className="total-amount">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  <div className="cell remaining-cell">
                    <span className="remaining-amount">
                      {formatCurrency(invoice.remaining)}
                    </span>
                  </div>
                  <div className="cell status-cell">
                    <span className={`status-badge ${invoice.statusType}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="cell action-cell">
                    {invoice.statusType === "draft" ? (
                      <button
                        className="payment-btn"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        Thanh toán
                      </button>
                    ) : (
                      <button
                        className="view-invoice-btn"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10,9 9,9 8,9" />
                        </svg>
                        Xem hóa đơn
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
                <p className="empty-text">
                  Không có hóa đơn thanh toán nào đang chờ xử lý.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
