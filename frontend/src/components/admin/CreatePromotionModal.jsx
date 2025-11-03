import React, { useState, useEffect } from "react";
import "./CreatePromotionModal.css";
import promotionService from "../../services/promotionService";
import dealerApiService from "../../services/dealerApi";
import productApiService from "../../services/productApi";
import branchApiService from "../../services/branchApi";
import CustomDropdown from "./CustomDropdown";
import PromotionScopeEditor from "./PromotionScopeEditor";

const CreatePromotionModal = ({ onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dealerId: "", // "" = Global
    fundedBy: "OEM",
    stackingRule: "Stackable",
    amountOff: "",
    effectiveFrom: "",
    effectiveTo: ""
  });
  
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const fundedByOptions = [
    { value: "OEM", label: "OEM", icon: "🏭" },
    { value: "Dealer", label: "Dealer", icon: "🏢" },
    { value: "Shared", label: "Shared", icon: "🤝" }
  ];

  const stackingRuleOptions = [
    { value: "Stackable", label: "Stackable - Có thể kết hợp", icon: "📚" },
    { value: "Exclusive", label: "Exclusive - Độc quyền", icon: "⚡" }
  ];

  useEffect(() => {
    loadDealers();
    loadProducts();
    loadBranches();
  }, []);

  // Auto-set FundedBy to OEM for Global promotions
  useEffect(() => {
    if (formData.dealerId === "") {
      // Global → Default to OEM
      if (formData.fundedBy !== "OEM") {
        setFormData(prev => ({ ...prev, fundedBy: "OEM" }));
        // Clear fundedBy validation error when auto-changing
        setValidationErrors(prev => ({ ...prev, fundedBy: "" }));
      }
      // Clear selected branches for global promotions
      setSelectedBranches([]);
    }
    // For dealer-specific: allow all options (OEM, Dealer, Shared)
  }, [formData.dealerId]);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      const fetchedDealers = response.data || response;
      setDealers(fetchedDealers || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productApiService.getProducts({});
      const fetchedProducts = response.data || response;
      setProducts(fetchedProducts || []);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchApiService.getBranches();
      const fetchedBranches = response.data || response;
      setBranches(fetchedBranches || []);
    } catch (err) {
      console.error("Error loading branches:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
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
    
    if (formData.effectiveTo && formData.effectiveFrom >= formData.effectiveTo) {
      errors.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Business rule validation
    if (formData.dealerId === "" && formData.fundedBy !== "OEM") {
      errors.fundedBy = "Global promotion phải do OEM tài trợ";
    }
    
    // Dealer-specific promotions can be funded by OEM, Dealer, or Shared (no restriction)
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Build scopes from selected products and branches
      const scopes = [];
      
      // Check if "all products" selected
      const allProductsSelected = selectedProducts.length === products.length && products.length > 0;
      // Check if "all branches" selected (for dealer-specific promotions)
      const allBranchesSelected = formData.dealerId && selectedBranches.length === branches.length && branches.length > 0;
      
      // Normalize: If all selected → treat as null (apply to all)
      const normalizedProductIds = allProductsSelected ? [null] : selectedProducts;
      const normalizedBranchIds = allBranchesSelected ? [null] : selectedBranches;
      
      if (normalizedProductIds.length > 0 && normalizedBranchIds.length > 0) {
        // CROSS JOIN - Kết hợp mỗi product với mỗi branch
        normalizedProductIds.forEach(productId => {
          normalizedBranchIds.forEach(branchId => {
            scopes.push({ productId, branchId });
          });
        });
      } else if (normalizedProductIds.length > 0) {
        // Chỉ chọn products → áp dụng cho tất cả branches
        normalizedProductIds.forEach(productId => {
          scopes.push({ productId, branchId: null });
        });
      } else if (normalizedBranchIds.length > 0) {
        // Chỉ chọn branches → áp dụng cho tất cả products
        normalizedBranchIds.forEach(branchId => {
          scopes.push({ productId: null, branchId });
        });
      }
      // Nếu không chọn gì → scopes = [] (áp dụng cho tất cả)

      const promotionData = {
        name: formData.name,
        description: formData.description || null,
        dealerId: formData.dealerId ? parseInt(formData.dealerId) : null,
        fundedBy: formData.fundedBy,
        stackingRule: formData.stackingRule,
        amountOff: parseFloat(formData.amountOff),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
        scopes: scopes.length > 0 ? scopes : undefined // Send undefined if empty
      };
      
      console.log("=== CREATING PROMOTION ===");
      console.log("Selected Products:", selectedProducts);
      console.log("Selected Branches:", selectedBranches);
      console.log("Built Scopes:", scopes);
      console.log("Final Promotion Data:", promotionData);
      
      const response = await promotionService.createPromotion(promotionData);
      console.log("Promotion created successfully:", response);
      
      // Close modal immediately, toast will be shown in PromotionManagement
      onSuccess(formData.name);
    } catch (err) {
      console.error("Error creating promotion:", err);
      const errorMessage =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        err.message ||
        "Không thể tạo khuyến mãi. Vui lòng thử lại.";
      
      setError(errorMessage);
      // Show error toast in parent
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Get available FundedBy options based on dealer selection
  const getAvailableFundedByOptions = () => {
    if (formData.dealerId === "") {
      // Global → Only OEM
      return fundedByOptions.filter(opt => opt.value === "OEM");
    } else {
      // Dealer-specific → All options (OEM, Dealer, Shared)
      return fundedByOptions;
    }
  };

  return (
    <div className="admin-create-promotion-modal-app">
      <div className="modal-overlay" onClick={handleClose}>
        <div className="create-branch-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1400px', width: '95%', maxHeight: '90vh' }}>
          <div className="modal-header">
          <h2>Tạo Khuyến mãi Mới</h2>
          <button className="close-btn" onClick={handleClose} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message" style={{ gridColumn: '1 / -1' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {error}
            </div>
          )}

          {/* Main 2-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* LEFT COLUMN - Basic Information */}
            <div style={{
              animation: 'leftColumnSlideIn 0.4s ease-out'
            }}>
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
              <div className="form-group">
                <label htmlFor="name">Tên Khuyến mãi *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên khuyến mãi"
              className={validationErrors.name ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả (tùy chọn)"
              rows="3"
              disabled={loading}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dealerId">Phạm vi áp dụng</label>
            <CustomDropdown
              value={formData.dealerId}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, dealerId: val }));
                if (validationErrors.dealerId) {
                  setValidationErrors(prev => ({ ...prev, dealerId: "" }));
                }
              }}
              options={[
                { value: "", label: "Global - Áp dụng cho tất cả dealer", icon: "🌐" },
                ...dealers.map(dealer => ({
                  value: String(dealer.id || dealer.dealerId),
                  label: `${dealer.name} (${dealer.code})`,
                  icon: "🏢"
                }))
              ]}
              minWidth="100%"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="fundedBy">Nguồn tài trợ *</label>
              <CustomDropdown
                value={formData.fundedBy}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, fundedBy: val }));
                  if (validationErrors.fundedBy) {
                    setValidationErrors(prev => ({ ...prev, fundedBy: "" }));
                  }
                }}
                options={getAvailableFundedByOptions()}
                minWidth="100%"
              />
              {validationErrors.fundedBy && (
                <span className="error-text">{validationErrors.fundedBy}</span>
              )}
              {formData.dealerId === "" && (
                <span style={{ fontSize: '12px', color: '#95a5a6', marginTop: '4px', display: 'block' }}>
                  ℹ️ Global promotion chỉ có thể do OEM tài trợ
                </span>
              )}
              {formData.dealerId !== "" && (
                <span style={{ fontSize: '12px', color: '#95a5a6', marginTop: '4px', display: 'block' }}>
                  ℹ️ Có thể chọn OEM, Dealer hoặc Shared tài trợ
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stackingRule">Quy tắc kết hợp *</label>
              <CustomDropdown
                value={formData.stackingRule}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, stackingRule: val }));
                  if (validationErrors.stackingRule) {
                    setValidationErrors(prev => ({ ...prev, stackingRule: "" }));
                  }
                }}
                options={stackingRuleOptions}
                minWidth="100%"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amountOff">Số tiền giảm (VND) *</label>
            <input
              type="number"
              id="amountOff"
              name="amountOff"
              value={formData.amountOff}
              onChange={handleInputChange}
              placeholder="Nhập số tiền giảm"
              min="0"
              step="1000"
              className={validationErrors.amountOff ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.amountOff && (
              <span className="error-text">{validationErrors.amountOff}</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="effectiveFrom">Ngày bắt đầu *</label>
              <input
                type="date"
                id="effectiveFrom"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleInputChange}
                className={validationErrors.effectiveFrom ? "error" : ""}
                disabled={loading}
              />
              {validationErrors.effectiveFrom && (
                <span className="error-text">{validationErrors.effectiveFrom}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="effectiveTo">Ngày kết thúc</label>
              <input
                type="date"
                id="effectiveTo"
                name="effectiveTo"
                value={formData.effectiveTo}
                onChange={handleInputChange}
                className={validationErrors.effectiveTo ? "error" : ""}
                disabled={loading}
              />
              {validationErrors.effectiveTo && (
                <span className="error-text">{validationErrors.effectiveTo}</span>
              )}
              </div>
            </div>
            </div>

            {/* RIGHT COLUMN - Promotion Scopes */}
            <div style={{
              animation: 'rightColumnSlideIn 0.4s ease-out'
            }}>
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
          </div>

          {/* Actions at bottom, full width */}
          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Đang tạo...
                </>
              ) : (
                "Tạo Khuyến mãi"
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePromotionModal;
