import React, { useState, useMemo } from "react";

/**
 * PromotionScopeEditor - Reusable component for selecting promotion scopes
 * Used in both CreatePromotionModal and PromotionDetailModal
 */
const PromotionScopeEditor = ({
  products = [],
  branches = [],
  selectedProducts = [],
  setSelectedProducts,
  selectedBranches = [],
  setSelectedBranches,
  dealerId = ""
}) => {
  const [scopeTab, setScopeTab] = useState("products");
  const [productSearch, setProductSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

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
    if (dealerId) {
      const dealerIdNum = parseInt(dealerId);
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
  }, [branches, branchSearch, dealerId]);

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

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div style={{ 
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        backgroundColor: '#fff'
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
            backgroundColor: scopeTab === "products" ? '#20c997' : '#fff',
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
            boxShadow: scopeTab === "products" ? '0 2px 8px rgba(32, 201, 151, 0.3)' : 'none'
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
            backgroundColor: scopeTab === "branches" ? '#20c997' : '#fff',
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
            boxShadow: scopeTab === "branches" ? '0 2px 8px rgba(32, 201, 151, 0.3)' : 'none'
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
          <div style={{
            animation: 'fadeSlideIn 0.3s ease-out'
          }}>
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
                  color: '#2d3748',
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
                  e.target.style.borderColor = '#20c997';
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
                    color: '#20c997',
                    backgroundColor: 'transparent',
                    border: '1px solid #20c997',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#20c997';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#20c997';
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
                        backgroundColor: isChecked ? '#e6f9f3' : '#fff',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isChecked ? '#e6f9f3' : '#fff';
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
                        backgroundColor: isChecked ? '#20c997' : '#fff',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                        boxShadow: isChecked ? '0 2px 6px rgba(32, 201, 151, 0.3)' : 'none'
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
          <div style={{
            animation: 'fadeSlideIn 0.3s ease-out'
          }}>
            {/* Info message if no dealer selected */}
            {!dealerId && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e7ff',
                borderRadius: '10px',
                marginBottom: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}>
                <span style={{ 
                  fontSize: '20px',
                  lineHeight: '1',
                  marginTop: '1px'
                }}>
                  💡
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    Chọn Dealer ở "Phạm vi áp dụng" để có thể chọn chi nhánh cụ thể
                  </p>
                </div>
              </div>
            )}
            
            {/* Search Bar */}
            {dealerId && (
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
                    color: '#2d3748',
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
                    e.target.style.borderColor = '#20c997';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#e9ecef';
                  }}
                />
              </div>
            )}

            {/* Select All */}
            {dealerId && filteredBranches.length > 0 && (
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
                    color: '#20c997',
                    backgroundColor: 'transparent',
                    border: '1px solid #20c997',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#20c997';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#20c997';
                  }}
                >
                  {selectedBranches.length === filteredBranches.length && filteredBranches.length > 0
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>
            )}

            {/* Branch List */}
            {dealerId && (
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
                        backgroundColor: isChecked ? '#e6f9f3' : '#fff',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isChecked ? '#e6f9f3' : '#fff';
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
                        backgroundColor: isChecked ? '#20c997' : '#fff',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                        boxShadow: isChecked ? '0 2px 6px rgba(32, 201, 151, 0.3)' : 'none'
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
    </>
  );
};

export default PromotionScopeEditor;

