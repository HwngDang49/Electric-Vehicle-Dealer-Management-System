import React, { useState, useEffect } from "react";
import productsWithPricingApiService from "../../services/productsWithPricingApi";
import branchApiService from "../../services/branchApi";
import authService from "../../services/AuthService";
import CustomDropdown from "../admin/CustomDropdown";
import { useProductImageMapping } from "../../utils/productImageUtils";
import "./CreatePOForm.css";

const CreatePOForm = ({
  onClose,
  onSubmit,
  initialBranchCode,
  initialItems,
}) => {
  const [formData, setFormData] = useState({
    branchName: "",
    contactPerson: "",
    deliveryAddress: "",
    deliveryDate: "",
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [productsWithPricing, setProductsWithPricing] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use dynamic image mapping hook (shared utility, no hard-coding)
  const getProductImagePath = useProductImageMapping();

  // Load products and current user on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set contact person from JWT token
        const token = authService.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userName =
              payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
              ] ||
              payload["name"] ||
              payload["fullName"] ||
              payload["FullName"] ||
              payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
              ] ||
              payload["email"] ||
              "Manager";

            if (userName) {
              setFormData((prev) => ({
                ...prev,
                contactPerson: userName,
              }));
            }
          } catch {
            // Silently fail if JWT decode fails
          }
        }

        const response =
          await productsWithPricingApiService.getAllProductsWithPricing();
        setProductsWithPricing(response.products);

        const branchesResponse = await branchApiService.getBranches();
        setBranches(branchesResponse.data || []);

        // Pre-fill form if initial data is provided (from backordered order)
        if (initialBranchCode) {
          setFormData((prev) => ({
            ...prev,
            branchName: initialBranchCode,
          }));

          // Find branch and set address
          const branch = branchesResponse.data?.find(
            (b) => (b.code || b.name) === initialBranchCode
          );
          if (branch) {
            setFormData((prev) => ({
              ...prev,
              branchName: initialBranchCode,
              deliveryAddress: branch.address || "",
            }));
          }
        }

        // Pre-fill selected items if provided
        if (initialItems && initialItems.length > 0) {
          // Map initial items to full product objects from products API
          const productsMap = response.products.reduce((acc, product) => {
            acc[product.productId] = product;
            return acc;
          }, {});

          const prefillItems = initialItems.map((item) => {
            const fullProduct = productsMap[item.productId];
            if (fullProduct) {
              return {
                ...fullProduct,
                quantity: item.quantity,
                price: item.floorPrice || fullProduct.effectivePrice,
              };
            }
            // Fallback if product not found in API
            return {
              productId: item.productId,
              name: item.name || `Product ${item.productId}`,
              floorPrice: item.floorPrice || 0,
              effectivePrice: item.effectivePrice || item.floorPrice || 0,
              quantity: item.quantity,
              price: item.floorPrice || 0,
            };
          });

          setSelectedItems(prefillItems);
        }
      } catch {
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialBranchCode, initialItems]); // Re-run if initial data changes

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle branch selection from dropdown
  const handleBranchSelection = (branchId) => {
    const selectedBranch = branches.find(
      (branch) => branch.branchId === parseInt(branchId)
    );
    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branchName: selectedBranch.code || selectedBranch.name,
        deliveryAddress: selectedBranch.address || "",
      }));
    }
  };

  const addToOrder = (product) => {
    const existingItem = selectedItems.find(
      (item) => item.productId === product.productId
    );
    if (existingItem) {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          ...product,
          quantity: 1,
          price: product.effectivePrice, // Use effective price for calculations
        },
      ]);
    }
  };

  const removeFromOrder = (productId) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromOrder(productId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      // Use floorPrice for calculation (not price or effectivePrice)
      const price = item.floorPrice || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      ...formData,
      selectedItems: selectedItems,
      totalAmount: calculateTotal(),
      orderDate: new Date().toISOString().split("T")[0],
    };
    onSubmit(orderData);
  };

  return (
    <div className="create-po-form">
      {/* Header */}
      <div className="form-header">
        <button className="back-btn" onClick={onClose}>
          ←
        </button>
        <div className="header-content">
          <h1 className="form-title">Tạo đơn nhập hàng</h1>
          <p className="form-subtitle">Tạo đơn hàng nhập xe từ hãng</p>
        </div>
      </div>

      <div className="form-content">
        {/* Left Column - Dealer Info & Vehicle Selection */}
        <div className="left-column">
          {/* Dealer Information */}
          <div className="dealer-info-section">
            <h2 className="section-title">Thông tin đại lý</h2>
            <p className="section-subtitle">Thông tin liên hệ và giao hàng</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Mã Chi nhánh</label>
                <CustomDropdown
                  value={
                    formData.branchName
                      ? branches
                          .find(
                            (b) => (b.code || b.name) === formData.branchName
                          )
                          ?.branchId?.toString() || ""
                      : ""
                  }
                  onChange={handleBranchSelection}
                  options={[
                    { value: "", label: "Chọn chi nhánh" },
                    ...branches.map((branch) => ({
                      value: branch.branchId?.toString() || "",
                      label: `${branch.code || branch.name} - ${
                        branch.name || branch.code
                      }`,
                    })),
                  ]}
                  minWidth="100%"
                  icon=""
                />
              </div>

              <div className="form-group">
                <label>Người liên hệ</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  readOnly
                  placeholder="Tự động lấy từ tài khoản hiện tại"
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group full-width">
                <label>Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    handleInputChange("deliveryAddress", e.target.value)
                  }
                  placeholder="Địa chỉ sẽ tự động điền khi nhập mã chi nhánh"
                  readOnly={formData.branchName ? true : false}
                  style={{
                    backgroundColor: formData.branchName ? "#f5f5f5" : "white",
                    cursor: formData.branchName ? "not-allowed" : "text",
                  }}
                />
              </div>

              <div className="form-group">
                <label>Ngày giao hàng mong muốn</label>
                <div className="date-input">
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      handleInputChange("deliveryDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="vehicle-selection-section">
            <h2 className="section-title">Danh mục xe có sẵn</h2>
            <p className="section-subtitle">Chọn xe cần nhập từ hãng</p>

            {loading && (
              <div className="loading-state">
                <p>Đang tải danh sách sản phẩm...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="vehicle-grid">
                {productsWithPricing.map((product) => {
                  const imagePath = getProductImagePath(product);
                  return (
                    <div key={product.productId} className="vehicle-card">
                      <div className="vehicle-image">
                        {imagePath ? (
                          <img
                            src={imagePath}
                            alt={product.name || `Model ${product.modelCode}`}
                            onError={(e) => {
                              // Hide image and show placeholder if image fails to load
                              e.target.style.display = "none";
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) {
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="vehicle-placeholder"
                          style={{ display: imagePath ? "none" : "flex" }}
                        >
                          <span className="vehicle-icon">🚗</span>
                        </div>
                      </div>
                      <div className="vehicle-info">
                        <h3 className="vehicle-name">{product.name}</h3>
                        <p className="vehicle-model">
                          Model:{" "}
                          {product.modelCode || `ID: ${product.productId}`}
                        </p>
                        <p className="vehicle-price">
                          {product.formattedPrice}
                        </p>
                        <button
                          className="add-to-order-btn"
                          onClick={() => addToOrder(product)}
                        >
                          + Thêm vào đơn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="right-column">
          <div className="order-summary">
            <div className="summary-header">
              <h2 className="section-title">🛒 Tóm tắt đơn hàng</h2>
            </div>

            <div className="selected-items">
              {selectedItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Chưa có xe nào được chọn</p>
                </div>
              ) : (
                selectedItems.map((item) => {
                  const itemImagePath = getProductImagePath(item);
                  return (
                    <div key={item.productId} className="selected-item">
                      <div className="item-image">
                        {itemImagePath ? (
                          <img
                            src={itemImagePath}
                            alt={item.name || `Model ${item.modelCode}`}
                            onError={(e) => {
                              // Hide image and show placeholder if image fails to load
                              e.target.style.display = "none";
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) {
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="vehicle-placeholder"
                          style={{ display: itemImagePath ? "none" : "flex" }}
                        >
                          <span className="vehicle-icon">🚗</span>
                        </div>
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-model">
                          {item.modelCode || `ID: ${item.productId}`}-2024
                        </p>
                        <p className="item-price">
                          {item.formattedPrice || formatPrice(item.price)}
                        </p>
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.productId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="quantity-input"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="quantity-btn"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromOrder(item.productId)}
                            className="remove-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedItems.length > 0 && (
              <>
                <div className="order-totals">
                  <div className="total-row">
                    <span>Tổng số lượng:</span>
                    <span>
                      {selectedItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      xe
                    </span>
                  </div>
                  <div className="total-row">
                    <span>Tổng tiền:</span>
                    <span className="total-amount">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                </div>
              </>
            )}

            <button
              className="create-order-btn"
              onClick={handleSubmit}
              disabled={selectedItems.length === 0}
            >
              Tạo đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePOForm;
