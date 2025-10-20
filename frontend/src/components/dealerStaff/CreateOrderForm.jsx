import React, { useEffect, useMemo, useState } from "react";
import productApiService from "../../services/productApi";
import "./CreateQuotationForm.css";

const CreateOrderForm = ({
  onClose,
  onSave,
  selectedCustomer = null,
  onBackToList,
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  const [formData, setFormData] = useState({
    customer: {
      name: "",
      phone: "",
      email: "",
      address: "",
      idNumber: "",
      id: "",
    },
    vehicle: {
      model: "",
      version: "",
      color: "",
      price: 0,
    },
    order: {
      notes: "",
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedCustomer) {
      setFormData((prev) => ({
        ...prev,
        customer: {
          name: String(
            selectedCustomer.fullName || selectedCustomer.name || ""
          ),
          phone: String(selectedCustomer.phone || ""),
          email: String(selectedCustomer.email || ""),
          address: String(selectedCustomer.address || ""),
          idNumber: String(selectedCustomer.idNumber || ""),
          id: String(selectedCustomer.id || selectedCustomer.customerId || ""),
        },
      }));
    }
  }, [selectedCustomer]);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductLoading(true);
        console.log("🔄 Loading products from API...");
        const response = await productApiService.getAllProducts();
        console.log("📋 Products API Response:", response);

        if (response && response.data) {
          setProducts(response.data);
          console.log("✅ Products loaded successfully:", response.data.length);
          console.log("📋 Sample product data:", response.data[0]);
        } else {
          console.warn("⚠️ No products data in response");
          console.log("📋 Full response:", response);
          setProducts([]);
        }
      } catch (error) {
        console.error("❌ Error loading products:", error);
        setProducts([]);
      } finally {
        setProductLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Process real product data from API
  const vehicleData = useMemo(() => {
    if (!products || products.length === 0) return {};

    const processedData = {};

    products.forEach((product) => {
      const modelKey = product.modelCode || "Unknown Model";

      if (!processedData[modelKey]) {
        processedData[modelKey] = {
          name: modelKey,
          versions: [],
          colors: [],
        };
      }

      // Add version if not exists
      const versionExists = processedData[modelKey].versions.find(
        (v) => v.name === product.variantCode
      );
      if (!versionExists && product.variantCode) {
        processedData[modelKey].versions.push({
          name: product.variantCode,
          price: 0, // Sẽ cần lấy giá từ pricebook riêng
        });
      }

      // Add color if not exists
      const colorExists = processedData[modelKey].colors.find(
        (c) => c.name === product.colorName
      );
      if (!colorExists && product.colorName) {
        processedData[modelKey].colors.push({
          name: product.colorName,
          hex: product.colorCode || "#808080",
        });
      }
    });

    return processedData;
  }, [products]);

  const handleVehicleModelSelect = (modelName) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        model: modelName,
        version: "",
        color: "",
        price: 0,
      },
    }));
  };

  const handleVehicleVersionSelect = (versionName) => {
    const selectedModel = vehicleData[formData.vehicle.model];
    const selectedVersion = selectedModel?.versions.find(
      (v) => v.name === versionName
    );
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        version: versionName,
        color: "",
        price: selectedVersion?.price || 0,
      },
    }));
  };

  const handleVehicleColorSelect = (colorName) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, color: colorName },
    }));
  };

  // Try resolve product by model/version from products list
  const resolvedProduct = useMemo(() => {
    if (!Array.isArray(products) || !formData.vehicle.model) return null;
    const normalize = (s) =>
      String(s || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const modelName = formData.vehicle.model; // e.g. "VinFast VF9"
    const versionName = formData.vehicle.version; // e.g. "VF9 Premium"

    // Extract model code like VF9, VF8...
    const modelCodeMatch = modelName.match(/vf\s*\d+/i);
    const modelCode = modelCodeMatch
      ? modelCodeMatch[0].replace(/\s+/g, "").toUpperCase()
      : modelName.replace(/\s+/g, "").toUpperCase();

    // Extract variant by removing model code from version string
    let variantCandidate = versionName || ""; // e.g. "VF9 Premium"
    variantCandidate = variantCandidate
      .replace(new RegExp(modelCode, "i"), "")
      .trim();
    if (!variantCandidate) {
      // Fallback: take last word
      const parts = (versionName || "").split(" ");
      variantCandidate = parts.slice(1).join(" ") || parts[0] || "";
    }

    const normVariant = normalize(variantCandidate); // "premium"
    const normModel = normalize(modelCode); // "vf9"

    // Strategy: exact match on ModelCode + VariantCode; fallback to name includes
    const byCodes = products.find(
      (p) =>
        normalize(p.modelCode) === normModel &&
        normalize(p.variantCode) === normVariant
    );
    if (byCodes) return byCodes;

    const byName = products.find(
      (p) =>
        normalize(p.name).includes(normalize(versionName)) ||
        normalize(p.name).includes(normModel + " " + normVariant)
    );
    return byName || null;
  }, [products, formData.vehicle.model, formData.vehicle.version]);

  const unitPrice = useMemo(() => {
    if (formData.vehicle.price) return Number(formData.vehicle.price);
    if (!resolvedProduct) return 0;
    return Number(
      resolvedProduct.msrpPrice ||
        resolvedProduct.price ||
        resolvedProduct.basePrice ||
        0
    );
  }, [formData.vehicle.price, resolvedProduct]);

  const calculateFinalPrice = () => {
    const basePrice = formData.vehicle.price || unitPrice;
    const vat = basePrice * 0.1;
    return basePrice + vat;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount) || 0);
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer.id) newErrors["customer.id"] = "Thiếu mã khách hàng";
    if (!formData.customer.name.trim())
      newErrors["customer.name"] = "Tên khách hàng là bắt buộc";
    if (!formData.customer.phone.trim())
      newErrors["customer.phone"] = "Số điện thoại là bắt buộc";
    if (!formData.vehicle.model)
      newErrors["vehicle.model"] = "Vui lòng chọn mẫu xe";
    if (!formData.vehicle.version)
      newErrors["vehicle.version"] = "Vui lòng chọn phiên bản";
    if (!formData.vehicle.color)
      newErrors["vehicle.color"] = "Vui lòng chọn màu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const newOrder = {
      id: `DH${Date.now()}`,
      customer: {
        name: formData.customer.name,
        phone: formData.customer.phone,
      },
      vehicle: {
        name: `${formData.vehicle.model} ${formData.vehicle.version}`.trim(),
        color: formData.vehicle.color,
      },
      amount: calculateFinalPrice(),
      status: "Draft",
      statusType: "draft",
      date: dateStr,
    };
    // API disabled: directly update UI list
    if (onSave) onSave(newOrder);
  };

  return (
    <div className="create-quotation-form">
      <div className="form-wrapper">
        <div className="form-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Tạo đơn hàng mới</h1>
              <p>Tạo đơn hàng trực tiếp cho khách hàng</p>
            </div>
          </div>
        </div>

        <div className="back-button-container">
          <button type="button" className="back-btn" onClick={onBackToList}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Quay lại
          </button>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="quotation-form">
            <div className="form-content">
              <div className="form-left">
                <div className="form-sections">
                  <div className="form-section">
                    <h3>Thông tin khách hàng</h3>
                    <div className="customer-form-layout">
                      <div className="customer-row">
                        <div className="form-group">
                          <label>Họ và tên *</label>
                          <input
                            type="text"
                            value={formData.customer.name}
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                "name",
                                e.target.value
                              )
                            }
                            className={errors["customer.name"] ? "error" : ""}
                          />
                          {errors["customer.name"] && (
                            <span className="error-message">
                              {errors["customer.name"]}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Số điện thoại *</label>
                          <input
                            type="tel"
                            value={formData.customer.phone}
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                "phone",
                                e.target.value
                              )
                            }
                            className={errors["customer.phone"] ? "error" : ""}
                          />
                          {errors["customer.phone"] && (
                            <span className="error-message">
                              {errors["customer.phone"]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="customer-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={formData.customer.email}
                            onChange={(e) =>
                              handleInputChange(
                                "customer",
                                "email",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chọn xe */}
                  <div className="form-section">
                    <h3>Chọn xe</h3>
                    <div className="vehicle-selection">
                      <div className="form-group">
                        <label>Mẫu xe *</label>
                        <select
                          value={formData.vehicle.model}
                          onChange={(e) =>
                            handleVehicleModelSelect(e.target.value)
                          }
                          className={errors["vehicle.model"] ? "error" : ""}
                          disabled={productLoading}
                        >
                          <option value="">
                            {productLoading
                              ? "-- Đang tải dữ liệu --"
                              : "-- Chọn mẫu xe --"}
                          </option>
                          {Object.keys(vehicleData).map((modelName) => (
                            <option key={modelName} value={modelName}>
                              {modelName}
                            </option>
                          ))}
                        </select>
                        {errors["vehicle.model"] && (
                          <span className="error-message">
                            {errors["vehicle.model"]}
                          </span>
                        )}
                      </div>

                      {formData.vehicle.model && (
                        <div className="form-group">
                          <label>Phiên bản *</label>
                          <select
                            value={formData.vehicle.version}
                            onChange={(e) =>
                              handleVehicleVersionSelect(e.target.value)
                            }
                            className={errors["vehicle.version"] ? "error" : ""}
                          >
                            <option value="">-- Chọn phiên bản --</option>
                            {vehicleData[formData.vehicle.model]?.versions.map(
                              (v) => (
                                <option key={v.name} value={v.name}>
                                  {v.name}
                                </option>
                              )
                            )}
                          </select>
                          {errors["vehicle.version"] && (
                            <span className="error-message">
                              {errors["vehicle.version"]}
                            </span>
                          )}
                        </div>
                      )}

                      {formData.vehicle.version && (
                        <div className="form-group">
                          <label>Màu sắc *</label>
                          <div className="color-options">
                            {vehicleData[formData.vehicle.model]?.colors.map(
                              (color) => (
                                <label
                                  key={color.name}
                                  className={`color-option ${
                                    formData.vehicle.color === color.name
                                      ? "selected"
                                      : ""
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="vehicle-color"
                                    value={color.name}
                                    checked={
                                      formData.vehicle.color === color.name
                                    }
                                    onChange={(e) =>
                                      handleVehicleColorSelect(e.target.value)
                                    }
                                    className="color-radio"
                                  />
                                  <div className="color-content">
                                    <div
                                      className="color-swatch"
                                      style={{ backgroundColor: color.hex }}
                                    >
                                      <div className="color-check">
                                        {formData.vehicle.color ===
                                          color.name && (
                                          <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="white"
                                          >
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <div className="color-info">
                                      <span className="color-name">
                                        {color.name}
                                      </span>
                                      <span className="color-price">
                                        Miễn phí
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              )
                            )}
                          </div>
                          {errors["vehicle.color"] && (
                            <span className="error-message">
                              {errors["vehicle.color"]}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Ghi chú tích hợp trong form chọn xe */}
                      <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea
                          rows="3"
                          value={formData.order.notes}
                          onChange={(e) =>
                            handleInputChange("order", "notes", e.target.value)
                          }
                          placeholder="Ghi chú cho đơn hàng..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-right">
                <div className="price-summary-card">
                  <h3>Tóm tắt đơn hàng</h3>
                  <div className="price-breakdown">
                    {formData.vehicle.model && (
                      <div className="price-row">
                        <span>Mẫu xe:</span>
                        <span>{formData.vehicle.model}</span>
                      </div>
                    )}
                    {formData.vehicle.version && (
                      <div className="price-row">
                        <span>Phiên bản:</span>
                        <span>{formData.vehicle.version}</span>
                      </div>
                    )}
                    {formData.vehicle.color && (
                      <div className="price-row">
                        <span>Màu sắc:</span>
                        <span>{formData.vehicle.color}</span>
                      </div>
                    )}
                    <div className="price-row">
                      <span>Giá cơ bản:</span>
                      <span>
                        {formatCurrency(formData.vehicle.price || unitPrice)}
                      </span>
                    </div>
                    <div className="price-row">
                      <span>Giảm giá:</span>
                      <span>
                        {formatCurrency(
                          formData.vehicle.oemDiscountAmount || 0
                        )}
                      </span>
                    </div>
                    <div className="price-divider"></div>
                    <div className="price-row total">
                      <span>Thành tiền:</span>
                      <span className="final-price">
                        {formatCurrency(calculateFinalPrice())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button type="submit" className="save-btn" disabled={loading}>
                Tạo đơn hàng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderForm;
