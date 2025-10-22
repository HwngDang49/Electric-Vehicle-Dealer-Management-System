import React, { useState, useEffect } from "react";
import "./ProductDetailModal.css";
import productApiService from "../../services/productApi";
import CustomDropdown from "./CustomDropdown";

const ProductDetailModal = ({ productId, initialProduct, onClose }) => {
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    modelCode: "",
    name: "",
    variantCode: "",
    colorCode: "",
    colorName: "",
    batteryKwh: "",
    motorKw: "",
    rangeKm: "",
    status: ""
  });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    if (!initialProduct && productId) {
      fetchProductDetails();
    }
  }, [productId, initialProduct]);

  useEffect(() => {
    if (product) {
      setEditData({
        modelCode: product.modelCode || "",
        name: product.name || product.modelName || "",
        variantCode: product.variantCode || "",
        colorCode: product.colorCode || "",
        colorName: product.colorName || "",
        batteryKwh: product.batteryKwh || "",
        motorKw: product.motorKw || "",
        rangeKm: product.rangeKm || "",
        status: product.status || ""
      });
    }
  }, [product]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productApiService.getProductById(productId);
      if (response && response.data) {
        setProduct(response.data);
      } else {
        setError("Không thể tải thông tin sản phẩm");
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Lỗi khi tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { text: "Hoạt động", class: "status-active" },
      Inactive: { text: "Không hoạt động", class: "status-inactive" },
      Discontinued: { text: "Ngừng sản xuất", class: "status-discontinued" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const statusOptions = [
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" },
    { value: "Discontinued", label: "Ngừng sản xuất", icon: "🚫" }
  ];

  const formatNumber = (value, unit = "") => {
    if (!value) return "-";
    return `${value}${unit}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      let date;
      if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (typeof dateString === 'number') {
        date = new Date(dateString);
      } else {
        date = dateString;
      }
      
      if (isNaN(date.getTime())) {
        return "-";
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const getProductImage = () => {
    // Try to get image from various possible fields
    const imageUrl = product?.image || product?.imageUrl || product?.photo || product?.picture;
    return imageUrl;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!editData.modelCode.trim()) {
      newErrors.modelCode = "Mã model là bắt buộc";
    }
    
    if (!editData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!editData.variantCode.trim()) {
      newErrors.variantCode = "Mã variant là bắt buộc";
    }
    
    if (editData.batteryKwh && isNaN(parseFloat(editData.batteryKwh))) {
      newErrors.batteryKwh = "Dung lượng pin phải là số";
    }
    
    if (editData.motorKw && isNaN(parseFloat(editData.motorKw))) {
      newErrors.motorKw = "Công suất motor phải là số";
    }
    
    if (editData.rangeKm && isNaN(parseInt(editData.rangeKm))) {
      newErrors.rangeKm = "Tầm hoạt động phải là số";
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const submitData = {
        ...editData,
        batteryKwh: editData.batteryKwh ? parseFloat(editData.batteryKwh) : null,
        motorKw: editData.motorKw ? parseFloat(editData.motorKw) : null,
        rangeKm: editData.rangeKm ? parseInt(editData.rangeKm) : null
      };
      
      await productApiService.updateProduct(product.productId || product.id, submitData);
      
      // Update local product state
      setProduct(prev => ({
        ...prev,
        ...submitData
      }));
      
      setIsEditing(false);
      setEditErrors({});
    } catch (error) {
      console.error("Error updating product:", error);
      setEditErrors({ submit: "Không thể cập nhật sản phẩm. Vui lòng thử lại." });
    }
  };

  const handleCancel = () => {
    setEditData({
      modelCode: product?.modelCode || "",
      name: product?.name || product?.modelName || "",
      variantCode: product?.variantCode || "",
      colorCode: product?.colorCode || "",
      colorName: product?.colorName || "",
      batteryKwh: product?.batteryKwh || "",
      motorKw: product?.motorKw || "",
      rangeKm: product?.rangeKm || "",
      status: product?.status || ""
    });
    setEditErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi Tiết Sản Phẩm</h2>
        </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi Tiết Sản Phẩm</h2>
        </div>
          <div className="error-container">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchProductDetails}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header với nút chỉnh sửa */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #e9ecef'
        }}>
          <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
            {product.name || product.modelName || "Chi Tiết Sản Phẩm"}
          </h2>
          <button
            className="edit-toggle-btn"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              backgroundColor: '#fff',
              color: '#495057',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
          >
            {isEditing ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
                Hủy
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Chỉnh sửa
              </>
            )}
          </button>
        </div>

        <div className="modal-body">
          {/* Product Image Section */}
          <div className="product-image-section">
            <div className="product-image-large">
              {getProductImage() ? (
                <img 
                  src={getProductImage()} 
                  alt={product.name || product.modelName || "Sản phẩm"}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="image-placeholder-large" style={{ display: getProductImage() ? 'none' : 'flex' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Chưa có ảnh</span>
              </div>
            </div>
          </div>


          {/* Product Details */}
          <div className="product-details">
            <div className="detail-section">
              <h4>Thông Tin Cơ Bản</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Tên Sản Phẩm:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className={`detail-input ${editErrors.name ? 'error' : ''}`}
                    />
                  ) : (
                    <span className="detail-value">{product.name || product.modelName || "-"}</span>
                  )}
                  {editErrors.name && <span className="error-text">{editErrors.name}</span>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mã Model:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="modelCode"
                      value={editData.modelCode}
                      onChange={handleInputChange}
                      className={`detail-input ${editErrors.modelCode ? 'error' : ''}`}
                    />
                  ) : (
                    <span className="detail-value">{product.modelCode || "-"}</span>
                  )}
                  {editErrors.modelCode && <span className="error-text">{editErrors.modelCode}</span>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mã Variant:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="variantCode"
                      value={editData.variantCode}
                      onChange={handleInputChange}
                      className={`detail-input ${editErrors.variantCode ? 'error' : ''}`}
                    />
                  ) : (
                    <span className="detail-value">{product.variantCode || "-"}</span>
                  )}
                  {editErrors.variantCode && <span className="error-text">{editErrors.variantCode}</span>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mã Màu:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="colorCode"
                      value={editData.colorCode}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  ) : (
                    <span className="detail-value">{product.colorCode || "-"}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tên Màu:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="colorName"
                      value={editData.colorName}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  ) : (
                    <span className="detail-value">{product.colorName || "-"}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng Thái:</span>
                  {isEditing ? (
                    <div style={{ flex: 1 }}>
                      <CustomDropdown
                        value={editData.status}
                        onChange={(val) => {
                          setEditData(prev => ({ ...prev, status: val }));
                        }}
                        options={statusOptions}
                        minWidth="100%"
                      />
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}>
                      <CustomDropdown
                        value={product.status}
                        onChange={() => {}} // Read-only
                        options={statusOptions}
                        minWidth="100%"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông Tin Kỹ Thuật</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Dung Lượng Pin (kWh):</span>
                  <span className="detail-value">{formatNumber(product.batteryKwh, " kWh")}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Công Suất Motor (kW):</span>
                  <span className="detail-value">{formatNumber(product.motorKw, " kW")}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tầm Hoạt Động (km):</span>
                  <span className="detail-value">{formatNumber(product.rangeKm, " km")}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông Tin Hệ Thống</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">ID Sản Phẩm:</span>
                  <span className="detail-value">{product.productId || product.id || "-"}</span>
                </div>
                {(product.createdAt || product.createAt || product.createdDate || product.dateCreated) && (
                  <div className="detail-item">
                    <span className="detail-label">Ngày Tạo:</span>
                    <span className="detail-value">
                      {formatDate(product.createdAt || product.createAt || product.createdDate || product.dateCreated)}
                    </span>
                  </div>
                )}
                {!product.createdAt && !product.createAt && (
                  <div className="detail-item">
                    <span className="detail-label">Thông tin hệ thống:</span>
                    <span className="detail-value text-muted">Chưa có dữ liệu từ backend</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Hủy
            </button>
            <button className="save-btn" onClick={handleSave}>
              Lưu thay đổi
            </button>
            {editErrors.submit && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {editErrors.submit}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailModal;