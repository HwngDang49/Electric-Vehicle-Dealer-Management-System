import React, { useState, useEffect, useMemo } from "react";
import "./PromotionDetailModal.css";
import promotionService from "../../services/promotionService";
import dealerApiService from "../../services/dealerApi";
import productApiService from "../../services/productApi";
import branchApiService from "../../services/branchApi";
import CustomDropdown from "./CustomDropdown";
import PromotionScopeEditor from "./PromotionScopeEditor";

const PromotionDetailModal = ({ promotionId, onClose, onUpdate, onSaveSuccess, onSaveError }) => {
  const [promotion, setPromotion] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dealerId: "",
    fundedBy: "",
    stackingRule: "",
    amountOff: "",
    effectiveFrom: "",
    effectiveTo: "",
    status: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Scope selection states
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [scopeTab, setScopeTab] = useState("products");
  const [productSearch, setProductSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [promotionId]);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || "",
        description: promotion.description || "",
        dealerId: promotion.dealerId || "",
        fundedBy: promotion.fundedBy || "",
        stackingRule: promotion.stackingRule || "",
        amountOff: promotion.amountOff || "",
        effectiveFrom: promotion.effectiveFrom || "",
        effectiveTo: promotion.effectiveTo || "",
        status: promotion.status || "",
      });
    }
  }, [promotion]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [promotionRes, dealersRes, productsRes, branchesRes] =
        await Promise.all([
          promotionService.getPromotionById(promotionId),
          dealerApiService.getDealers(),
          productApiService.getProducts(),
          branchApiService.getBranches(),
        ]);

      // Promotion API returns { data: { data: {...} } } due to backend wrapping
      const promotionData =
        promotionRes.data?.data || promotionRes.data || promotionRes;
      setPromotion(promotionData);
      setDealers(dealersRes.data || dealersRes || []);
      setProducts(productsRes.data || productsRes || []);
      setBranches(branchesRes.data || branchesRes || []);

      // Pre-select scopes from promotion
      if (promotionData.scopes && promotionData.scopes.length > 0) {
        // Extract unique product IDs (excluding null)
        const productIds = [
          ...new Set(
            promotionData.scopes
              .filter((s) => s.productId !== null && s.productId !== undefined)
              .map((s) => s.productId)
          ),
        ];

        // Extract unique branch IDs (excluding null)
        const branchIds = [
          ...new Set(
            promotionData.scopes
              .filter((s) => s.branchId !== null && s.branchId !== undefined)
              .map((s) => s.branchId)
          ),
        ];

        setSelectedProducts(productIds);
        setSelectedBranches(branchIds);
      }
    } catch (err) {
      console.error("Error loading promotion details:", err);
      setError("Lỗi khi tải thông tin khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { text: "Nháp", class: "status-inactive" },
      Active: { text: "Hoạt động", class: "status-active" },
      Expired: { text: "Hết hạn", class: "status-discontinued" },
      Cancelled: { text: "Đã hủy", class: "status-discontinued" },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "status-default",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const statusOptions = [
    { value: "Draft", label: "Nháp", icon: "📝" },
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Expired", label: "Hết hạn", icon: "⏱️" },
    { value: "Cancelled", label: "Đã hủy", icon: "❌" },
  ];

  const fundedByOptions = [
    { value: "OEM", label: "OEM", icon: "🏭" },
    { value: "Dealer", label: "Dealer", icon: "🏢" },
    { value: "Shared", label: "Shared", icon: "🤝" },
  ];

  const stackingRuleOptions = [
    { value: "Stackable", label: "Stackable - Có thể kết hợp", icon: "📚" },
    { value: "Exclusive", label: "Exclusive - Độc quyền", icon: "⚡" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Helper: Check if field is editable based on promotion status
  const isFieldEditable = (fieldName) => {
    if (!promotion) return false;

    switch (promotion.status) {
      case "Draft":
        return true; // Draft: Tất cả fields đều editable
      case "Active":
        // Active: Chỉ Description và EffectiveTo (extend only)
        return fieldName === "description" || fieldName === "effectiveTo";
      case "Expired":
      case "Cancelled":
        return false; // Expired/Cancelled: Không sửa được gì
      default:
        return false;
    }
  };

  // Filter products based on status (only Active) and search
  const filteredProducts = useMemo(() => {
    // First filter by status: only show Active products
    const activeProducts = products.filter(p => {
      const status = p?.status || p?.Status || p?.productStatus || "Active";
      return status === "Active";
    });
    
    // Then filter by search if there is a search term
    if (!productSearch.trim()) return activeProducts;
    const search = productSearch.toLowerCase();
    return activeProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        p.modelName?.toLowerCase().includes(search) ||
        p.colorName?.toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  // Filter branches based on dealer selection and search
  const filteredBranches = useMemo(() => {
    let filtered = branches;

    // First filter by dealer if a dealer is selected
    if (formData.dealerId) {
      const dealerIdNum = parseInt(formData.dealerId);
      filtered = branches.filter(
        (b) => (b.dealerId || b.dealer_id) === dealerIdNum
      );
    }

    // Then filter by search
    if (branchSearch.trim()) {
      const search = branchSearch.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(search) ||
          b.address?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [branches, branchSearch, formData.dealerId]);

  // Toggle all products
  const handleToggleAllProducts = () => {
    if (
      selectedProducts.length === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      // Deselect all filtered products
      const filteredIds = filteredProducts.map((p) => p.id || p.productId);
      setSelectedProducts((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Select all filtered products
      const allIds = filteredProducts.map((p) => p.id || p.productId);
      setSelectedProducts((prev) => {
        const newSet = new Set([...prev, ...allIds]);
        return Array.from(newSet);
      });
    }
  };

  // Toggle all branches
  const handleToggleAllBranches = () => {
    if (
      selectedBranches.length === filteredBranches.length &&
      filteredBranches.length > 0
    ) {
      // Deselect all filtered branches
      const filteredIds = filteredBranches.map((b) => b.id || b.branchId);
      setSelectedBranches((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Select all filtered branches
      const allIds = filteredBranches.map((b) => b.id || b.branchId);
      setSelectedBranches((prev) => {
        const newSet = new Set([...prev, ...allIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên khuyến mãi là bắt buộc";
    }

    if (!formData.amountOff || parseFloat(formData.amountOff) <= 0) {
      errors.amountOff = "Số tiền giảm phải lớn hơn 0";
    }

    if (!formData.effectiveFrom) {
      errors.effectiveFrom = "Ngày bắt đầu là bắt buộc";
    }

    if (
      formData.effectiveTo &&
      formData.effectiveFrom >= formData.effectiveTo
    ) {
      errors.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (formData.dealerId === "" && formData.fundedBy !== "OEM") {
      errors.fundedBy = "Global promotion phải do OEM tài trợ";
    }

    // OEM can fund dealer-specific promotions (Targeted OEM Promotion)
    // No validation needed for dealer-specific + OEM combination

    // Active promotion: Chỉ được extend EffectiveTo
    if (promotion && promotion.status === "Active") {
      if (
        formData.effectiveTo &&
        formData.effectiveTo < promotion.effectiveTo
      ) {
        errors.effectiveTo = "Chỉ được gia hạn promotion, không được rút ngắn";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (!promotion) return false;
    
    const original = {
      name: promotion?.name || "",
      description: promotion?.description || "",
      dealerId: promotion?.dealerId || "",
      fundedBy: promotion?.fundedBy || "",
      stackingRule: promotion?.stackingRule || "",
      amountOff: promotion?.amountOff || "",
      effectiveFrom: promotion?.effectiveFrom || "",
      effectiveTo: promotion?.effectiveTo || "",
      status: promotion?.status || "",
    };
    
    const current = {
      name: formData.name || "",
      description: formData.description || "",
      dealerId: formData.dealerId || "",
      fundedBy: formData.fundedBy || "",
      stackingRule: formData.stackingRule || "",
      amountOff: formData.amountOff || "",
      effectiveFrom: formData.effectiveFrom || "",
      effectiveTo: formData.effectiveTo || "",
      status: formData.status || "",
    };
    
    return (
      original.name !== current.name ||
      original.description !== current.description ||
      String(original.dealerId || "") !== String(current.dealerId || "") ||
      original.fundedBy !== current.fundedBy ||
      original.stackingRule !== current.stackingRule ||
      String(original.amountOff || "") !== String(current.amountOff || "") ||
      original.effectiveFrom !== current.effectiveFrom ||
      (original.effectiveTo || "") !== (current.effectiveTo || "") ||
      original.status !== current.status
    );
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    // Check if there are any changes
    if (!hasChanges()) {
      setIsEditing(false);
      return; // No changes, just exit edit mode
    }

    try {
      setLoading(true);

      // Build scopes (only for Draft status)
      let scopes = undefined;
      if (promotion.status === "Draft") {
        scopes = [];

        // Check if "all products" selected
        const allProductsSelected =
          selectedProducts.length === products.length && products.length > 0;
        // Check if "all branches" selected (for dealer-specific promotions)
        const allBranchesSelected =
          formData.dealerId &&
          selectedBranches.length ===
            branches.filter(
              (b) => (b.dealerId || b.dealer_id) === parseInt(formData.dealerId)
            ).length &&
          selectedBranches.length > 0;

        // Normalize: If all selected → treat as null (apply to all)
        const normalizedProductIds = allProductsSelected
          ? [null]
          : selectedProducts;
        const normalizedBranchIds = allBranchesSelected
          ? [null]
          : selectedBranches;

        if (normalizedProductIds.length > 0 && normalizedBranchIds.length > 0) {
          // CROSS JOIN - Kết hợp mỗi product với mỗi branch
          normalizedProductIds.forEach((productId) => {
            normalizedBranchIds.forEach((branchId) => {
              scopes.push({ productId, branchId });
            });
          });
        } else if (normalizedProductIds.length > 0) {
          // Chỉ chọn products → áp dụng cho tất cả branches
          normalizedProductIds.forEach((productId) => {
            scopes.push({ productId, branchId: null });
          });
        } else if (normalizedBranchIds.length > 0) {
          // Chỉ chọn branches → áp dụng cho tất cả products
          normalizedBranchIds.forEach((branchId) => {
            scopes.push({ productId: null, branchId });
          });
        }
        // Nếu không chọn gì → scopes = [] (áp dụng cho tất cả)
      }

      // Update data
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        dealerId: formData.dealerId ? parseInt(formData.dealerId) : null,
        fundedBy: formData.fundedBy,
        stackingRule: formData.stackingRule,
        amountOff: parseFloat(formData.amountOff),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      };

      // Add scopes if Draft
      if (scopes !== undefined) {
        updateData.scopes = scopes;
      }

      await promotionService.updatePromotion(promotionId, updateData);

      // Update status nếu thay đổi
      if (formData.status !== promotion.status) {
        await promotionService.updatePromotionStatus(
          promotionId,
          formData.status
        );
      }

      await loadData();
      setIsEditing(false);
      if (onUpdate) onUpdate();
      
      // Show success toast
      if (onSaveSuccess) {
        onSaveSuccess(`Đã cập nhật thông tin khuyến mãi "${formData.name}" thành công!`);
      }
    } catch (err) {
      console.error("Error updating promotion:", err);
      const errorMessage =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật khuyến mãi. Vui lòng thử lại.";
      setError(errorMessage);
      
      // Show error toast
      if (onSaveError) {
        onSaveError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: promotion?.name || "",
      description: promotion?.description || "",
      dealerId: promotion?.dealerId || "",
      fundedBy: promotion?.fundedBy || "",
      stackingRule: promotion?.stackingRule || "",
      amountOff: promotion?.amountOff || "",
      effectiveFrom: promotion?.effectiveFrom || "",
      effectiveTo: promotion?.effectiveTo || "",
      status: promotion?.status || "",
    });

    // Reset selected scopes to original
    if (promotion?.scopes && promotion.scopes.length > 0) {
      const productIds = [
        ...new Set(
          promotion.scopes
            .filter((s) => s.productId !== null && s.productId !== undefined)
            .map((s) => s.productId)
        ),
      ];

      const branchIds = [
        ...new Set(
          promotion.scopes
            .filter((s) => s.branchId !== null && s.branchId !== undefined)
            .map((s) => s.branchId)
        ),
      ];

      setSelectedProducts(productIds);
      setSelectedBranches(branchIds);
    } else {
      setSelectedProducts([]);
      setSelectedBranches([]);
    }

    setValidationErrors({});
    setIsEditing(false);
  };

  const getAvailableStatusTransitions = () => {
    if (!promotion) return [];

    switch (promotion.status) {
      case "Draft":
        return ["Active", "Cancelled"];
      case "Active":
        return ["Expired", "Cancelled"];
      case "Expired":
      case "Cancelled":
        return [];
      default:
        return [];
    }
  };

  const getAvailableStatusOptions = () => {
    if (!promotion) return statusOptions;

    switch (promotion.status) {
      case "Draft":
        // Draft có thể chuyển sang Active hoặc Cancelled
        return statusOptions.filter(
          (opt) =>
            opt.value === "Draft" ||
            opt.value === "Active" ||
            opt.value === "Cancelled"
        );
      case "Active":
        // Active có thể chuyển sang Expired hoặc Cancelled
        return statusOptions.filter(
          (opt) =>
            opt.value === "Active" ||
            opt.value === "Expired" ||
            opt.value === "Cancelled"
        );
      case "Expired":
      case "Cancelled":
        // Expired/Cancelled không thể chuyển đi
        return statusOptions.filter((opt) => opt.value === promotion.status);
      default:
        return statusOptions;
    }
  };

  const getAvailableFundedByOptions = () => {
    if (formData.dealerId === "") {
      // Global → Only OEM
      return fundedByOptions.filter((opt) => opt.value === "OEM");
    } else {
      // Dealer-specific → All options (OEM can fund targeted promotions)
      return fundedByOptions;
    }
  };

  const getDealerName = (dealerId) => {
    if (!dealerId) return "Global";
    const dealer = dealers.find((d) => (d.id || d.dealerId) === dealerId);
    return dealer ? `${dealer.name} (${dealer.code})` : `#${dealerId}`;
  };

  if (loading && !promotion) {
    return (
      <div className="admin-promotion-detail-modal-app">
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Khuyến mãi</h2>
            </div>
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin khuyến mãi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !promotion) {
    return (
      <div className="admin-promotion-detail-modal-app">
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Khuyến mãi</h2>
            </div>
            <div className="error-container">
              <div className="error-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <p>{error}</p>
              <button className="retry-btn" onClick={loadData}>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return null;
  }

  return (
    <div className="admin-promotion-detail-modal-app">
      <div className="modal-overlay">
        <div
          className="create-branch-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "1400px",
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2>Chi Tiết Khuyến mãi</h2>
              {getStatusBadge(promotion.status)}
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {!isEditing &&
                (promotion.status === "Draft" ||
                  promotion.status === "Active") && (
                  <button
                    className="edit-toggle-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              <button
                className="close-modal-btn"
                onClick={onClose}
                disabled={loading}
              >
                Đóng
              </button>
            </div>
          </div>

          <div className="modal-form">
            {/* Edit Mode Banner */}
            {isEditing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 20px",
                  background:
                    "linear-gradient(90deg, #20c997 0%, #93edc1 100%)",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  animation: "editBannerSlideDown 0.3s ease-out",
                  boxShadow: "0 2px 8px rgba(32, 201, 151, 0.2)",
                }}
              >
                <style>{`
                @keyframes editBannerSlideDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#fff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#20c997"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#ffffff",
                      margin: "0 0 2px 0",
                    }}
                  >
                    {promotion.status === "Active" ? "Promotion đang hoạt động" : "Chế độ chỉnh sửa"}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ffffff",
                      margin: 0,
                      opacity: 0.95,
                    }}
                  >
                    {promotion.status === "Active" 
                      ? <>Chỉ có thể chỉnh sửa <strong>Mô tả</strong> và <strong>Ngày kết thúc</strong> (gia hạn). Các trường khác đã bị khóa 🔒 để đảm bảo tính nhất quán.</>
                      : <>Bạn đang chỉnh sửa thông tin khuyến mãi. Nhấn <strong>"Lưu thay đổi"</strong> để hoàn tất.</>
                    }
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message" style={{ gridColumn: "1 / -1" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {error}
              </div>
            )}

            {/* Main 2-column layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              {/* LEFT COLUMN - Basic Information */}
              <div
                style={{
                  animation: isEditing
                    ? "leftColumnSlideIn 0.4s ease-out"
                    : "none",
                }}
              >
                <style>{`
                @keyframes leftColumnSlideIn {
                  from {
                    opacity: 0;
                    transform: translateX(-20px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                  }
                }
              `}</style>
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div
                    className="detail-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div
                      className="detail-item"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">
                        Tên khuyến mãi:
                        {isEditing && !isFieldEditable("name") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("name") ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`detail-input ${
                              validationErrors.name ? "error" : ""
                            }`}
                          />
                          {validationErrors.name && (
                            <span className="error-text">
                              {validationErrors.name}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="detail-value">{promotion.name}</span>
                      )}
                    </div>

                    <div
                      className="detail-item"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">
                        Mô tả:
                        {isEditing && !isFieldEditable("description") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("description") ? (
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="detail-input"
                          style={{ resize: "vertical", minHeight: "80px" }}
                        />
                      ) : (
                        <span className="detail-value">
                          {promotion.description || "-"}
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Phạm vi áp dụng:
                        {isEditing && !isFieldEditable("dealerId") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("dealerId") ? (
                        <div style={{ flex: 1 }}>
                          <CustomDropdown
                            value={formData.dealerId}
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                dealerId: val,
                              }))
                            }
                            options={[
                              {
                                value: "",
                                label: "Global - Áp dụng cho tất cả dealer",
                                icon: "🌐",
                              },
                              ...dealers.map((dealer) => ({
                                value: String(dealer.id || dealer.dealerId),
                                label: `${dealer.name} (${dealer.code})`,
                                icon: "🏢",
                              })),
                            ]}
                            minWidth="100%"
                          />
                        </div>
                      ) : (
                        <span className="detail-value">
                          {getDealerName(promotion.dealerId)}
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Nguồn tài trợ:
                        {isEditing && !isFieldEditable("fundedBy") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("fundedBy") ? (
                        <div style={{ flex: 1 }}>
                          <CustomDropdown
                            value={formData.fundedBy}
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                fundedBy: val,
                              }))
                            }
                            options={getAvailableFundedByOptions()}
                            minWidth="100%"
                          />
                          {validationErrors.fundedBy && (
                            <span className="error-text">
                              {validationErrors.fundedBy}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="detail-value">
                          {promotion.fundedBy === "OEM" && "🏭 OEM"}
                          {promotion.fundedBy === "Dealer" && "🏢 Dealer"}
                          {promotion.fundedBy === "Shared" && "🤝 Shared"}
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Quy tắc kết hợp:
                        {isEditing && !isFieldEditable("stackingRule") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("stackingRule") ? (
                        <div style={{ flex: 1 }}>
                          <CustomDropdown
                            value={formData.stackingRule}
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                stackingRule: val,
                              }))
                            }
                            options={stackingRuleOptions}
                            minWidth="100%"
                          />
                        </div>
                      ) : (
                        <span className="detail-value">
                          {promotion.stackingRule === "Stackable" &&
                            "📚 Stackable - Có thể kết hợp"}
                          {promotion.stackingRule === "Exclusive" &&
                            "⚡ Exclusive - Độc quyền"}
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Trạng thái:</span>
                      {isEditing &&
                      promotion.status !== "Expired" &&
                      promotion.status !== "Cancelled" ? (
                        <div style={{ flex: 1 }}>
                          <CustomDropdown
                            value={formData.status}
                            onChange={(val) => {
                              setFormData((prev) => ({ ...prev, status: val }));
                            }}
                            options={getAvailableStatusOptions()}
                            minWidth="100%"
                          />
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}>
                          <CustomDropdown
                            value={promotion.status}
                            onChange={() => {}} // Read-only
                            options={statusOptions}
                            minWidth="100%"
                            disabled={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin giá trị & thời gian</h4>
                  <div
                    className="detail-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div className="detail-item">
                      <span className="detail-label">
                        Số tiền giảm:
                        {isEditing && !isFieldEditable("amountOff") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("amountOff") ? (
                        <>
                          <input
                            type="number"
                            name="amountOff"
                            value={formData.amountOff}
                            onChange={handleInputChange}
                            min="0"
                            step="1000"
                            className={`detail-input ${
                              validationErrors.amountOff ? "error" : ""
                            }`}
                          />
                          {validationErrors.amountOff && (
                            <span className="error-text">
                              {validationErrors.amountOff}
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          className="detail-value"
                          style={{ color: "#dc3545", fontWeight: "600" }}
                        >
                          -{formatCurrency(promotion.amountOff)} VND
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Ngày bắt đầu:
                        {isEditing && !isFieldEditable("effectiveFrom") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("effectiveFrom") ? (
                        <>
                          <input
                            type="date"
                            name="effectiveFrom"
                            value={formData.effectiveFrom}
                            onChange={handleInputChange}
                            className={`detail-input ${
                              validationErrors.effectiveFrom ? "error" : ""
                            }`}
                          />
                          {validationErrors.effectiveFrom && (
                            <span className="error-text">
                              {validationErrors.effectiveFrom}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="detail-value">
                          {formatDate(promotion.effectiveFrom)}
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Ngày kết thúc:
                        {isEditing && !isFieldEditable("effectiveTo") && (
                          <span style={{ marginLeft: "6px", fontSize: "14px" }}>
                            🔒
                          </span>
                        )}
                      </span>
                      {isEditing && isFieldEditable("effectiveTo") ? (
                        <>
                          <input
                            type="date"
                            name="effectiveTo"
                            value={formData.effectiveTo}
                            onChange={handleInputChange}
                            min={
                              promotion.status === "Active"
                                ? promotion.effectiveTo
                                : undefined
                            }
                            className={`detail-input ${
                              validationErrors.effectiveTo ? "error" : ""
                            }`}
                          />
                          {promotion.status === "Active" && (
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                display: "block",
                                marginTop: "4px",
                              }}
                            >
                              💡 Chỉ được gia hạn thêm thời gian
                            </small>
                          )}
                          {validationErrors.effectiveTo && (
                            <span className="error-text">
                              {validationErrors.effectiveTo}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="detail-value">
                          {formatDate(promotion.effectiveTo)}
                        </span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Ngày tạo:</span>
                      <span className="detail-value">
                        {formatDate(promotion.createdAt)}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Người tạo:</span>
                      <span className="detail-value">
                        {promotion.createdBy || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Promotion Scopes */}
              <div
                style={{
                  animation:
                    isEditing && promotion.status === "Draft"
                      ? "rightColumnSlideIn 0.4s ease-out"
                      : "none",
                }}
              >
                <style>{`
                @keyframes rightColumnSlideIn {
                  from {
                    opacity: 0;
                    transform: translateX(20px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                  }
                }
              `}</style>
                {/* If editing Draft → show Scope Editor, else → show View */}
                {isEditing && promotion.status === "Draft" ? (
                  <div>
                    <PromotionScopeEditor
                      products={products}
                      branches={branches}
                      selectedProducts={selectedProducts}
                      setSelectedProducts={setSelectedProducts}
                      selectedBranches={selectedBranches}
                      setSelectedBranches={setSelectedBranches}
                      dealerId={formData.dealerId}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {/* Section: Sản phẩm áp dụng */}
                    <div className="detail-section">
                      <h4>📦 Sản phẩm áp dụng</h4>
                      <div
                        style={{
                          padding: "16px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          minHeight: "200px",
                        }}
                      >
                        {(() => {
                          // Check if there's a scope with productId = null (apply to all products)
                          const hasAllProducts =
                            promotion.scopes?.some(
                              (s) =>
                                s.productId === null ||
                                s.productId === undefined
                            ) || false;

                          if (hasAllProducts) {
                            return (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                  color: "#95a5a6",
                                  fontSize: "14px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "32px",
                                    display: "block",
                                    marginBottom: "8px",
                                    opacity: 0.5,
                                  }}
                                >
                                  🌐
                                </span>
                                <p style={{ margin: 0 }}>
                                  Áp dụng cho <strong>tất cả</strong> sản phẩm
                                </p>
                              </div>
                            );
                          }

                          // Get unique specific products
                          const productScopes =
                            promotion.scopes?.filter(
                              (s) => s.productId && s.productName
                            ) || [];
                          const uniqueProducts = Array.from(
                            new Map(
                              productScopes.map((s) => [s.productId, s])
                            ).values()
                          );

                          if (uniqueProducts.length > 0) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                {uniqueProducts.map((scope, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      padding: "10px 14px",
                                      backgroundColor: "#ffffff",
                                      borderRadius: "6px",
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      color: "#495057",
                                      border: "1px solid #e9ecef",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span style={{ fontSize: "16px" }}>📦</span>
                                    <span>{scope.productName}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          // No scopes at all
                          return (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#95a5a6",
                                fontSize: "14px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "32px",
                                  display: "block",
                                  marginBottom: "8px",
                                  opacity: 0.5,
                                }}
                              >
                                🌐
                              </span>
                              <p style={{ margin: 0 }}>
                                Áp dụng cho <strong>tất cả</strong> sản phẩm
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Section: Chi nhánh áp dụng */}
                    <div className="detail-section">
                      <h4>🏢 Chi nhánh áp dụng</h4>
                      <div
                        style={{
                          padding: "16px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          minHeight: "200px",
                        }}
                      >
                        {(() => {
                          // Check if there's a scope with branchId = null (apply to all branches)
                          const hasAllBranches =
                            promotion.scopes?.some(
                              (s) =>
                                s.branchId === null || s.branchId === undefined
                            ) || false;

                          if (hasAllBranches) {
                            return (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                  color: "#95a5a6",
                                  fontSize: "14px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "32px",
                                    display: "block",
                                    marginBottom: "8px",
                                    opacity: 0.5,
                                  }}
                                >
                                  🌐
                                </span>
                                <p style={{ margin: 0 }}>
                                  Áp dụng cho <strong>tất cả</strong> chi nhánh
                                </p>
                              </div>
                            );
                          }

                          // Get unique specific branches
                          const branchScopes =
                            promotion.scopes?.filter(
                              (s) => s.branchId && s.branchName
                            ) || [];
                          const uniqueBranches = Array.from(
                            new Map(
                              branchScopes.map((s) => [s.branchId, s])
                            ).values()
                          );

                          if (uniqueBranches.length > 0) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                {uniqueBranches.map((scope, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      padding: "10px 14px",
                                      backgroundColor: "#ffffff",
                                      borderRadius: "6px",
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      color: "#495057",
                                      border: "1px solid #e9ecef",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span style={{ fontSize: "16px" }}>🏢</span>
                                    <span>{scope.branchName}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          // No scopes at all
                          return (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#95a5a6",
                                fontSize: "14px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "32px",
                                  display: "block",
                                  marginBottom: "8px",
                                  opacity: 0.5,
                                }}
                              >
                                🌐
                              </span>
                              <p style={{ margin: 0 }}>
                                Áp dụng cho <strong>tất cả</strong> chi nhánh
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="modal-footer">
              <div className="edit-actions">
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailModal;
