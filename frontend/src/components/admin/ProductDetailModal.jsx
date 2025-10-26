import React, { useState, useEffect } from "react";
import "./ProductDetailModal.css";
import productApiService from "../../services/productApi";
import CustomDropdown from "./CustomDropdown";

const ProductDetailModal = ({ productId, initialProduct, onClose, onUpdate }) => {
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

  const getStatusOptions = () => [
    { value: "Active", label: "Hoạt động", class: "status-active", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", class: "status-inactive", icon: "⏸️" },
    { value: "Discontinued", label: "Ngừng sản xuất", class: "status-discontinued", icon: "🚫" }
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
    const imageUrl = product?.image || product?.imageUrl || product?.photo || product?.picture;
    return imageUrl;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      
      setProduct(prev => ({
        ...prev,
        ...submitData
      }));
      
      setIsEditing(false);
      setEditErrors({});
      
      // Notify parent to refresh the list
      if (onUpdate) onUpdate();
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
      <div className="admin-app">
        <div className="admin-product-modal-overlay">
          <div className="admin-product-modal-container">
            <div className="admin-product-modal-header">
              <div className="admin-product-modal-header-left">
                <h2 className="admin-product-modal-title">Chi Tiết Sản Phẩm</h2>
              </div>
            </div>
            <div className="admin-product-loading-container">
              <div className="admin-product-loading-spinner"></div>
              <p>Đang tải thông tin sản phẩm...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-app">
        <div className="admin-product-modal-overlay">
          <div className="admin-product-modal-container">
            <div className="admin-product-modal-header">
              <div className="admin-product-modal-header-left">
                <h2 className="admin-product-modal-title">Chi Tiết Sản Phẩm</h2>
              </div>
            </div>
            <div className="admin-product-error-container">
              <div className="admin-product-error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <p>{error}</p>
              <button className="admin-product-retry-btn" onClick={fetchProductDetails}>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="admin-app">
      <div className="admin-product-modal-overlay">
        <div className={`admin-product-modal-container ${isEditing ? 'edit-mode' : ''}`}>
          {/* Header */}
          <div className="admin-product-modal-header">
            <div className="admin-product-modal-header-left">
              <div className="admin-product-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h2 className="admin-product-modal-title">Chi Tiết Sản Phẩm</h2>
                <p className="admin-product-modal-subtitle">
                  Quản lý thông tin và trạng thái
                </p>
              </div>
            </div>
            <div className="admin-product-modal-header-actions">
              {!isEditing && (
                <button
                  className="admin-product-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
              <button className="admin-product-secondary-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {isEditing && (
            <div className="admin-product-edit-banner">
              <div className="admin-product-edit-banner-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
              <div className="admin-product-edit-banner-text">
                <p className="admin-product-edit-banner-title">Chế độ chỉnh sửa</p>
                <p className="admin-product-edit-banner-subtitle">
                  Bạn đang chỉnh sửa thông tin sản phẩm. Nhấn "Lưu thay đổi" để hoàn tất.
                </p>
              </div>
            </div>
          )}

          {/* Scrollable Content Wrapper */}
          <div className="admin-product-scrollable-content">
            {/* Product Image - Full Width at Top */}
            <div className="admin-product-image-section">
              <div className="admin-product-image-card">
                <div className="admin-product-image-large">
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
                  <div className="admin-product-image-placeholder" style={{ display: getProductImage() ? 'none' : 'flex' }}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>Chưa có ảnh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Layout */}
            <div className="admin-product-content-grid">
            {/* Left Column - Main Info */}
            <div className="admin-product-content-col">
              {/* Basic Info Card */}
              <div className="admin-product-info-card">
                <div className="admin-product-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <h4>Thông Tin Cơ Bản</h4>
                </div>
                <div className="admin-product-info-body">
                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Tên Sản Phẩm</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          className={`admin-product-field-input ${editErrors.name ? 'error' : ''}`}
                          placeholder="Nhập tên sản phẩm"
                        />
                        {editErrors.name && (
                          <span className="admin-product-field-error">{editErrors.name}</span>
                        )}
                      </>
                    ) : (
                      <div className="admin-product-field-value">
                        {product.name || product.modelName || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Mã Model</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="modelCode"
                          value={editData.modelCode}
                          onChange={handleInputChange}
                          className={`admin-product-field-input ${editErrors.modelCode ? 'error' : ''}`}
                          placeholder="Nhập mã model"
                        />
                        {editErrors.modelCode && (
                          <span className="admin-product-field-error">{editErrors.modelCode}</span>
                        )}
                      </>
                    ) : (
                      <div className="admin-product-field-value">
                        {product.modelCode || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Mã Variant</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="variantCode"
                          value={editData.variantCode}
                          onChange={handleInputChange}
                          className={`admin-product-field-input ${editErrors.variantCode ? 'error' : ''}`}
                          placeholder="Nhập mã variant"
                        />
                        {editErrors.variantCode && (
                          <span className="admin-product-field-error">{editErrors.variantCode}</span>
                        )}
                      </>
                    ) : (
                      <div className="admin-product-field-value">
                        {product.variantCode || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Mã Màu</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="colorCode"
                        value={editData.colorCode}
                        onChange={handleInputChange}
                        className="admin-product-field-input"
                        placeholder="Nhập mã màu"
                      />
                    ) : (
                      <div className="admin-product-field-value">
                        {product.colorCode || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Tên Màu</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="colorName"
                        value={editData.colorName}
                        onChange={handleInputChange}
                        className="admin-product-field-input"
                        placeholder="Nhập tên màu"
                      />
                    ) : (
                      <div className="admin-product-field-value">
                        {product.colorName || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Trạng Thái</label>
                    {isEditing ? (
                      <CustomDropdown
                        value={editData.status}
                        onChange={(val) => {
                          setEditData(prev => ({ ...prev, status: val }));
                          if (editErrors.status) {
                            setEditErrors(prev => ({ ...prev, status: "" }));
                          }
                        }}
                        options={getStatusOptions()}
                        minWidth="100%"
                        compact={true}
                      />
                    ) : (
                      <div className="admin-product-field-value">
                        {getStatusBadge(product.status)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Technical Info & System Info */}
            <div className="admin-product-content-col">
              {/* Technical Info Card */}
              <div className="admin-product-info-card">
                <div className="admin-product-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
                  </svg>
                  <h4>Thông Tin Kỹ Thuật</h4>
                </div>
                <div className="admin-product-info-body">
                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Dung Lượng Pin</label>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          name="batteryKwh"
                          value={editData.batteryKwh}
                          onChange={handleInputChange}
                          className={`admin-product-field-input ${editErrors.batteryKwh ? 'error' : ''}`}
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                        {editErrors.batteryKwh && (
                          <span className="admin-product-field-error">{editErrors.batteryKwh}</span>
                        )}
                      </>
                    ) : (
                      <div className="admin-product-field-value">
                        {formatNumber(product.batteryKwh, " kWh")}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Công Suất Motor</label>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          name="motorKw"
                          value={editData.motorKw}
                          onChange={handleInputChange}
                          className={`admin-product-field-input ${editErrors.motorKw ? 'error' : ''}`}
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                        {editErrors.motorKw && (
                          <span className="admin-product-field-error">{editErrors.motorKw}</span>
                        )}
                      </>
                    ) : (
                      <div className="admin-product-field-value">
                        {formatNumber(product.motorKw, " kW")}
                      </div>
                    )}
                  </div>

                  <div className="admin-product-field">
                    <label className="admin-product-field-label">Tầm Hoạt Động</label>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          name="rangeKm"
                          value={editData.rangeKm}
                          onChange={handleInputChange}
                          className={`admin-product-field-input ${editErrors.rangeKm ? 'error' : ''}`}
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                        {editErrors.rangeKm && (
                          <span className="admin-product-field-error">{editErrors.rangeKm}</span>
                        )}
                      </>
                    ) : (
                      <div className="admin-product-field-value">
                        {formatNumber(product.rangeKm, " km")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* System Info Card */}
              <div className="admin-product-info-card">
                <div className="admin-product-card-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                  <h4>Thông Tin Hệ Thống</h4>
                </div>
                <div className="admin-product-info-body">
                  <div className="admin-product-field">
                    <label className="admin-product-field-label">ID Sản Phẩm</label>
                    <div className="admin-product-field-value">
                      {product.productId || product.id || "-"}
                    </div>
                  </div>

                  {(product.createdAt || product.createAt || product.createdDate || product.dateCreated) && (
                    <div className="admin-product-field">
                      <label className="admin-product-field-label">Ngày Tạo</label>
                      <div className="admin-product-field-value admin-product-date-value">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                        {formatDate(product.createdAt || product.createAt || product.createdDate || product.dateCreated)}
                      </div>
                    </div>
                  )}

                  {(product.updatedAt || product.updatedDate || product.dateUpdated || product.lastModified) && (
                    <div className="admin-product-field">
                      <label className="admin-product-field-label">Cập Nhật Lần Cuối</label>
                      <div className="admin-product-field-value admin-product-date-value">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(product.updatedAt || product.updatedDate || product.dateUpdated || product.lastModified)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-product-modal-footer">
            {isEditing ? (
              <div className="admin-product-edit-actions">
                <button className="admin-product-cancel-btn" onClick={handleCancel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Hủy
                </button>
                <button className="admin-product-save-btn" onClick={handleSave}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <div className="admin-product-view-actions"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
