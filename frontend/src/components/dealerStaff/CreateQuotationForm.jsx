import React, { useState, useEffect, useMemo } from "react";
import productApiService from "../../services/productApi";
import pricebookApiService from "../../services/pricebookApi";
import CustomDropdown from "./CustomDropdown";
import "./CreateQuotationForm.css";

const CreateQuotationForm = ({
  onClose,
  onSave,
  selectedCustomer = null,
  onBackToList,
}) => {
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [activePricebook, setActivePricebook] = useState(null);

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
      year: "",
      price: 0,
    },
    quotation: {
      validUntil: "",
    },
  });

  // Update customer data when selectedCustomer changes
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
        // Don't auto-fill vehicle data - let user choose
        vehicle: {
          model: "",
          version: "",
          color: "",
          year: "",
          price: 0,
        },
        quotation: {
          notes: "",
          validUntil: "",
        },
      }));
        selectedCustomer,
        mappedCustomer: {
          name: String(
            selectedCustomer.fullName || selectedCustomer.name || ""
          ),
          phone: String(selectedCustomer.phone || ""),
          email: String(selectedCustomer.email || ""),
          address: String(selectedCustomer.address || ""),
          idNumber: String(selectedCustomer.idNumber || ""),
          id: String(selectedCustomer.id || selectedCustomer.customerId || ""),
        },
      });
    }
  }, [selectedCustomer]);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductLoading(true);
        const response = await productApiService.getAllProducts();

        if (response && response.data) {
          setProducts(response.data);
          
        } else {
          console.warn("⚠️ No products data in response");
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

  // Load active pricebook for base prices
  useEffect(() => {
    const loadActivePricebook = async () => {
      try {
        const res = await pricebookApiService.getActivePricebook();
        setActivePricebook(res?.data || null);
      } catch (e) {
        console.warn("⚠️ Không tải được active pricebook", e);
        setActivePricebook(null);
      }
    };
    loadActivePricebook();
  }, []);

  const [errors, setErrors] = useState({});

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
          price: 0, // default; will enrich from pricebook below
          productId: product.productId,
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

    // Enrich prices from active pricebook if available
    if (activePricebook) {
      const items =
        activePricebook.items ||
        activePricebook.pricebookItems ||
        activePricebook.PricebookItems ||
        activePricebook.Items ||
        [];

      if (Array.isArray(items)) {
        const priceMap = new Map();
        const mvMap = new Map();
        items.forEach((it) => {
          const pid = Number(it.productId ?? it.ProductId);
          const price = Number(
            it.msrpPrice ??
              it.MsrpPrice ??
              it.msrp_price ??
              it.floorPrice ??
              it.FloorPrice ??
              0
          );
          if (!Number.isNaN(pid)) priceMap.set(pid, price);
          const model = String(
            it.modelCode ?? it.ModelCode ?? ""
          ).toUpperCase();
          const variant = String(
            it.variantCode ?? it.VariantCode ?? ""
          ).toUpperCase();
          if (model && variant) mvMap.set(`${model}|${variant}`, price);
        });

        Object.keys(processedData).forEach((modelKey) => {
          const normModel = String(modelKey).toUpperCase();
          processedData[modelKey].versions = processedData[
            modelKey
          ].versions.map((v) => {
            const byPid = priceMap.get(Number(v.productId));
            const key = `${normModel}|${String(v.name).toUpperCase()}`;
            const byMv = mvMap.get(key);
            return {
              ...v,
              price: byPid ?? byMv ?? v.price ?? 0,
            };
          });
        });
      }
    }

    return processedData;
  }, [products, activePricebook]);

  // Build price map by productId from active pricebook
  const priceByProductId = useMemo(() => {
    const map = new Map();
    if (!activePricebook) return map;
    const items =
      activePricebook.items ||
      activePricebook.pricebookItems ||
      activePricebook.PricebookItems ||
      activePricebook.Items ||
      [];
    items.forEach((it) => {
      const pid = Number(it.productId ?? it.ProductId);
      const price = Number(
        it.msrpPrice ??
          it.MsrpPrice ??
          it.msrp_price ??
          it.floorPrice ??
          it.FloorPrice ??
          0
      );
      if (!Number.isNaN(pid)) map.set(pid, price);
    });
    return map;
  }, [activePricebook]);

  const getMatchingProductId = (modelName, versionName, colorName) => {
    if (!Array.isArray(products)) return null;
    const norm = (s) =>
      String(s || "")
        .toUpperCase()
        .trim();
    const model = norm(modelName);
    const variant = norm(versionName);
    const color = norm(colorName);
    const matched = products.find((p) => {
      if (norm(p.modelCode) !== model) return false;
      if (norm(p.variantCode) !== variant) return false;
      if (color)
        return norm(p.colorName) === color || norm(p.colorCode) === color;
      return true;
    });
    return matched?.productId ?? null;
  };

  const updatePriceFromSelection = (modelName, versionName, colorName) => {
    const pid = getMatchingProductId(modelName, versionName, colorName);
    const priceFromPid = pid
      ? Number(priceByProductId.get(Number(pid)) ?? 0)
      : 0;

    // Fallback by model+variant if productId not matched
    if (priceFromPid > 0) return priceFromPid;

    const norm = (s) =>
      String(s || "")
        .toUpperCase()
        .trim();
    const model = norm(modelName);
    const variant = norm(versionName);
    // Try find in active pricebook items by model/variant
    const items =
      activePricebook?.items ||
      activePricebook?.pricebookItems ||
      activePricebook?.Items ||
      activePricebook?.PricebookItems ||
      [];
    const hit = Array.isArray(items)
      ? items.find(
          (it) =>
            norm(it.modelCode ?? it.ModelCode) === model &&
            norm(it.variantCode ?? it.VariantCode) === variant
        )
      : null;
    const fallbackPrice = Number(
      hit?.msrpPrice ??
        hit?.MsrpPrice ??
        hit?.msrp_price ??
        hit?.floorPrice ??
        hit?.FloorPrice ??
        0
    );
    return fallbackPrice;
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  const handleVehicleModelSelect = (modelName) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        model: modelName,
        version: "", // Reset version when model changes
        color: "", // Reset color when model changes
        price: 0,
      },
    }));
  };

  const handleVehicleVersionSelect = (versionName) => {
    const selectedModel = vehicleData[formData.vehicle.model];
    const selectedVersion = selectedModel?.versions.find(
      (v) => v.name === versionName
    );

    
      "CreateQuotationForm - Selected version data:",
      selectedVersion
    );
    

    // Get OemDiscountAmount from active pricebook
    let oemDiscountAmount = 0;
    if (activePricebook && selectedVersion?.productId) {
      const items =
        activePricebook.items ||
        activePricebook.pricebookItems ||
        activePricebook.PricebookItems ||
        activePricebook.Items ||
        [];
      const matchingItem = items.find(
        (item) =>
          Number(item.productId ?? item.ProductId) ===
          Number(selectedVersion.productId)
      );
      if (matchingItem) {
        oemDiscountAmount = Number(
          matchingItem.oemDiscountAmount ?? matchingItem.OemDiscountAmount ?? 0
        );
      }
    }

    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        version: versionName,
        color: "", // Reset color when version changes
        price: updatePriceFromSelection(
          formData.vehicle.model,
          versionName,
          ""
        ),
        productId: selectedVersion?.productId,
        oemDiscountAmount: oemDiscountAmount,
      },
    }));
  };

  const handleVehicleColorSelect = (colorName) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        color: colorName,
        price: updatePriceFromSelection(
          prev.vehicle.model,
          prev.vehicle.version,
          colorName
        ),
      },
    }));
  };

  const calculateFinalPrice = () => {
    const basePrice = formData.vehicle.price;
    const discount = formData.vehicle.oemDiscountAmount || 0;
    return basePrice - discount;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate customer info
    if (!formData.customer.name.trim()) {
      newErrors["customer.name"] = "Tên khách hàng là bắt buộc";
    }
    if (!formData.customer.phone.trim()) {
      newErrors["customer.phone"] = "Số điện thoại là bắt buộc";
    }

    // Validate vehicle info
    if (!formData.vehicle.model.trim()) {
      newErrors["vehicle.model"] = "Vui lòng chọn mẫu xe";
    }
    if (!formData.vehicle.version.trim()) {
      newErrors["vehicle.version"] = "Vui lòng chọn phiên bản xe";
    }
    if (!formData.vehicle.color.trim()) {
      newErrors["vehicle.color"] = "Vui lòng chọn màu xe";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const finalPrice = calculateFinalPrice();
      
        "CreateQuotationForm - Vehicle price:",
        formData.vehicle.price
      );
        "CreateQuotationForm - Vehicle version:",
        formData.vehicle.version
      );
      

      const quotationData = {
        id: `BG${Date.now()}`,
        customer: formData.customer,
        vehicle: formData.vehicle,
        quotation: {
          ...formData.quotation,
          finalPrice: finalPrice,
          basePrice: formData.vehicle.price,
        },
        status: "Đang soạn",
        createdAt: new Date().toISOString().split("T")[0],
      };

      
        quotation: quotationData.quotation,
        vehicle: quotationData.vehicle,
        finalPrice: quotationData.quotation?.finalPrice,
        vehiclePrice: quotationData.vehicle?.price,
      });
      onSave(quotationData);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="quotation-modal-overlay" onClick={onClose}>
      <div className="quotation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo báo giá mới</h2>
          <button className="close-btn" onClick={onClose} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-content">
            <div className="form-left">
              {/* Customer Information */}
              <div className="form-section">
                <h3>Thông tin khách hàng</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customer-name">Họ và tên *</label>
                    <input
                      type="text"
                      id="customer-name"
                      value={formData.customer.name}
                      onChange={(e) =>
                        handleInputChange(
                          "customer",
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Nhập họ và tên"
                      className={errors["customer.name"] ? "error" : ""}
                    />
                    {errors["customer.name"] && (
                      <span className="error-text">
                        {errors["customer.name"]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-phone">Số điện thoại *</label>
                    <input
                      type="tel"
                      id="customer-phone"
                      value={formData.customer.phone}
                      onChange={(e) =>
                        handleInputChange(
                          "customer",
                          "phone",
                          e.target.value
                        )
                      }
                      placeholder="Nhập số điện thoại"
                      className={errors["customer.phone"] ? "error" : ""}
                    />
                    {errors["customer.phone"] && (
                      <span className="error-text">
                        {errors["customer.phone"]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="customer-email">Email</label>
                  <input
                    type="email"
                    id="customer-email"
                    value={formData.customer.email}
                    onChange={(e) =>
                      handleInputChange(
                        "customer",
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="form-section">
                <h3>Chọn xe</h3>
                
                {/* Vehicle Model & Version - Same Row */}
                <div className="form-row-inline">
                  {/* Step 1: Select Vehicle Model */}
                  <div className="form-group">
                    <label htmlFor="vehicle-model">Mẫu xe *</label>
                    <CustomDropdown
                      value={formData.vehicle.model}
                      onChange={handleVehicleModelSelect}
                      options={[
                        { value: "", label: productLoading ? "Đang tải dữ liệu..." : "-- Chọn mẫu xe --", icon: "🚗" },
                        ...Object.keys(vehicleData).map((modelName) => ({
                          value: modelName,
                          label: modelName,
                          icon: "🚗"
                        }))
                      ]}
                      placeholder="-- Chọn mẫu xe --"
                      icon="🚗"
                      disabled={productLoading}
                    />
                    {errors["vehicle.model"] && (
                      <span className="error-text">
                        {errors["vehicle.model"]}
                      </span>
                    )}
                  </div>

                  {/* Step 2: Select Vehicle Version */}
                  <div className="form-group">
                    <label htmlFor="vehicle-version">Phiên bản *</label>
                    <CustomDropdown
                      value={formData.vehicle.version}
                      onChange={handleVehicleVersionSelect}
                      options={[
                        { value: "", label: formData.vehicle.model ? "-- Chọn phiên bản --" : "Chọn mẫu xe trước", icon: "⚙️" },
                        ...(vehicleData[formData.vehicle.model]?.versions || []).map(
                          (version) => ({
                            value: version.name,
                            label: version.name,
                            icon: "⚙️"
                          })
                        )
                      ]}
                      placeholder="-- Chọn phiên bản --"
                      icon="⚙️"
                      disabled={!formData.vehicle.model}
                    />
                    {errors["vehicle.version"] && (
                      <span className="error-text">
                        {errors["vehicle.version"]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 3: Select Vehicle Color */}
                {formData.vehicle.version && (
                  <div className="form-group">
                    <label htmlFor="vehicle-color">Màu sắc *</label>
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
                      <span className="error-text">
                        {errors["vehicle.color"]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="form-right">
              <div className="price-summary-card">
                <h3>Tóm tắt báo giá</h3>
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
                    <span>{formatCurrency(formData.vehicle.price)}</span>
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

          <div className="quotation-modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
              </svg>
              Tạo báo giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuotationForm;
