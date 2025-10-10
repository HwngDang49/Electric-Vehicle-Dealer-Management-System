import React, { useState } from "react";
import "./QuotationManagement.css";
import CreateQuotationForm from "./CreateQuotationForm";
import QuotationDetailView from "./QuotationDetailView";

const QuotationManagement = ({
  showCreateForm = false,
  selectedCustomer = null,
  onCloseCreateForm = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [showForm, setShowForm] = useState(showCreateForm);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // State for quotations - starts empty, will be populated when quotations are created
  const [quotations, setQuotations] = useState([]);

  const filterOptions = ["Tất cả", "Nháp", "Khóa báo giá"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Khóa báo giá":
        return "status-badge locked";
      case "Nháp":
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
      status: "Nháp", // Always start as "Nháp"
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
    const quotation = quotations.find((q) => q.id === quotationId);
    if (quotation) {
      setSelectedQuotation(quotation);
      setShowDetailView(true);
    }
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedQuotation(null);
  };

  // Show detail view if requested
  if (showDetailView && selectedQuotation) {
    return (
      <QuotationDetailView
        quotation={selectedQuotation}
        onClose={handleCloseDetailView}
        formatCurrency={formatCurrency}
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
      <div className="quotation-header">
        <div className="quotation-title-section">
          <h1 className="quotation-title">Quản lý báo giá</h1>
          <p className="quotation-subtitle">
            Theo dõi và quản lý tất cả báo giá cho khách hàng
          </p>
        </div>

        <button
          className="create-quotation-btn"
          onClick={handleCreateQuotation}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Tạo báo giá mới
        </button>
      </div>

      <div className="quotation-search">
        <div className="search-container">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tên khách hàng, số điện thoại hoặc mã báo giá..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="quotation-filters">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
            onClick={() => handleFilterClick(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="quotation-table-container">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Mã báo giá</th>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td className="quotation-id">#{quotation.id}</td>
                <td className="customer-info">
                  <div className="customer-name">{quotation.customer.name}</div>
                  <div className="customer-phone">
                    {quotation.customer.phone}
                  </div>
                </td>
                <td className="vehicle-info">
                  <div className="vehicle-name">{quotation.vehicle.name}</div>
                  <div className="vehicle-color">{quotation.vehicle.color}</div>
                </td>
                <td className="amount-info">
                  <div className="amount">
                    {formatCurrency(quotation.amount)}
                  </div>
                  <div className="discount">Giảm: {quotation.discount}%</div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(quotation.status)}>
                    {quotation.status}
                  </span>
                </td>
                <td className="date">{quotation.date}</td>
                <td>
                  <button
                    className="view-details-btn"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationManagement;
