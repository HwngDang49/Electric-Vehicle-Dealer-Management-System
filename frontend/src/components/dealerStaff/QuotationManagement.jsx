import React, { useState } from "react";
import "./QuotationManagement.css";
import CreateQuotationForm from "./CreateQuotationForm";
import QuotationDetailView from "./QuotationDetailView";

const QuotationManagement = ({
  showCreateForm = false,
  selectedCustomer = null,
  onCloseCreateForm = null,
  onConvertToOrder = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [showForm, setShowForm] = useState(showCreateForm);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // State for quotations - starts empty, will be populated when quotations are created
  const [quotations, setQuotations] = useState([]);

  const filterOptions = ["Tất cả", "Draft", "Finalized"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Finalized":
        return "status-badge locked";
      case "Draft":
        return "status-badge drafting";
      default:
        return "status-badge";
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleCreateQuotation = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    if (onCloseCreateForm) {
      onCloseCreateForm();
    }
  };

  const handleBackToList = () => {
    setShowForm(false);
    if (onCloseCreateForm) {
      onCloseCreateForm();
    }
  };

  const handleSaveQuotation = (quotationData) => {
    console.log("Saving quotation:", quotationData);

    // Generate new quotation ID
    const newId = `BG${String(quotations.length + 1).padStart(3, "0")}`;

    // Create new quotation with "Nháp" status
    const newQuotation = {
      id: newId,
      customer: quotationData.customer,
      vehicle: {
        name: `${quotationData.vehicle.model} ${quotationData.vehicle.version}`,
        color: quotationData.vehicle.color,
      },
      amount: quotationData.vehicle.price,
      discount: 0, // No discount for new quotations
      status: "Draft", // Always start as "Nháp"
      date: new Date().toISOString().split("T")[0], // Current date
    };

    // Add to quotations list
    setQuotations((prev) => [newQuotation, ...prev]);

    // Close the form
    setShowForm(false);
    if (onCloseCreateForm) {
      onCloseCreateForm();
    }
  };

  const handleViewDetails = (quotationId) => {
    console.log("handleViewDetails called with quotationId:", quotationId);
    const quotation = quotations.find((q) => q.id === quotationId);
    console.log("Found quotation:", quotation);
    if (quotation) {
      setSelectedQuotation(quotation);
      setShowDetailView(true);
    }
  };

  const handleConvertToOrder = (quotation) => {
    if (onConvertToOrder) {
      // Convert quotation to order format
      const orderData = {
        id: `DH${Date.now()}`, // Generate new order ID
        customer: {
          name: quotation.customer.name,
          phone: quotation.customer.phone,
        },
        vehicle: {
          name: quotation.vehicle.name,
          color: quotation.vehicle.color,
        },
        amount:
          quotation.quotation?.finalPrice ||
          quotation.vehicle?.price ||
          quotation.amount ||
          0,
        status: "Draft",
        statusType: "draft",
        date: new Date().toISOString().split("T")[0],
        // Additional fields for order
        deposit: quotation.quotation?.discountAmount || 0,
        finalPrice:
          quotation.quotation?.finalPrice ||
          quotation.vehicle?.price ||
          quotation.amount ||
          0,
        discount: quotation.quotation?.discount || 0,
        tax: 0, // Default tax
      };

      console.log("Converting quotation to order:", quotation);
      console.log("Quotation structure:", {
        quotation: quotation.quotation,
        vehicle: quotation.vehicle,
        amount: quotation.amount,
        finalPrice: quotation.quotation?.finalPrice,
        vehiclePrice: quotation.vehicle?.price,
      });
      console.log("Quotation amount check:", {
        hasAmount: quotation.hasOwnProperty("amount"),
        amountValue: quotation.amount,
        amountType: typeof quotation.amount,
        amountIsUndefined: quotation.amount === undefined,
        amountIsNull: quotation.amount === null,
      });
      console.log("Quotation finalPrice:", quotation.quotation?.finalPrice);
      console.log("Quotation vehicle price:", quotation.vehicle?.price);
      console.log("Order data created:", orderData);
      console.log("Amount value:", orderData.amount);
      console.log("Amount calculation:", {
        quotationAmount: quotation.amount,
        finalPrice: quotation.quotation?.finalPrice,
        vehiclePrice: quotation.vehicle?.price,
        result:
          quotation.quotation?.finalPrice ||
          quotation.vehicle?.price ||
          quotation.amount ||
          0,
      });

      onConvertToOrder(orderData);
    }
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedQuotation(null);
  };

  const handleUpdateQuotation = (quotationId, updatedQuotation) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? updatedQuotation : q))
    );
    setSelectedQuotation(updatedQuotation);
  };

  // Show detail view if requested
  if (showDetailView && selectedQuotation) {
    return (
      <QuotationDetailView
        quotation={selectedQuotation}
        onClose={handleCloseDetailView}
        formatCurrency={formatCurrency}
        onUpdateQuotation={handleUpdateQuotation}
        onConvertToOrder={onConvertToOrder}
      />
    );
  }

  // Show create form if requested
  if (showForm) {
    return (
      <CreateQuotationForm
        onClose={handleCloseForm}
        onSave={handleSaveQuotation}
        selectedCustomer={selectedCustomer}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <div className="quotation-management">
      <div className="quotation-content">
        <div className="quotation-header">
          <div className="header-content">
            <h1>Quản lý báo giá</h1>
            <p>Theo dõi và quản lý tất cả báo giá cho khách hàng</p>
          </div>
          <button className="add-quotation-btn" onClick={handleCreateQuotation}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Tạo báo giá mới
          </button>
        </div>

        <div className="list-header">
          <h2>Danh sách báo giá</h2>
          <div className="list-actions">
            <div className="search-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm báo giá..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-tabs">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  className={`filter-tab ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="quotation-table">
          <div className="table-header">
            <div className="col-quote-id">QuoteID</div>
            <div className="col-customer">Khách hàng</div>
            <div className="col-vehicle">Xe</div>
            <div className="col-value">Giá trị</div>
            <div className="col-status">Trạng thái</div>
            <div className="col-date">Ngày</div>
            <div className="col-actions">Thao tác</div>
          </div>

          <div className="table-body">
            {quotations.map((quotation) => (
              <div key={quotation.id} className="table-row">
                <div className="col-quote-id">
                  <div className="quote-id">#{quotation.id}</div>
                </div>
                <div className="col-customer">
                  <div className="customer-info">
                    <div className="customer-name">
                      {quotation.customer.name}
                    </div>
                    <div className="customer-phone">
                      {quotation.customer.phone}
                    </div>
                  </div>
                </div>
                <div className="col-vehicle">
                  <div className="vehicle-info">
                    <div className="vehicle-name">{quotation.vehicle.name}</div>
                    <div className="vehicle-color">
                      {quotation.vehicle.color}
                    </div>
                  </div>
                </div>
                <div className="col-value">
                  <div className="amount-info">
                    <div className="amount">
                      {formatCurrency(quotation.amount)}
                    </div>
                    <div className="discount">Giảm: {quotation.discount}%</div>
                  </div>
                </div>
                <div className="col-status">
                  <span className={getStatusBadgeClass(quotation.status)}>
                    {quotation.status}
                  </span>
                </div>
                <div className="col-date">
                  <div className="date">{quotation.date}</div>
                </div>
                <div className="col-actions">
                  <div className="action-buttons">
                    <button
                      className="action-btn view-details-btn"
                      title="Xem chi tiết"
                      onClick={() => handleViewDetails(quotation.id)}
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
                    {quotation.status === "Finalized" && (
                      <button
                        className="convert-to-order-btn"
                        title="Chuyển sang đơn hàng"
                        onClick={() => handleConvertToOrder(quotation)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 12l2 2 4-4"></path>
                          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                        </svg>
                        Chuyển sang đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationManagement;
