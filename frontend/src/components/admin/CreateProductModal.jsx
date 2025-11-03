import React, { useState } from "react";
import "./CreateProductModal.css";
import productApi from "../../services/productApi";
import CustomDropdown from "./CustomDropdown";

const CreateProductModal = ({ onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    modelCode: "",
    name: "",
    variantCode: "",
    colorCode: "",
    colorName: "",
    batteryKwh: "",
    motorKw: "",
    rangeKm: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Active", label: "Hoạt động", class: "status-active", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", class: "status-inactive", icon: "⏸️" },
    { value: "Discontinued", label: "Ngừng sản xuất", class: "status-discontinued", icon: "🚫" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.modelCode.trim()) {
      newErrors.modelCode = "Mã model là bắt buộc";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!formData.variantCode.trim()) {
      newErrors.variantCode = "Mã variant là bắt buộc";
    }
    
    if (formData.batteryKwh && isNaN(parseFloat(formData.batteryKwh))) {
      newErrors.batteryKwh = "Dung lượng pin phải là số";
    }
    
    if (formData.motorKw && isNaN(parseFloat(formData.motorKw))) {
      newErrors.motorKw = "Công suất motor phải là số";
    }
    
    if (formData.rangeKm && isNaN(parseInt(formData.rangeKm))) {
      newErrors.rangeKm = "Tầm hoạt động phải là số";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ModelCode: formData.modelCode.trim(),
        Name: formData.name.trim(),
        VariantCode: formData.variantCode.trim(),
        ColorCode: formData.colorCode?.trim() || null,
        ColorName: formData.colorName?.trim() || null,
        BatteryKwh: formData.batteryKwh ? parseFloat(formData.batteryKwh) : null,
        MotorKw: formData.motorKw ? parseFloat(formData.motorKw) : null,
        RangeKm: formData.rangeKm ? parseInt(formData.rangeKm, 10) : null,
        Status: formData.status,
      };
      
      await productApi.createProduct(payload);
      
      // Close modal immediately, toast will be shown in ProductCatalog
      onSuccess(formData.name);
    } catch (error) {
      console.error("Error creating product:", error);
      const errorMessage = 
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo sản phẩm. Vui lòng thử lại.";
      setErrors({ submit: errorMessage });
      // Show error toast locally and also notify parent
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-product-app">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Tạo Sản Phẩm Mới</h2>
            <button className="close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modelCode">Mã Model *</label>
                <input
                  type="text"
                  id="modelCode"
                  name="modelCode"
                  value={formData.modelCode}
                  onChange={handleInputChange}
                  placeholder="VD: VF-7"
                  className={errors.modelCode ? "error" : ""}
                />
                {errors.modelCode && <span className="error-text">{errors.modelCode}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="variantCode">Mã Variant *</label>
                <input
                  type="text"
                  id="variantCode"
                  name="variantCode"
                  value={formData.variantCode}
                  onChange={handleInputChange}
                  placeholder="VD: Base / Plus"
                  className={errors.variantCode ? "error" : ""}
                />
                {errors.variantCode && <span className="error-text">{errors.variantCode}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Tên Sản Phẩm *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: VF 7 Base - Đen"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="colorCode">Mã Màu</label>
                <input
                  type="text"
                  id="colorCode"
                  name="colorCode"
                  value={formData.colorCode}
                  onChange={handleInputChange}
                  placeholder="VD: BLACK"
                />
              </div>

              <div className="form-group">
                <label htmlFor="colorName">Tên Màu</label>
                <input
                  type="text"
                  id="colorName"
                  name="colorName"
                  value={formData.colorName}
                  onChange={handleInputChange}
                  placeholder="VD: Đen"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="batteryKwh">Dung Lượng Pin (kWh)</label>
                <input
                  type="number"
                  id="batteryKwh"
                  name="batteryKwh"
                  value={formData.batteryKwh}
                  onChange={handleInputChange}
                  placeholder="VD: 42"
                  min="0"
                  step="0.1"
                  className={errors.batteryKwh ? "error" : ""}
                />
                {errors.batteryKwh && <span className="error-text">{errors.batteryKwh}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="motorKw">Công Suất Motor (kW)</label>
                <input
                  type="number"
                  id="motorKw"
                  name="motorKw"
                  value={formData.motorKw}
                  onChange={handleInputChange}
                  placeholder="VD: 110"
                  min="0"
                  step="0.1"
                  className={errors.motorKw ? "error" : ""}
                />
                {errors.motorKw && <span className="error-text">{errors.motorKw}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rangeKm">Tầm Hoạt Động (km)</label>
                <input
                  type="number"
                  id="rangeKm"
                  name="rangeKm"
                  value={formData.rangeKm}
                  onChange={handleInputChange}
                  placeholder="VD: 285"
                  min="0"
                  step="1"
                  className={errors.rangeKm ? "error" : ""}
                />
                {errors.rangeKm && <span className="error-text">{errors.rangeKm}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="status">Trạng Thái *</label>
                <CustomDropdown
                  value={formData.status}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, status: val }));
                    if (errors.status) {
                      setErrors(prev => ({ ...prev, status: "" }));
                    }
                  }}
                  options={statusOptions}
                  minWidth="100%"
                  compact={true}
                />
              </div>
            </div>

            {errors.submit && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {errors.submit}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo Sản Phẩm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;
