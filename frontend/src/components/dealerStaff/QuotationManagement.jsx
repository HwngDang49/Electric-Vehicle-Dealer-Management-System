import React, { useState, useEffect } from "react";
import "./QuotationManagement.css";
import CreateQuotationForm from "./CreateQuotationForm";
import QuotationDetailView from "./QuotationDetailView";
import customerApiService from "../../services/customerApi";
import productApiService from "../../services/productApi";
import useQuoteApi from "../../hooks/useQuoteApi";
import {
  getVehicleInfoByProductId,
  getRandomVehicle,
  mockPricebook,
} from "../../data/mockPricebook";

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

  // Use quote API hook
  const {
    loading: quotesLoading,
    error: quotesError,
    getQuotes,
    createQuote,
    finalizeQuote,
  } = useQuoteApi();

  const filterOptions = ["Tất cả", "Draft", "Sent", "Finalized"];

  // Load quotations from API when component mounts
  useEffect(() => {
    const loadQuotations = async () => {
      try {
        console.log("🔄 Loading quotations from API...");
        const response = await getQuotes();
        console.log("✅ Quotations loaded:", response);

        if (response?.data?.items && response.data.items.length > 0) {
          // Transform API data to frontend format
          const apiQuotations = response.data.items.map((quote, index) => {
            // Get vehicle info from mock pricebook
            const vehicleInfo = getVehicleInfoByProductId(
              quote.productId || index + 1
            );

            return {
              id: `BG${String(quote.salesDocId || index + 1).padStart(3, "0")}`,
              backendId: quote.salesDocId || quote.id,
              customer: {
                name: quote.customerName || "N/A",
                phone: "N/A", // Backend doesn't return phone in GetQuotesDto
                email: "N/A", // Backend doesn't return email in GetQuotesDto
                id: quote.customerId,
              },
              vehicle: {
                name: vehicleInfo.fullName,
                model: vehicleInfo.modelName,
                version: vehicleInfo.versionName,
                color: vehicleInfo.colorName,
                price: vehicleInfo.price,
                // Add detailed vehicle info
                modelInfo: vehicleInfo.model,
                versionInfo: vehicleInfo.version,
                colorInfo: vehicleInfo.color,
              },
              amount: quote.totalAmount || vehicleInfo.price || 0,
              discount: 0, // Backend doesn't return discount in GetQuotesDto
              status: quote.status || "Draft",
              date: quote.createdAt
                ? new Date(quote.createdAt).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              createdAt: quote.createdAt || new Date().toISOString(),
              // Add backend specific fields
              dealerId: quote.dealerId,
              lockedUntil: quote.lockedUntil,
              isExpired: quote.isExpired,
            };
          });

          setQuotations(apiQuotations);
          console.log("📋 Quotations set in state:", apiQuotations);
        } else {
          // If no data from API, create some mock quotations for demo
          console.log("📝 No API data, creating mock quotations for demo...");
          const mockQuotations = [
            {
              id: "BG001",
              backendId: 1,
              customer: {
                name: "Nguyễn Văn A",
                phone: "0123456789",
                email: "nguyenvana@email.com",
                id: 1, // Customer ID để gọi API
              },
              vehicle: {
                name: "VinFast VF3 VF3 Standard",
                model: "VinFast VF3",
                version: "VF3 Standard",
                color: "Trắng Ngọc Trai",
                price: 350000000,
                modelInfo: mockPricebook.VF3,
                versionInfo: mockPricebook.VF3.versions[0],
                colorInfo: mockPricebook.VF3.colors[0],
              },
              amount: 350000000,
              discount: 0,
              status: "Draft",
              date: "2025-01-16",
              createdAt: new Date().toISOString(),
              pricingDetails: {
                basePrice: 350000000,
                discount: 0,
                discountAmount: 0,
                taxAmount: 35000000,
                finalPrice: 385000000,
              },
            },
            {
              id: "BG002",
              backendId: 2,
              customer: {
                name: "Trần Thị B",
                phone: "0987654321",
                email: "tranthib@email.com",
                id: 2,
              },
              vehicle: {
                name: "VinFast VF8 VF8 Plus",
                model: "VinFast VF8",
                version: "VF8 Plus",
                color: "Đen Huyền Bí",
                price: 1130000000,
                modelInfo: mockPricebook.VF8,
                versionInfo: mockPricebook.VF8.versions[1],
                colorInfo: mockPricebook.VF8.colors[1],
              },
              amount: 1130000000,
              discount: 5,
              status: "Sent",
              date: "2025-01-16",
              createdAt: new Date().toISOString(),
              pricingDetails: {
                basePrice: 1130000000,
                discount: 5,
                discountAmount: 56500000,
                taxAmount: 107350000,
                finalPrice: 1243850000,
              },
            },
            {
              id: "BG003",
              backendId: 3,
              customer: {
                name: "Lê Văn C",
                phone: "0369852147",
                email: "levanc@email.com",
                id: 3,
              },
              vehicle: {
                name: "VinFast VF9 VF9 Premium",
                model: "VinFast VF9",
                version: "VF9 Premium",
                color: "Xanh Đại Dương",
                price: 1650000000,
                modelInfo: mockPricebook.VF9,
                versionInfo: mockPricebook.VF9.versions[1],
                colorInfo: mockPricebook.VF9.colors[2],
              },
              amount: 1650000000,
              discount: 10,
              status: "Finalized",
              date: "2025-01-16",
              createdAt: new Date().toISOString(),
              pricingDetails: {
                basePrice: 1650000000,
                discount: 10,
                discountAmount: 165000000,
                taxAmount: 148500000,
                finalPrice: 1633500000,
              },
            },
            {
              id: "BG004",
              backendId: 4,
              customer: {
                name: "Phạm Thị D",
                phone: "0741852963",
                email: "phamthid@email.com",
                id: 4,
              },
              vehicle: {
                name: "VinFast VF6 VF6 Premium",
                model: "VinFast VF6",
                version: "VF6 Premium",
                color: "Đỏ Ruby",
                price: 950000000,
                modelInfo: mockPricebook.VF6,
                versionInfo: mockPricebook.VF6.versions[2],
                colorInfo: mockPricebook.VF6.colors[3],
              },
              amount: 950000000,
              discount: 3,
              status: "Finalized",
              date: "2025-01-16",
              createdAt: new Date().toISOString(),
              pricingDetails: {
                basePrice: 950000000,
                discount: 3,
                discountAmount: 28500000,
                taxAmount: 92150000,
                finalPrice: 1013650000,
              },
            },
            {
              id: "BG005",
              backendId: 5,
              customer: {
                name: "Hoàng Văn E",
                phone: "0527419638",
                email: "hoangvane@email.com",
                id: 5,
              },
              vehicle: {
                name: "VinFast VF5 VF5 Premium",
                model: "VinFast VF5",
                version: "VF5 Premium",
                color: "Xám Titan",
                price: 520000000,
                modelInfo: mockPricebook.VF5,
                versionInfo: mockPricebook.VF5.versions[1],
                colorInfo:
                  mockPricebook.VF5.colors[4] || mockPricebook.VF5.colors[0],
              },
              amount: 520000000,
              discount: 0,
              status: "Finalized",
              date: "2025-01-16",
              createdAt: new Date().toISOString(),
              pricingDetails: {
                basePrice: 520000000,
                discount: 0,
                discountAmount: 0,
                taxAmount: 52000000,
                finalPrice: 572000000,
              },
            },
          ];

          setQuotations(mockQuotations);
          console.log("📋 Mock quotations set in state:", mockQuotations);
        }
      } catch (error) {
        console.error("❌ Error loading quotations:", error);
        // Don't show error to user, just log it
        // The component will show empty state
      }
    };

    loadQuotations();
  }, [getQuotes]);

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
      case "Sent":
        return "status-badge sent";
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

      // Get products to find the correct productId
      console.log("🔍 Calling productApiService.getProducts()...");
      const products = await productApiService.getProducts();
      console.log("✅ Available products response:", products);

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

      console.log("📤 Quote payload for API:", quotePayload);

      // Call backend API to create quote using the hook
      console.log("🔍 Calling createQuote hook...");
      const response = await createQuote(quotePayload);
      console.log("✅ Backend response:", response);
      console.log("✅ Backend response.data:", response.data);
      console.log("✅ Backend response.data.quoteId:", response.data?.quoteId);

      // Generate new quotation ID for frontend display
      const newId = `BG${String(quotations.length + 1).padStart(3, "0")}`;

      // Get vehicle info from mock pricebook for the new quotation
      const vehicleInfo = getVehicleInfoByProductId(selectedProduct.id);

      // Create new quotation object for frontend state
      const newQuotation = {
        id: newId,
        customer: {
          ...quotationData.customer,
          id: customerId,
        },
        vehicle: {
          name: vehicleInfo.fullName,
          model: vehicleInfo.modelName,
          version: vehicleInfo.versionName,
          color: vehicleInfo.colorName,
          price: vehicleInfo.price,
          // Add detailed vehicle info
          modelInfo: vehicleInfo.model,
          versionInfo: vehicleInfo.version,
          colorInfo: vehicleInfo.color,
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

      console.log("Quote saved successfully to database");

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

  const handleUpdateQuotation = async (quotationId, updatedQuotation) => {
    try {
      // Update local state first
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
            {quotesLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách báo giá...</p>
              </div>
            ) : quotesError ? (
              <div className="error-state">
                <p>Lỗi khi tải danh sách báo giá: {quotesError.message}</p>
                <button onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            ) : quotations.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có báo giá nào. Hãy tạo báo giá đầu tiên!</p>
              </div>
            ) : (
              quotations.map((quotation) => (
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
                        {quotation.customer.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="col-vehicle">
                    <div className="vehicle-info">
                      <div className="vehicle-name">
                        {quotation.vehicle.name || "N/A"}
                      </div>
                      <div className="vehicle-details">
                        <div className="vehicle-model">
                          {quotation.vehicle.model || "N/A"}
                        </div>
                        <div className="vehicle-color">
                          {quotation.vehicle.color || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-value">
                    <div className="amount-info">
                      <div className="amount">
                        {formatCurrency(quotation.amount)}
                      </div>
                      <div className="discount">
                        Giảm: {quotation.discount}%
                      </div>
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationManagement;
