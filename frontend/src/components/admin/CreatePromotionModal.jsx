import React, { useState, useEffect, useMemo } from "react";
import "./CreateBranchModal.css";
import promotionService from "../../services/promotionService";
import dealerApiService from "../../services/dealerApi";
import productApiService from "../../services/productApi";
import branchApiService from "../../services/branchApi";
import CustomDropdown from "./CustomDropdown";

const CreatePromotionModal = ({ onClose, onSuccess }) => {
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
  
  // New states for scope selection UI
  const [scopeTab, setScopeTab] = useState("products"); // "products" | "branches"
  const [productSearch, setProductSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

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

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleToggleBranch = (branchId) => {
    setSelectedBranches(prev => {
      if (prev.includes(branchId)) {
        return prev.filter(id => id !== branchId);
      } else {
        return [...prev, branchId];
      }
    });
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const search = productSearch.toLowerCase();
    return products.filter(p => 
      (p.name?.toLowerCase().includes(search)) ||
      (p.modelName?.toLowerCase().includes(search)) ||
      (p.colorName?.toLowerCase().includes(search))
    );
  }, [products, productSearch]);

  // Filter branches based on dealer selection and search
  const filteredBranches = useMemo(() => {
    let filtered = branches;
    
    // First filter by dealer if a dealer is selected
    if (formData.dealerId) {
      const dealerIdNum = parseInt(formData.dealerId);
      filtered = branches.filter(b => 
        (b.dealerId || b.dealer_id) === dealerIdNum
      );
    }
    
    // Then filter by search
    if (branchSearch.trim()) {
      const search = branchSearch.toLowerCase();
      filtered = filtered.filter(b => 
        (b.name?.toLowerCase().includes(search)) ||
        (b.code?.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }, [branches, branchSearch, formData.dealerId]);

  // Toggle all products
  const handleToggleAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      // Deselect all filtered products
      const filteredIds = filteredProducts.map(p => p.id || p.productId);
      setSelectedProducts(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered products
      const allIds = filteredProducts.map(p => p.id || p.productId);
      setSelectedProducts(prev => {
        const newSet = new Set([...prev, ...allIds]);
        return Array.from(newSet);
      });
    }
  };

  // Toggle all branches
  const handleToggleAllBranches = () => {
    if (selectedBranches.length === filteredBranches.length && filteredBranches.length > 0) {
      // Deselect all filtered branches
      const filteredIds = filteredBranches.map(b => b.id || b.branchId);
      setSelectedBranches(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered branches
      const allIds = filteredBranches.map(b => b.id || b.branchId);
      setSelectedBranches(prev => {
        const newSet = new Set([...prev, ...allIds]);
        return Array.from(newSet);
      });
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
      
      if (selectedProducts.length > 0 && selectedBranches.length > 0) {
        // Option 2: CROSS JOIN - Kết hợp mỗi product với mỗi branch
        selectedProducts.forEach(productId => {
          selectedBranches.forEach(branchId => {
            scopes.push({ productId, branchId });
          });
        });
      } else if (selectedProducts.length > 0) {
        // Chỉ chọn products → áp dụng cho tất cả branches
        selectedProducts.forEach(productId => {
          scopes.push({ productId, branchId: null });
        });
      } else if (selectedBranches.length > 0) {
        // Chỉ chọn branches → áp dụng cho tất cả products
        selectedBranches.forEach(branchId => {
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
      
      onSuccess();
    } catch (err) {
      console.error("Error creating promotion:", err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Không thể tạo khuyến mãi. Vui lòng thử lại.");
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-branch-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1400px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
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
            <div>
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
            <div>
              {/* Promotion Scopes Section - Redesigned */}
              <div style={{ 
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
            {/* Header */}
            <div style={{ 
              padding: '20px 20px 16px 20px', 
              backgroundColor: '#fff'
            }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2c3e50' }}>
                Phạm vi áp dụng
              </h4>
              <p style={{ fontSize: '12px', color: '#95a5a6', margin: '6px 0 0 0' }}>
                Chọn sản phẩm và chi nhánh áp dụng khuyến mãi
              </p>
            </div>

            {/* Tabs - Modern Pill Style */}
            <div style={{ 
              display: 'flex',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#f8f9fa'
            }}>
              <button
                type="button"
                onClick={() => setScopeTab("products")}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: scopeTab === "products" ? '#dc3545' : '#fff',
                  color: scopeTab === "products" ? '#fff' : '#6c757d',
                  fontWeight: '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  boxShadow: scopeTab === "products" ? '0 2px 8px rgba(220, 53, 69, 0.2)' : 'none'
                }}
              >
                <span>Sản phẩm</span>
                {selectedProducts.length > 0 && (
                  <span style={{
                    backgroundColor: scopeTab === "products" ? 'rgba(255,255,255,0.25)' : '#e9ecef',
                    color: scopeTab === "products" ? '#fff' : '#495057',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {selectedProducts.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setScopeTab("branches")}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: scopeTab === "branches" ? '#dc3545' : '#fff',
                  color: scopeTab === "branches" ? '#fff' : '#6c757d',
                  fontWeight: '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  boxShadow: scopeTab === "branches" ? '0 2px 8px rgba(220, 53, 69, 0.2)' : 'none'
                }}
              >
                <span>Chi nhánh</span>
                {selectedBranches.length > 0 && (
                  <span style={{
                    backgroundColor: scopeTab === "branches" ? 'rgba(255,255,255,0.25)' : '#e9ecef',
                    color: scopeTab === "branches" ? '#fff' : '#495057',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {selectedBranches.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
              {scopeTab === "products" && (
                <div>
                  {/* Search Bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 36px',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '13px',
                        backgroundColor: '#f8f9fa',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: '12px center'
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.borderColor = '#dc3545';
                      }}
                      onBlur={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.borderColor = '#e9ecef';
                      }}
                    />
                  </div>

                  {/* Select All */}
                  {filteredProducts.length > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                        {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0
                          ? `✓ Đã chọn tất cả (${filteredProducts.length})`
                          : `${selectedProducts.length} đã chọn`}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAllProducts}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#dc3545',
                          backgroundColor: 'transparent',
                          border: '1px solid #dc3545',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#dc3545';
                        }}
                      >
                        {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0
                          ? 'Bỏ chọn tất cả'
                          : 'Chọn tất cả'}
                      </button>
                    </div>
                  )}

                  {/* Product List */}
                  <div style={{
                    maxHeight: '250px',
                    overflowY: 'auto',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    {filteredProducts.length === 0 ? (
                      <div style={{ 
                        padding: '32px', 
                        textAlign: 'center', 
                        color: '#6c757d',
                        fontSize: '13px'
                      }}>
                        {productSearch ? '❌ Không tìm thấy sản phẩm' : '📦 Đang tải sản phẩm...'}
                      </div>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const productId = product.id || product.productId;
                        const isChecked = selectedProducts.includes(productId);
                        return (
                          <label
                            key={productId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px 14px',
                              borderBottom: index < filteredProducts.length - 1 ? '1px solid #f1f3f5' : 'none',
                              cursor: 'pointer',
                              backgroundColor: isChecked ? '#fff5f5' : '#fff',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isChecked) e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isChecked ? '#fff5f5' : '#fff';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleProduct(productId)}
                              style={{ display: 'none' }}
                            />
                            <div style={{
                              width: '20px',
                              height: '20px',
                              minWidth: '20px',
                              borderRadius: '6px',
                              border: isChecked ? 'none' : '2px solid #e0e0e0',
                              backgroundColor: isChecked ? '#dc3545' : '#fff',
                              marginRight: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                              cursor: 'pointer',
                              boxShadow: isChecked ? '0 2px 6px rgba(220, 53, 69, 0.3)' : 'none'
                            }}>
                              {isChecked && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path
                                    d="M11 4L5.5 9.5L3 7"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                                {product.name || product.modelName}
                              </div>
                              {product.colorName && (
                                <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                  {product.colorName}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {scopeTab === "branches" && (
                <div>
                  {/* Info message if no dealer selected */}
                  {!formData.dealerId && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      fontSize: '13px',
                      color: '#856404'
                    }}>
                      ℹ️ Vui lòng chọn Dealer ở "Phạm vi áp dụng" để có thể chọn chi nhánh
                    </div>
                  )}
                  
                  {/* Search Bar */}
                  {formData.dealerId && (
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 36px',
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '13px',
                          backgroundColor: '#f8f9fa',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: '12px center'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#dc3545';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.borderColor = '#e9ecef';
                        }}
                      />
                    </div>
                  )}

                  {/* Select All */}
                  {formData.dealerId && filteredBranches.length > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                        {selectedBranches.length === filteredBranches.length && filteredBranches.length > 0
                          ? `✓ Đã chọn tất cả (${filteredBranches.length})`
                          : `${selectedBranches.length} đã chọn`}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAllBranches}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#dc3545',
                          backgroundColor: 'transparent',
                          border: '1px solid #dc3545',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#dc3545';
                        }}
                      >
                        {selectedBranches.length === filteredBranches.length && filteredBranches.length > 0
                          ? 'Bỏ chọn tất cả'
                          : 'Chọn tất cả'}
                      </button>
                    </div>
                  )}

                  {/* Branch List */}
                  {formData.dealerId && (
                    <div style={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#fff'
                    }}>
                      {filteredBranches.length === 0 ? (
                        <div style={{ 
                          padding: '32px', 
                          textAlign: 'center', 
                          color: '#6c757d',
                          fontSize: '13px'
                        }}>
                          {branchSearch ? '❌ Không tìm thấy chi nhánh' : '🏢 Dealer này chưa có chi nhánh'}
                        </div>
                    ) : (
                      filteredBranches.map((branch, index) => {
                        const branchId = branch.id || branch.branchId;
                        const isChecked = selectedBranches.includes(branchId);
                        return (
                          <label
                            key={branchId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px 14px',
                              borderBottom: index < filteredBranches.length - 1 ? '1px solid #f1f3f5' : 'none',
                              cursor: 'pointer',
                              backgroundColor: isChecked ? '#fff5f5' : '#fff',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isChecked) e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isChecked ? '#fff5f5' : '#fff';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleBranch(branchId)}
                              style={{ display: 'none' }}
                            />
                            <div style={{
                              width: '20px',
                              height: '20px',
                              minWidth: '20px',
                              borderRadius: '6px',
                              border: isChecked ? 'none' : '2px solid #e0e0e0',
                              backgroundColor: isChecked ? '#dc3545' : '#fff',
                              marginRight: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                              cursor: 'pointer',
                              boxShadow: isChecked ? '0 2px 6px rgba(220, 53, 69, 0.3)' : 'none'
                            }}>
                              {isChecked && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path
                                    d="M11 4L5.5 9.5L3 7"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                                {branch.name}
                              </div>
                              {branch.code && (
                                <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                  {branch.code}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                    </div>
                  )}
                </div>
              )}
            </div>
              </div>
            </div>
          </div>

          {/* Actions at bottom, full width */}
          <div className="modal-actions" style={{ marginTop: '24px' }}>
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
  );
};

export default CreatePromotionModal;
