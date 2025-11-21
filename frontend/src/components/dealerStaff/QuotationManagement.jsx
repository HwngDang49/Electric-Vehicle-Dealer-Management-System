import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./QuotationManagement.css";
import CreateQuotationForm from "./CreateQuotationForm";
import QuotationDetailView from "./QuotationDetailView";
import customerApiService from "../../services/customerApi";
import productApiService from "../../services/productApi";
import useQuoteApi from "../../hooks/useQuoteApi";
import CustomDropdown from "./CustomDropdown";

const QuotationManagement = ({
  showCreateForm = false,
  selectedCustomer = null,
  onCloseCreateForm = null,
  onConvertToOrder = null,
  onReloadOrders = null,
  onNavigateToOrders = null,
}) => {
  // State
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showForm, setShowForm] = useState(showCreateForm);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Use quote API hook
  const { loading, error, getQuotes, createQuote, finalizeQuote } =
    useQuoteApi();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Status dropdown options
  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Draft", label: "Nháp", icon: "📝" },
    { value: "Sent", label: "Đã gửi", icon: "📤" },
    { value: "Finalized", label: "Đã ghi nhận", icon: "🔒" },
    { value: "Expired", label: "Hết hạn", icon: "⏰" },
    { value: "Cancelled", label: "Đã hủy", icon: "❌" },
  ];

  // Debounce search
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus]);

  // Load quotations from API
  const loadQuotations = async () => {
    try {
      const response = await getQuotes();
      console.log("📋 Raw API response:", response);

      if (response?.data?.items && response.data.items.length > 0) {
        console.log("📊 API items:", response.data.items);
        console.log("🚗 First item vehicle fields:", {
          vehicleModel: response.data.items[0]?.vehicleModel,
          model: response.data.items[0]?.model,
          modelCode: response.data.items[0]?.modelCode,
          vehicleVersion: response.data.items[0]?.vehicleVersion,
          variant: response.data.items[0]?.variant,
          variantCode: response.data.items[0]?.variantCode,
          vehicleColor: response.data.items[0]?.vehicleColor,
          colorName: response.data.items[0]?.colorName,
        });
        const apiQuotationsRaw = response.data.items.map((q, index) => ({
          id: `BG${String(q.quoteId || index + 1).padStart(3, "0")}`,
          backendId: q.quoteId,
          customer: {
            name: q.customerName || "N/A",
            phone: q.customerPhone || q.CustomerPhone || "N/A",
            email: q.customerEmail || q.CustomerEmail || "N/A",
            address: q.customerAddress || "",
            idNumber: q.customerIdNumber || "",
            id: q.customerId,
          },
          vehicle: {
            name:
              `${q.vehicleModel || q.model || q.modelCode || ""} ${
                q.vehicleVersion || q.variant || q.variantCode || ""
              }`.trim() || "N/A",
            model: q.vehicleModel || q.model || q.modelCode || "",
            version: q.vehicleVersion || q.variant || q.variantCode || "",
            color: q.vehicleColor || q.colorName || "",
            price: q.basePrice || q.totalAmount || 0,
            modelCode: q.modelCode,
            variantCode: q.variantCode,
            colorCode: q.colorCode,
            colorName: q.colorName,
            productId: q.productId,
            oemDiscountAmount: q.oemDiscountAmount || 0,
            // Map vehicle specs from API
            batteryKwh: q.batteryKwh,
            motorKw: q.motorKw,
            rangeKm: q.rangeKm,
          },
          amount: q.totalAmount || 0,
          discount: q.oemDiscountAmount || 0,
          basePrice: q.basePrice || 0,
          status: q.status || "Draft",
          date: q.createdAt
            ? new Date(q.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          createdAt: q.createdAt || new Date().toISOString(),
          dealerId: q.dealerId,
          lockedUntil: q.lockedUntil,
          isExpired: q.isExpired,
        }));

        // Optional enrichment using product catalog
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
            if (q.vehicle && q.vehicle.productId) {
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
                    // Only override if API didn't provide the data
                    batteryKwh: q.vehicle.batteryKwh ?? prod.batteryKwh,
                    motorKw: q.vehicle.motorKw ?? prod.motorKw,
                    rangeKm: q.vehicle.rangeKm ?? prod.rangeKm,
                    colorName: q.vehicle.colorName || prod.colorName,
                  },
                };
              }
            }
            return q;
          });
        } catch (e) {
          console.warn("⚠️ Enrichment skipped (products not loaded):", e);
        }

        console.log("✅ Final enriched quotations:", enriched);
        console.log("🚗 First enriched vehicle:", enriched[0]?.vehicle);
        setQuotations(enriched);

        // Update selectedQuotation if detail view is open
        if (selectedQuotation && showDetailView) {
          const updatedQuotation = enriched.find(
            (q) =>
              q.id === selectedQuotation.id ||
              q.backendId === selectedQuotation.backendId
          );
          if (updatedQuotation) {
            console.log("🔄 Updating selected quotation:", updatedQuotation);
            setSelectedQuotation(updatedQuotation);
          }
        }
      } else {
        setQuotations([]);
      }
    } catch (error) {
      console.error("❌ Error loading quotations:", error);
    }
  };

  // Load quotations on mount
  useEffect(() => {
    loadQuotations();
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

  const getStatusDisplayText = (quotation) => {
    if (quotation.status === "Draft" && quotation.lockedUntil) {
      return "Sent";
    }
    return quotation.status;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { text: "Nháp", class: "status-draft" },
      Sent: { text: "Đã gửi", class: "status-sent" },
      Finalized: { text: "Đã ghi nhận", class: "status-finalized" },
      Expired: { text: "Hết hạn", class: "status-expired" },
      Cancelled: { text: "Đã hủy", class: "status-cancelled" },
      Canceled: { text: "Đã hủy", class: "status-cancelled" },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "status-default",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  // Filter quotations
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      debouncedSearchTerm.trim() === "" ||
      quotation.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      quotation.customer?.name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      quotation.vehicle?.name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());

    const quotationStatus = getStatusDisplayText(quotation);
    const matchesFilter = !selectedStatus || quotationStatus === selectedStatus;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredQuotations.length / pageSize);
  const totalItems = filteredQuotations.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentQuotations = filteredQuotations.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1);
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
    console.log("Saving quotation:", quotationData);

    try {
      let customerId =
        quotationData.customer.id || quotationData.customer.customerId;

      // If no customer ID, create a new customer first
      if (!customerId) {
        console.log("No customer ID found, creating new customer...");

        const customerPayload = {
          fullName: quotationData.customer.name,
          phone: quotationData.customer.phone,
          email: quotationData.customer.email || "",
          idNumber: quotationData.customer.idNumber || "",
          address: quotationData.customer.address || "",
        };

        console.log("Creating customer with payload:", customerPayload);

        const customerResponse = await customerApiService.createCustomer(
          customerPayload
        );
        console.log("Customer creation response:", customerResponse);

        customerId =
          customerResponse.data?.customerId ||
          customerResponse.data?.CustomerId;

        if (!customerId) {
          throw new Error("Failed to create customer or get customer ID");
        }

        console.log("Customer created with ID:", customerId);
      }

      const productId = quotationData.vehicle.productId;

      if (!productId) {
        throw new Error("Không tìm thấy productId. Vui lòng chọn lại xe.");
      }

      console.log("📦 Selected productId:", productId);

      const quotePayload = {
        customerId: customerId,
        items: [
          {
            productId: productId,
            qty: 1,
          },
        ],
      };

      console.log("📤 Quote payload for API:", quotePayload);
      console.log("🔍 Calling createQuote hook...");
      const response = await createQuote(quotePayload);
      console.log("✅ Backend response:", response);

      const newId = `BG${String(quotations.length + 1).padStart(3, "0")}`;

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
          productId: productId,
        },
        amount: quotationData.vehicle.price,
        discount: quotationData.quotation?.promotionDiscount || 0,
        status: "Draft",
        date: new Date().toISOString().split("T")[0],
        backendId: response.data?.quoteId || response.data?.id,
        createdAt: response.data?.createdAt || new Date().toISOString(),
        pricingDetails: {
          basePrice: quotationData.vehicle.price,
          discount: quotationData.quotation?.promotionDiscount || 0,
          discountAmount: quotationData.quotation?.promotionDiscount || 0,
          finalPrice:
            quotationData.quotation?.finalPrice || quotationData.vehicle.price,
        },
      };

      setQuotations((prev) => [newQuotation, ...prev]);

      console.log("Quote saved successfully to database");

      // Show toast first (before closing form to avoid delay)
      const customerName = quotationData.customer.name || "khách hàng";
      showToast(
        "success",
        `Báo giá cho "${customerName}" đã được tạo thành công!`
      );

      // Close form immediately
      setShowForm(false);
      if (onCloseCreateForm) {
        onCloseCreateForm();
      }

      // Reload quotations
      await loadQuotations();
    } catch (error) {
      console.error("Error saving quotation:", error);
      const msg =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi lưu báo giá. Vui lòng thử lại.";
      // Show error toast
      showToast("error", msg);
    }
  };

  const handleViewDetails = async (quotationId) => {
    console.log("handleViewDetails called with quotationId:", quotationId);
    const quotation = quotations.find((q) => q.id === quotationId);
    console.log("Found quotation:", quotation);
    if (quotation) {
      // Show modal immediately with basic data
      setSelectedQuotation(quotation);
      setShowDetailView(true);
    }
  };

  const handleConvertToOrder = (quotation) => {
    if (onConvertToOrder) {
      const orderData = {
        id: `DH${Date.now()}`,
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
        deposit: quotation.quotation?.discountAmount || 0,
        finalPrice:
          quotation.quotation?.finalPrice ||
          quotation.vehicle?.price ||
          quotation.amount ||
          0,
        discount: quotation.quotation?.discount || 0,
        tax: 0,
      };

      console.log("Converting quotation to order:", quotation);
      console.log("Order data created:", orderData);

      onConvertToOrder(orderData);
    }
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedQuotation(null);
  };

  const handleConvertToOrderSuccess = async (orderIds, quotationData) => {
    // Close detail view immediately
    setShowDetailView(false);
    setSelectedQuotation(null);

    // Reload quotations
    await loadQuotations();

    // Reload orders if callback provided
    if (onReloadOrders) {
      await onReloadOrders();
    }

    // Navigate to order management with toast message
    if (onNavigateToOrders) {
      // Pass toast message when navigating
      const toastMessage =
        orderIds && orderIds.length > 0
          ? {
              type: "success",
              message: `Đã chuyển đổi thành công sang ${
                orderIds.length
              } đơn hàng! Mã đơn hàng: ${orderIds.join(", ")}`,
            }
          : null;
      onNavigateToOrders(toastMessage);
    }
  };

  const handleConvertToOrderError = (errorMessage) => {
    // Show error toast
    showToast(
      "error",
      errorMessage || "Lỗi khi chuyển đổi báo giá sang đơn hàng"
    );
  };

  const handleUpdateQuotation = async (quotationId, updatedQuotation) => {
    try {
      setQuotations((prev) =>
        prev.map((q) => (q.id === quotationId ? updatedQuotation : q))
      );
      setSelectedQuotation(updatedQuotation);

      console.log("✅ Quotation updated in local state:", updatedQuotation);
    } catch (error) {
      console.error("❌ Error updating quotation:", error);
      alert(
        "Lỗi khi cập nhật báo giá: " + (error.message || "Vui lòng thử lại")
      );
    }
  };

  return (
    <div className="dealer-staff-quotation-management-app">
      {toast &&
        ReactDOM.createPortal(
          <div
            className={`quote-toast ${
              toast.type === "error" ? "quote-toast-error" : ""
            }`}
            style={{ zIndex: 99999 }}
          >
            <div className="toast-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                {toast.type === "error" ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M20 6L9 17l-5-5" />
                )}
              </svg>
            </div>
            <div className="toast-content">
              <div className="toast-title">
                {toast.type === "error" ? "Thất bại" : "Thành công"}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => setToast(null)}
              aria-label="Đóng"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="toast-progress"></div>
          </div>,
          document.body
        )}

      <div className="quotation-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm báo giá theo mã, khách hàng, xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              {isSearching && (
                <div className="search-loading-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#20c997"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="32"
                      strokeDashoffset="32"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="32;0"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
              )}
              <button className="search-btn" onClick={handleSearch}>
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
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              minWidth="220px"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error.message || "Lỗi khi tải danh sách báo giá"}
            <button onClick={() => window.location.reload()}>✕</button>
          </div>
        )}

        <div
          className="quotations-table-container"
          key={`page-${currentPage}-search-${debouncedSearchTerm}`}
        >
          {loading && (
            <div className="table-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <table
            className="quotations-table"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
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
              {currentQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    📋{" "}
                    {debouncedSearchTerm
                      ? "Không tìm thấy báo giá phù hợp với từ khóa tìm kiếm"
                      : "Chưa có báo giá nào trong hệ thống"}
                  </td>
                </tr>
              ) : (
                currentQuotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td>
                      <span className="quote-id">#{quotation.id}</span>
                    </td>
                    <td>
                      <div className="quotation-customer-name">
                        {quotation.customer.name}
                      </div>
                      <div className="quotation-customer-phone">
                        {quotation.customer.phone || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="quotation-vehicle-name">
                        {quotation.vehicle.name || "N/A"}
                      </div>
                      <div className="quotation-vehicle-color">
                        {quotation.vehicle.color || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="quotation-amount">
                        {formatCurrency(
                          (quotation.vehicle?.price || quotation.amount) -
                            (quotation.vehicle?.oemDiscountAmount || 0)
                        )}
                      </div>
                      {quotation.vehicle?.oemDiscountAmount > 0 && (
                        <div className="quotation-discount">
                          Giảm:{" "}
                          {formatCurrency(
                            quotation.vehicle?.oemDiscountAmount || 0
                          )}
                        </div>
                      )}
                    </td>
                    <td>{getStatusBadge(getStatusDisplayText(quotation))}</td>
                    <td>
                      <span className="quotation-date">{quotation.date}</span>
                    </td>
                    <td>
                      <button
                        className="view-detail-btn"
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                        onClick={() => setCurrentPage(pageNum)}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
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
          onReloadOrders={onReloadOrders}
          onNavigateToOrders={onNavigateToOrders}
          onConvertSuccess={handleConvertToOrderSuccess}
          onConvertError={handleConvertToOrderError}
        />
      )}
    </div>
  );
};

export default QuotationManagement;
