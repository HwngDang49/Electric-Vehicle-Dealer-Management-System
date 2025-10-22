import React, { useState } from "react";
import "./CreateProductModal.css";
import productApi from "../../services/productApi";
import CustomDropdown from "./CustomDropdown";

const CreateProductModal = ({ onClose, onSuccess }) => {
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
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = [
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" },
    { value: "Discontinued", label: "Ngừng kinh doanh", icon: "🚫" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.modelCode.trim()) errors.modelCode = "ModelCode là bắt buộc";
    if (!formData.name.trim()) errors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.variantCode.trim()) errors.variantCode = "VariantCode là bắt buộc";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const toNumberOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    try {
      const payload = {
        ModelCode: formData.modelCode.trim(),
        Name: formData.name.trim(),
        VariantCode: formData.variantCode.trim(),
        ColorCode: formData.colorCode?.trim() || null,
        ColorName: formData.colorName?.trim() || null,
        BatteryKwh: toNumberOrNull(formData.batteryKwh),
        MotorKw: toNumberOrNull(formData.motorKw),
        RangeKm: formData.rangeKm === "" ? null : parseInt(formData.rangeKm, 10),
        Status: formData.status,
      };

      const res = await productApi.createProduct(payload);
      console.log("Product created:", res);
      onSuccess?.();
    } catch (err) {
      console.error("Create product error", err);
      setError(
        err?.response?.data?.message || err?.message || "Không thể tạo sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose?.();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo Sản phẩm Mới</h2>
          <button className="close-btn" onClick={handleClose} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="modelCode">Model Code *</label>
            <input
              type="text"
              id="modelCode"
              name="modelCode"
              value={formData.modelCode}
              onChange={handleInputChange}
              placeholder="VD: VF e34"
              className={validationErrors.modelCode ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.modelCode && (
              <span className="error-text">{validationErrors.modelCode}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Tên sản phẩm *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="VD: VF e34 Base"
              className={validationErrors.name ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="variantCode">Variant Code *</label>
            <input
              type="text"
              id="variantCode"
              name="variantCode"
              value={formData.variantCode}
              onChange={handleInputChange}
              placeholder="VD: Base / Plus"
              className={validationErrors.variantCode ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.variantCode && (
              <span className="error-text">{validationErrors.variantCode}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="colorCode">Mã màu</label>
            <input
              type="text"
              id="colorCode"
              name="colorCode"
              value={formData.colorCode}
              onChange={handleInputChange}
              placeholder="VD: WHT, BLK"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="colorName">Tên màu</label>
            <input
              type="text"
              id="colorName"
              name="colorName"
              value={formData.colorName}
              onChange={handleInputChange}
              placeholder="VD: Trắng / Đen"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="batteryKwh">Battery kWh</label>
            <input
              type="number"
              step="0.1"
              id="batteryKwh"
              name="batteryKwh"
              value={formData.batteryKwh}
              onChange={handleInputChange}
              placeholder="VD: 42"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="motorKw">Motor kW</label>
            <input
              type="number"
              step="0.1"
              id="motorKw"
              name="motorKw"
              value={formData.motorKw}
              onChange={handleInputChange}
              placeholder="VD: 110"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rangeKm">Range (km)</label>
            <input
              type="number"
              id="rangeKm"
              name="rangeKm"
              value={formData.rangeKm}
              onChange={handleInputChange}
              placeholder="VD: 285"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng thái *</label>
            <CustomDropdown
              value={formData.status}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, status: val }));
                if (validationErrors.status) {
                  setValidationErrors(prev => ({ ...prev, status: "" }));
                }
              }}
              options={statusOptions}
              minWidth="100%"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Đang tạo...
                </>
              ) : (
                "Tạo Sản phẩm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;


