import React, { useState, useEffect } from "react";
import "./QuotationManagement.css";
import CreateQuotationForm from "./CreateQuotationForm";
import QuotationDetailView from "./QuotationDetailView";
import customerApiService from "../../services/customerApi";
import productApiService from "../../services/productApi";
import useQuoteApi from "../../hooks/useQuoteApi";
import CustomDropdown from "./CustomDropdown";
// Remove all mock imports – we will only use real data from backend

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // State for quotations - starts empty, will be populated when quotations are created
  const [quotations, setQuotations] = useState([]);

  // Use quote API hook
  const {
    loading: quotesLoading,
    error: quotesError,
    getQuotes,
    createQuote,
    finalizeQuote,
  } = useQuoteApi();

  const statusOptions = [
    { value: "Tất cả", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Draft", label: "Draft", icon: "📝" },
    { value: "Sent", label: "Sent", icon: "📤" },
    { value: "Finalized", label: "Finalized", icon: "🔒" }
  ];

  // Load quotations from API when component mounts
  const loadQuotations = async () => {
    try {
      const response = await getQuotes();

      if (response?.data?.items && response.data.items.length > 0) {
        // Transform API data to frontend format (pure backend data)
        const apiQuotationsRaw = response.data.items.map((q, index) => ({
          id: `BG${String(q.quoteId || index + 1).padStart(3, "0")}`,
          backendId: q.quoteId,
          customer: {
            name: q.customerName || "N/A",
            phone: q.customerPhone || q.CustomerPhone || "N/A",
            email: q.customerEmail || q.CustomerEmail || "N/A",
            id: q.customerId,
          },
          vehicle: {
            // Expect vehicle fields stored when creating quote
            name: `${q.vehicleModel || q.model || ""} ${
              q.vehicleVersion || q.variant || ""
            }`.trim(),
            model: q.vehicleModel || q.model || "",
            version: q.vehicleVersion || q.variant || "",
            color: q.vehicleColor || q.colorName || "",
            price: q.basePrice || q.totalAmount || 0,
            modelCode: q.modelCode,
            variantCode: q.variantCode,
            colorCode: q.colorCode,
            productId: q.productId,
            oemDiscountAmount: q.oemDiscountAmount || 0,
          },
          amount: q.totalAmount || q.basePrice || 0,
          discount: q.discountPercent || 0,
          status: q.status || "Draft",
          date: q.createdAt
            ? new Date(q.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          createdAt: q.createdAt || new Date().toISOString(),
          dealerId: q.dealerId,
          lockedUntil: q.lockedUntil,
          isExpired: q.isExpired,
        }));

        // Optional enrichment using product catalog to fill missing vehicle info
        let enriched = apiQuotationsRaw;
        try {
          const productsRes = await productApiService.getAllProducts();
          const products = productsRes?.data || [];
          const productMap = new Map();
          products.forEach((p) => {
            const pid = Number(p.productId ?? p.ProductId ?? p.id);
            if (!Number.isNaN(pid)) productMap.set(pid, p);
          });
          enriched = apiQuotationsRaw.map((q) => {
            if (
              q.vehicle &&
              (!q.vehicle.model || !q.vehicle.version || !q.vehicle.color)
            ) {
              const pid = Number(q.vehicle.productId);
              const prod = productMap.get(pid);
              if (prod) {
                const model = q.vehicle.model || prod.modelCode || "";
                const variant = q.vehicle.version || prod.variantCode || "";
                const color = q.vehicle.color || prod.colorName || "";
                return {
                  ...q,
                  vehicle: {
                    ...q.vehicle,
                    model,
                    version: variant,
                    color,
                    name: `${model} ${variant}`.trim(),
                  },
                };
              }
            }
            return q;
          });
        } catch (e) {
          console.warn("⚠️ Enrichment skipped (products not loaded):", e);
        }

        setQuotations(enriched);

        // Nếu đang xem detail view, cập nhật lại selectedQuotation với data mới
        if (selectedQuotation && showDetailView) {
          const updatedQuotation = enriched.find(
            (q) =>
              q.id === selectedQuotation.id ||
              q.backendId === selectedQuotation.backendId
          );
          if (updatedQuotation) {
            setSelectedQuotation(updatedQuotation);
          }
        }
      } else {
        // No items -> set empty list; do not use mock
        setQuotations([]);
      }
    } catch (error) {
      console.error("❌ Error loading quotations:", error);
      // Don't show error to user, just log it
      // The component will show empty state
    }
  };

  // Load quotations on mount and whenever component is re-mounted
  useEffect(() => {
    loadQuotations();
    // Also refresh when user returns to this tab after navigating away
    const onFocus = () => loadQuotations();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [getQuotes]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Finalized: { text: "Finalized", class: "status-locked" },
      Sent: { text: "Sent", class: "status-sent" },
      Draft: { text: "Draft", class: "status-drafting" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getStatusDisplayText = (quotation) => {
    // Nếu có lockedUntil và status là Draft, hiển thị "Sent"
    if (quotation.status === "Draft" && quotation.lockedUntil) {
      return "Sent";
    }
    return quotation.status;
  };

  // Filter quotations based on search and status
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      quotation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.customer?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      quotation.vehicle?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "Tất cả" ||
      getStatusDisplayText(quotation) === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredQuotations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentQuotations = filteredQuotations.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (status) => {
    setActiveFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
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

  const handleSaveQuotation = async (quotationData) => {
    

    try {
      let customerId =
        quotationData.customer.id || quotationData.customer.customerId;

      // If no customer ID, create a new customer first
      if (!customerId) {
        

        const customerPayload = {
          fullName: quotationData.customer.name,
          phone: quotationData.customer.phone,
          email: quotationData.customer.email || "",
          idNumber: quotationData.customer.idNumber || "",
          address: quotationData.customer.address || "",
        };

        

        const customerResponse = await customerApiService.createCustomer(
          customerPayload
        );
        

        customerId =
          customerResponse.data?.customerId ||
          customerResponse.data?.CustomerId;

        if (!customerId) {
          throw new Error("Failed to create customer or get customer ID");
        }

        
      }

      // Get products to find the correct productId
      const products = await productApiService.getProducts();
      

      // Find product by model and version (this is a simplified approach)
      // In a real app, you'd have a proper product mapping
      const selectedProduct = products.data?.items?.[0] || { id: 1 }; // Use first product as fallback

      const quotePayload = {
        customerId: customerId,
        items: [
          {
            productId: selectedProduct.id,
            qty: 1,
          },
        ],
      };


      // Call backend API to create quote using the hook
      const response = await createQuote(quotePayload);
      
      
      

      // Generate new quotation ID for frontend display
      const newId = `BG${String(quotations.length + 1).padStart(3, "0")}`;

      // Create new quotation object for frontend state
      const newQuotation = {
        id: newId,
        customer: {
          ...quotationData.customer,
          id: customerId,
        },
        vehicle: {
          name: `${quotationData.vehicle.model} ${quotationData.vehicle.version}`.trim(),
          model: quotationData.vehicle.model,
          version: quotationData.vehicle.version,
          color: quotationData.vehicle.color,
          price: quotationData.vehicle.price,
          modelCode: quotationData.vehicle.modelCode,
          variantCode: quotationData.vehicle.variantCode,
          colorCode: quotationData.vehicle.colorCode,
          productId: selectedProduct.id,
        },
        amount: quotationData.vehicle.price,
        discount: quotationData.quotation?.discount || 0,
        status: "Draft",
        date: new Date().toISOString().split("T")[0],
        // Add backend response data
        backendId: response.data?.quoteId || response.data?.id,
        createdAt: response.data?.createdAt || new Date().toISOString(),
        // Add detailed pricing information
        pricingDetails: {
          basePrice: quotationData.vehicle.price,
          discount: quotationData.quotation?.discount || 0,
          discountAmount:
            (quotationData.vehicle.price *
              (quotationData.quotation?.discount || 0)) /
            100,
          finalPrice:
            quotationData.quotation?.finalPrice || quotationData.vehicle.price,
        },
      };

      // Add to quotations list
      setQuotations((prev) => [newQuotation, ...prev]);

      

      // Reload quotations from backend to get the latest data
      await loadQuotations();

      // Close the form
      setShowForm(false);
      if (onCloseCreateForm) {
        onCloseCreateForm();
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      // You might want to show an error message to the user here
      alert("Lỗi khi lưu báo giá: " + (error.message || "Vui lòng thử lại"));
    }
  };

  const handleViewDetails = (quotationId) => {
    
    const quotation = quotations.find((q) => q.id === quotationId);
    
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

      
        quotation: quotation.quotation,
        vehicle: quotation.vehicle,
        amount: quotation.amount,
        finalPrice: quotation.quotation?.finalPrice,
        vehiclePrice: quotation.vehicle?.price,
      });
        hasAmount: quotation.hasOwnProperty("amount"),
        amountValue: quotation.amount,
        amountType: typeof quotation.amount,
        amountIsUndefined: quotation.amount === undefined,
        amountIsNull: quotation.amount === null,
      });
      
      
      
      
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

  const handleUpdateQuotation = async (quotationId, updatedQuotation) => {
    try {
      // Update local state first
      setQuotations((prev) =>
        prev.map((q) => (q.id === quotationId ? updatedQuotation : q))
      );
      setSelectedQuotation(updatedQuotation);

      
    } catch (error) {
      console.error("❌ Error updating quotation:", error);
      alert(
        "Lỗi khi cập nhật báo giá: " + (error.message || "Vui lòng thử lại")
      );
    }
  };

  return (
    <div className="quotation-management">
      <div className="page-header">
        <h1>Quản lý báo giá</h1>
      </div>

      <div className="management-toolbar">
        <div className="search-section">
          <div className="search-bar">
            <button className="search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm báo giá theo mã, khách hàng, xe..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <CustomDropdown
            value={activeFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            minWidth="220px"
          />
        </div>
        <button className="create-btn" onClick={handleCreateQuotation}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Tạo báo giá
        </button>
      </div>

      <div className="quotations-table-container">
        {quotesLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách báo giá...</p>
          </div>
        ) : quotesError ? (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            Lỗi khi tải danh sách báo giá: {quotesError.message}
            <button onClick={() => window.location.reload()}>✕</button>
          </div>
        ) : (
          <table className="quotations-table">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {quotations.length === 0
                      ? "Chưa có báo giá nào"
                      : "Không tìm thấy báo giá nào"}
                  </td>
                </tr>
              ) : (
                currentQuotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td>
                      <span className="quote-id">#{quotation.id}</span>
                    </td>
                    <td>
                      <div className="customer-name">
                        {quotation.customer.name}
                      </div>
                      <div className="customer-phone">
                        {quotation.customer.phone || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-name">
                        {quotation.vehicle.name || "N/A"}
                      </div>
                      <div className="vehicle-color">
                        {quotation.vehicle.color || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="amount">
                        {formatCurrency(
                          (quotation.vehicle?.price || quotation.amount) -
                            (quotation.vehicle?.oemDiscountAmount || 0)
                        )}
                      </div>
                      <div className="discount">
                        Giảm: {formatCurrency(quotation.vehicle?.oemDiscountAmount || 0)}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(getStatusDisplayText(quotation))}
                    </td>
                    <td>{quotation.date}</td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => handleViewDetails(quotation.id)}
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
        )}
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
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Show first page, last page, current page, and pages around current
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

      {/* Create Quotation Form Modal */}
      {showForm && (
        <CreateQuotationForm
          onClose={handleCloseForm}
          onSave={handleSaveQuotation}
          selectedCustomer={selectedCustomer}
          onBackToList={handleBackToList}
        />
      )}

      {/* Quotation Detail View Modal */}
      {showDetailView && selectedQuotation && (
        <QuotationDetailView
          quotation={selectedQuotation}
          onClose={handleCloseDetailView}
          formatCurrency={formatCurrency}
          onUpdateQuotation={handleUpdateQuotation}
          onConvertToOrder={onConvertToOrder}
          onReloadData={loadQuotations}
        />
      )}
    </div>
  );
};

export default QuotationManagement;
