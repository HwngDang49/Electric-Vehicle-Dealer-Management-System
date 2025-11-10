import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./ProductDetailModal.css";
import productApiService from "../../services/productApi";
import CustomDropdown from "./CustomDropdown";
import apiClient from "../../services/api";
import { API_ENDPOINTS } from "../../services/constants";

const ProductDetailModal = ({ productId, initialProduct, onClose, onUpdate, onSaveSuccess, onSaveError }) => {
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
    imageUrl: "",
    batteryKwh: "",
    motorKw: "",
    rangeKm: "",
    status: ""
  });
  const [editErrors, setEditErrors] = useState({});
  const [showPricebookWarning, setShowPricebookWarning] = useState(false);
  const [activePricebooks, setActivePricebooks] = useState([]);
  const [removeFromPricebooks, setRemoveFromPricebooks] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!initialProduct && productId) {
      fetchProductDetails();
    }
  }, [productId, initialProduct]);

  useEffect(() => {
    if (product) {
      setEditData({
        modelCode: product.modelCode || product.ModelCode || "",
        name: product.name || product.modelName || product.Name || product.ModelName || "",
        variantCode: product.variantCode || product.VariantCode || "",
        colorCode: product.colorCode || product.ColorCode || "",
        colorName: product.colorName || product.ColorName || "",
        imageUrl: product.imageUrl || product.ImageUrl || "",
        batteryKwh: product.batteryKwh || product.BatteryKwh || "",
        motorKw: product.motorKw || product.MotorKw || "",
        rangeKm: product.rangeKm || product.RangeKm || "",
        status: product.status || product.Status || ""
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
    // When editing, prioritize editData.imageUrl
    if (isEditing && (editData.imageUrl || imagePreview)) {
      return imagePreview || editData.imageUrl;
    }
    // Otherwise use product image
    return product?.imageUrl || product?.image || product?.photo || product?.picture;
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setEditErrors(prev => ({
        ...prev,
        image: "Chỉ chấp nhận file ảnh: JPG, JPEG, PNG, WEBP"
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditErrors(prev => ({
        ...prev,
        image: "File không được vượt quá 5MB"
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setEditErrors(prev => ({
      ...prev,
      image: ""
    }));

    // Auto upload file
    try {
      setUploading(true);
      console.log("📤 Uploading image:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(API_ENDPOINTS.FILES.UPLOAD_PRODUCT_IMAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Image uploaded successfully:", response.data);

      const imageUrl =
        response.data?.value || response.data?.data || response.data;

      setEditData(prev => ({
        ...prev,
        imageUrl: imageUrl,
      }));
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể upload ảnh";
      setEditErrors(prev => ({
        ...prev,
        image: errorMessage
      }));
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setEditData(prev => ({
      ...prev,
      imageUrl: ""
    }));
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

  // Check if there are any changes
  const hasChanges = () => {
    const original = {
      modelCode: product?.modelCode || "",
      name: product?.name || product?.modelName || "",
      variantCode: product?.variantCode || "",
      colorCode: product?.colorCode || "",
      colorName: product?.colorName || "",
      imageUrl: product?.imageUrl || "",
      batteryKwh: product?.batteryKwh || "",
      motorKw: product?.motorKw || "",
      rangeKm: product?.rangeKm || "",
      status: product?.status || "",
    };

    const current = {
      modelCode: editData.modelCode || "",
      name: editData.name || "",
      variantCode: editData.variantCode || "",
      colorCode: editData.colorCode || "",
      colorName: editData.colorName || "",
      imageUrl: editData.imageUrl || "",
      batteryKwh: editData.batteryKwh || "",
      motorKw: editData.motorKw || "",
      rangeKm: editData.rangeKm || "",
      status: editData.status || "",
    };

    // Compare values
    return (
      original.modelCode !== current.modelCode ||
      original.name !== current.name ||
      original.variantCode !== current.variantCode ||
      original.colorCode !== current.colorCode ||
      original.colorName !== current.colorName ||
      original.imageUrl !== current.imageUrl ||
      String(original.batteryKwh || "") !== String(current.batteryKwh || "") ||
      String(original.motorKw || "") !== String(current.motorKw || "") ||
      String(original.rangeKm || "") !== String(current.rangeKm || "") ||
      original.status !== current.status
    );
  };

  const handleSave = async (skipPricebookCheck = false) => {
    if (!validateForm()) {
      return;
    }

    // Check if there are any changes
    if (!hasChanges()) {
      // No changes, just exit edit mode without showing toast
      setIsEditing(false);
      return;
    }

    // Normalize status for comparison (handle case sensitivity)
    const normalizeStatus = (status) => {
      if (!status) return "";
      return String(status).trim();
    };
    
    const productStatus = normalizeStatus(product?.status);
    const editStatus = normalizeStatus(editData?.status);
    
    // Check if status is being changed to Inactive/Discontinued
    const isChangingToInactive = 
      productStatus !== editStatus &&
      (editStatus === "Inactive" || editStatus === "Discontinued");

    console.log("handleSave - Debug:", {
      productStatus,
      editStatus,
      isChangingToInactive,
      skipPricebookCheck,
      pendingSave,
      productId: product.productId || product.id
    });

    // If changing to inactive and haven't checked pricebooks yet, check first
    if (isChangingToInactive && !skipPricebookCheck && !pendingSave) {
      try {
        console.log("Checking active pricebooks for product:", product.productId || product.id);
        const response = await productApiService.getActivePricebooksContainingProduct(product.productId || product.id);
        console.log("Active pricebooks response:", response);
        
        // handleApiResponse returns { status, data, message, ... }
        // Backend returns Ok(result.Value) where result.Value is List<ActivePricebookInfo>
        // So after handleApiResponse, data should be the array directly
        let pricebooks = [];
        if (Array.isArray(response)) {
          pricebooks = response;
        } else if (response?.data && Array.isArray(response.data)) {
          pricebooks = response.data;
        } else if (response?.value && Array.isArray(response.value)) {
          pricebooks = response.value;
        }
        
        console.log("Parsed pricebooks:", pricebooks, "Length:", pricebooks.length);
        
        if (Array.isArray(pricebooks) && pricebooks.length > 0) {
          console.log("Showing pricebook warning modal with", pricebooks.length, "pricebooks");
          console.log("Pricebooks data:", pricebooks);
          setActivePricebooks(pricebooks);
          setRemoveFromPricebooks(false);
          setPendingSave({
            submitData: {
              ...editData,
              batteryKwh: editData.batteryKwh ? parseFloat(editData.batteryKwh) : null,
              motorKw: editData.motorKw ? parseFloat(editData.motorKw) : null,
              rangeKm: editData.rangeKm ? parseInt(editData.rangeKm) : null
            }
          });
          setShowPricebookWarning(true);
          console.log("setShowPricebookWarning(true) called");
          return;
        } else {
          console.log("No active pricebooks found, proceeding with save");
        }
      } catch (error) {
        console.error("Error checking active pricebooks:", error);
        console.error("Error details:", error.response?.data || error.message);
        // Continue with save if check fails
      }
    }
    
    try {
      // If user chose to remove from pricebooks, do that first
      if (isChangingToInactive && removeFromPricebooks) {
        await productApiService.removeProductFromPricebooks(product.productId || product.id);
      }

      const submitData = pendingSave?.submitData || {
        ...editData,
        imageUrl: editData.imageUrl || null,
        batteryKwh: editData.batteryKwh ? parseFloat(editData.batteryKwh) : null,
        motorKw: editData.motorKw ? parseFloat(editData.motorKw) : null,
        rangeKm: editData.rangeKm ? parseInt(editData.rangeKm) : null
      };
      
      const currentProductId = product.productId || product.id || productId;
      await productApiService.updateProduct(currentProductId, submitData);
      
      // Fetch updated product data to get the latest UpdatedAt
      if (currentProductId) {
        try {
          const response = await productApiService.getProductById(currentProductId);
          if (response && response.data) {
            setProduct(response.data);
          }
        } catch (error) {
          console.error("Error fetching updated product:", error);
          // Fallback: update state with submitData if fetch fails
          setProduct(prev => ({
            ...prev,
            ...submitData
          }));
        }
      } else {
        // Fallback: update state with submitData if no productId
        setProduct(prev => ({
          ...prev,
          ...submitData
        }));
      }
      
      setImagePreview(null); // Clear preview after save
      setIsEditing(false);
      setEditErrors({});
      setShowPricebookWarning(false);
      setPendingSave(null);
      setRemoveFromPricebooks(false);
      setActivePricebooks([]);
      
      // Notify parent to refresh the list
      if (onUpdate) onUpdate();
      
      // Show success toast if callback provided
      if (onSaveSuccess) {
        onSaveSuccess(`Đã cập nhật thông tin sản phẩm "${editData.name}" thành công!`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      const errorMessage = 
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật sản phẩm. Vui lòng thử lại.";
      setEditErrors({ submit: errorMessage });
      setShowPricebookWarning(false);
      setPendingSave(null);
      if (onSaveError) {
        onSaveError(errorMessage);
      }
    }
  };

  const handleConfirmPricebookWarning = () => {
    handleSave(true); // Skip pricebook check since we already know the result
  };

  const handleCancelPricebookWarning = () => {
    setShowPricebookWarning(false);
    setPendingSave(null);
    setRemoveFromPricebooks(false);
    setActivePricebooks([]);
  };

  const handleCancel = () => {
    setEditData({
      modelCode: product?.modelCode || "",
      name: product?.name || product?.modelName || "",
      variantCode: product?.variantCode || "",
      colorCode: product?.colorCode || "",
      colorName: product?.colorName || "",
      imageUrl: product?.imageUrl || "",
      batteryKwh: product?.batteryKwh || "",
      motorKw: product?.motorKw || "",
      rangeKm: product?.rangeKm || "",
      status: product?.status || ""
    });
    setEditErrors({});
    setImagePreview(null);
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
                  {isEditing && (
                    <div 
                      className={`admin-product-image-edit-overlay ${!getProductImage() ? 'always-visible' : ''}`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        id="product-image-upload-edit"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="upload-overlay-loading">
                          <div className="upload-spinner"></div>
                          <p>Đang upload...</p>
                        </div>
                      ) : (
                        <label
                          htmlFor="product-image-upload-edit"
                          className="upload-image-btn"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                          {getProductImage() ? "Thay đổi ảnh" : "Thêm ảnh"}
                        </label>
                      )}
                      {getProductImage() && (
                        <button
                          type="button"
                          className="remove-image-overlay-btn"
                          onClick={handleRemoveImage}
                          disabled={uploading}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {isEditing && editErrors.image && (
                  <span className="admin-product-field-error" style={{ marginTop: "8px", display: "block" }}>
                    {editErrors.image}
                  </span>
                )}
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
                        {getStatusBadge(product?.status || product?.Status || "")}
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
                      {product?.productId || product?.ProductId || product?.id || product?.Id || product?.productCode || product?.ProductCode || "-"}
                    </div>
                  </div>

                  {(product?.createdAt ||
                    product?.CreatedAt ||
                    product?.createAt ||
                    product?.CreateAt ||
                    product?.createdDate ||
                    product?.CreatedDate ||
                    product?.dateCreated ||
                    product?.DateCreated) && (
                    <div className="admin-product-field">
                      <label className="admin-product-field-label">Ngày Tạo</label>
                      <div className="admin-product-field-value admin-product-date-value">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                        {formatDate(
                          product?.createdAt ||
                            product?.CreatedAt ||
                            product?.createAt ||
                            product?.CreateAt ||
                            product?.createdDate ||
                            product?.CreatedDate ||
                            product?.dateCreated ||
                            product?.DateCreated
                        )}
                      </div>
                    </div>
                  )}

                  {(product?.updatedAt ||
                    product?.updatedDate ||
                    product?.dateUpdated ||
                    product?.lastModified) && (
                    <div className="admin-product-field">
                      <label className="admin-product-field-label">Cập Nhật Lần Cuối</label>
                      <div className="admin-product-field-value admin-product-date-value">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(
                          product?.updatedAt ||
                            product?.updatedDate ||
                            product?.dateUpdated ||
                            product?.lastModified
                        )}
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
                <button className="admin-product-save-btn" onClick={() => handleSave()}>
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

      {/* Pricebook Warning Modal */}
      {showPricebookWarning && ReactDOM.createPortal(
        <div className="admin-pricebook-warning-modal-overlay" onClick={handleCancelPricebookWarning}>
          <div className="admin-pricebook-warning-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-pricebook-warning-modal-header">
              <div className="admin-pricebook-warning-modal-header-left">
                <div className="admin-pricebook-warning-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h2 className="admin-pricebook-warning-modal-title">Cảnh Báo</h2>
              </div>
              <button className="admin-pricebook-warning-modal-close-btn" onClick={handleCancelPricebookWarning}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="admin-pricebook-warning-modal-body">
              <p className="admin-pricebook-warning-modal-description">
                Sản phẩm <strong>"{product?.name || editData.name}"</strong> đang được sử dụng trong <strong>{activePricebooks.length}</strong> bảng giá đang hoạt động:
              </p>
              
              <div className="admin-pricebook-warning-list">
                {activePricebooks.map((pb) => (
                  <div key={pb.pricebookId} className="admin-pricebook-warning-list-item">
                    <div>
                      <div className="admin-pricebook-warning-list-item-name">{pb.name}</div>
                      <div className="admin-pricebook-warning-list-item-meta">
                        <span>{pb.isGlobal ? "🌍 Global" : `🏢 Dealer ID: ${pb.dealerId}`}</span>
                        <span>•</span>
                        <span>{new Date(pb.effectiveFrom).toLocaleDateString("vi-VN")}</span>
                        {pb.effectiveTo && (
                          <>
                            <span>-</span>
                            <span>{new Date(pb.effectiveTo).toLocaleDateString("vi-VN")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div 
                className={`admin-pricebook-warning-checkbox-section ${removeFromPricebooks ? 'active' : ''}`}
                onClick={() => setRemoveFromPricebooks(!removeFromPricebooks)}
              >
                <div className="admin-pricebook-warning-checkbox-content">
                  <div className="admin-pricebook-warning-checkbox-header">
                    <div className="admin-pricebook-warning-checkbox-icon">
                      {removeFromPricebooks ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></polyline>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="4" width="16" height="16" rx="4" fill="none"></rect>
                        </svg>
                      )}
                    </div>
                    <div className="admin-pricebook-warning-checkbox-title">
                      Tự động xóa sản phẩm khỏi các bảng giá trên
                    </div>
                  </div>
                  <div className="admin-pricebook-warning-checkbox-description">
                    Sản phẩm sẽ được xóa khỏi tất cả các bảng giá đang hoạt động trước khi thay đổi trạng thái. 
                    Các bảng giá sẽ vẫn hoạt động bình thường, chỉ xóa sản phẩm này.
                  </div>
                </div>
              </div>

              <p className="admin-pricebook-warning-help-text">
                {removeFromPricebooks
                  ? "✅ Sản phẩm sẽ được tự động xóa khỏi các bảng giá trước khi thay đổi trạng thái."
                  : "⚠️ Nếu không chọn tùy chọn trên, bạn sẽ cần xóa sản phẩm khỏi các bảng giá thủ công trước khi inactive."}
              </p>
            </div>

            <div className="admin-pricebook-warning-modal-footer">
              <button className="admin-pricebook-warning-cancel-btn" onClick={handleCancelPricebookWarning}>
                Hủy
              </button>
              <button className="admin-pricebook-warning-confirm-btn" onClick={handleConfirmPricebookWarning}>
                {removeFromPricebooks ? "Xác nhận và tiếp tục" : "Tiếp tục (không xóa)"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProductDetailModal;
