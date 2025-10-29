import React, { useState, useEffect } from "react";
import productsWithPricingApiService from "../../services/productsWithPricingApi";
import branchApiService from "../../services/branchApi";
import authService from "../../services/AuthService";
import CustomDropdown from "../admin/CustomDropdown";
import "./CreatePOForm.css";

const CreatePOForm = ({ onClose, onSubmit }) => {
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
            // Decode JWT token to get user info
            const payload = JSON.parse(atob(token.split(".")[1]));
            console.log("JWT Payload:", payload);

            // Try to get name from different possible claims
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

            console.log("Extracted userName from JWT:", userName);

            if (userName) {
              setFormData((prev) => ({
                ...prev,
                contactPerson: userName,
              }));
            }
          } catch (err) {
            console.warn("Could not decode JWT token:", err);
          }
        }

        // Load products with pricing
        console.log("🔄 Loading products with pricing...");
        const response =
          await productsWithPricingApiService.getAllProductsWithPricing();

        console.log("✅ Products loaded:", response.products.length);
        setProductsWithPricing(response.products);

        // Load branches
        console.log("🔄 Loading branches...");
        const branchesResponse = await branchApiService.getBranches();
        console.log("✅ Branches loaded:", branchesResponse.data?.length || 0);
        setBranches(branchesResponse.data || []);
      } catch (err) {
        console.error("❌ Error loading products:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

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

  // Handle branch code change and auto-fill delivery address (legacy for manual input)
  const handleBranchCodeChange = async (branchCode) => {
    // Update branch code
    setFormData((prev) => ({
      ...prev,
      branchName: branchCode,
    }));

    // Try to fetch branch address by code
    if (branchCode) {
      try {
        console.log(`🔄 Fetching branch with code: ${branchCode}...`);

        // Get all branches and find by code
        const branchesResponse = await branchApiService.getBranches();
        const branches =
          branchesResponse?.value ||
          branchesResponse?.data ||
          branchesResponse ||
          [];

        // Find branch by code (case-insensitive)
        const branch = branches.find(
          (b) => (b.code || b.Code)?.toLowerCase() === branchCode.toLowerCase()
        );

        console.log("Found branch:", branch);

        if (branch) {
          // Try both 'Address' (capital A) and 'address' (lowercase)
          const address = branch?.address || branch?.Address;

          if (address) {
            console.log(`✅ Branch address found: ${address}`);
            setFormData((prev) => ({
              ...prev,
              deliveryAddress: address,
            }));
          } else {
            console.log("⚠️ Branch found but no address available", branch);
          }
        } else {
          console.log("⚠️ Branch not found with code:", branchCode);
        }
      } catch (err) {
        console.error("❌ Error fetching branch address:", err);
        // Don't show error to user, just don't auto-fill
      }
    } else {
      // Clear delivery address if branch code is cleared
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: "",
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
                {productsWithPricing.map((product) => (
                  <div key={product.productId} className="vehicle-card">
                    <div className="vehicle-image">
                      <div className="vehicle-placeholder">
                        <span className="vehicle-icon">🚗</span>
                      </div>
                    </div>
                    <div className="vehicle-info">
                      <h3 className="vehicle-name">{product.name}</h3>
                      <p className="vehicle-model">
                        Model: {product.modelCode || `ID: ${product.productId}`}
                      </p>
                      <p className="vehicle-price">{product.formattedPrice}</p>
                      <button
                        className="add-to-order-btn"
                        onClick={() => addToOrder(product)}
                      >
                        + Thêm vào đơn
                      </button>
                    </div>
                  </div>
                ))}
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
                selectedItems.map((item) => (
                  <div key={item.productId} className="selected-item">
                    <div className="item-image">
                      <div className="vehicle-placeholder">
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
                ))
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
