import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import productApi from "../../services/productApi";
import CreateProductModal from "./CreateProductModal";
import ProductDetailModal from "./ProductDetailModal";
import CustomDropdown from "./CustomDropdown";
import "./ProductCatalog.css";

const ProductCard = ({ product, onClick }) => {
  // Handle both camelCase and PascalCase from API
  // Use ModelCode for the main name to avoid duplication with VariantCode
  const modelCode =
    product?.modelCode ||
    product?.ModelCode ||
    product?.name ||
    product?.Name ||
    "Sản phẩm";

  const variantCode =
    product?.variantCode ||
    product?.VariantCode ||
    product?.version ||
    product?.trim ||
    product?.variant ||
    "";

  const colorName =
    product?.colorName ||
    product?.ColorName ||
    product?.color ||
    product?.Color ||
    "";

  const batteryKwh =
    product?.batteryKwh ??
    product?.BatteryKwh ??
    product?.batteryKW ??
    product?.batteryCapacity ??
    product?.capacityKwh ??
    null;
  const motorKw =
    product?.motorKw ??
    product?.MotorKw ??
    product?.motorKW ??
    product?.powerKw ??
    null;
  const rangeKm =
    product?.rangeKm ??
    product?.RangeKm ??
    product?.rangeKM ??
    (product?.range || null);
  const imageUrl =
    product?.imageUrl || product?.thumbnailUrl || product?.image || "";
  const status =
    product?.status || product?.Status || product?.productStatus || "Active";
  const isInactive = status === "Inactive" || status === "Discontinued";

  // Map status to display text and icon (matching ProductDetailModal)
  const getStatusBadge = (status) => {
    if (status === "Discontinued") {
      return { text: "Ngừng sản xuất", icon: "🚫" };
    } else if (status === "Inactive") {
      return { text: "Không hoạt động", icon: "⏸️" };
    }
    return null;
  };

  const statusBadge = getStatusBadge(status);

  return (
    <div
      className={`product-card ${isInactive ? "inactive" : ""}`}
      onClick={onClick}
    >
      {statusBadge && (
        <div className="product-status-badge">
          <span className="status-icon">{statusBadge.icon}</span>
          <span className="status-text">{statusBadge.text}</span>
        </div>
      )}
      <div className="product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={modelCode} />
        ) : (
          <div className="image-placeholder" />
        )}
      </div>
      <div className="product-info">
        <div className="product-title">
          <span className="model">{modelCode}</span>
          {variantCode && <span className="version">{variantCode}</span>}
          {variantCode && colorName && <span className="separator"> - </span>}
          {colorName && <span className="color">{colorName}</span>}
        </div>
        <div className="product-specs">
          <div className="spec-item">
            <span className="spec-label">Battery</span>
            <span className="spec-value">
              {batteryKwh ? `${batteryKwh} kWh` : "—"}
            </span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Motor</span>
            <span className="spec-value">
              {motorKw ? `${motorKw} kW` : "—"}
            </span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Range</span>
            <span className="spec-value">
              {rangeKm ? `${rangeKm} km` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    model: "",
    variant: "",
    status: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchProducts = async (statusFilter = "") => {
    setLoading(true);
    setError("");
    try {
      // Temporarily use getProducts while backend is being rebuilt
      const res = await productApi.getProducts({});
      const data = res?.data || res?.items || res || [];
      const list = Array.isArray(data) ? data : [];

      console.log("✅ Fetched products:", list.length, "products");
      list.forEach((p) => console.log(`  - ${p.name} (${p.status})`));

      // Filter by status on frontend if needed
      const filteredByStatus = statusFilter
        ? list.filter((p) => (p?.status || p?.productStatus) === statusFilter)
        : list;

      const sorted = [...filteredByStatus].sort((a, b) => {
        const timeA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const timeB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        if (timeA !== timeB) return timeB - timeA; // newest first
        const idA = Number(a?.productId ?? a?.id ?? 0);
        const idB = Number(b?.productId ?? b?.id ?? 0);
        return idB - idA;
      });
      setProducts(sorted);
    } catch (e) {
      console.error("❌ Error fetching products:", e);
      setError(e?.message || "Không tải được danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const models = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const m =
        p?.modelCode ||
        p?.ModelCode ||
        p?.model ||
        p?.productModel ||
        p?.code ||
        "Khác";
      set.add(m);
    });
    return ["All Models", ...Array.from(set)];
  }, [products]);

  const variants = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const v = p?.variantCode || p?.VariantCode || p?.version;
      if (v) set.add(v);
    });
    return ["All Variants", ...Array.from(set)];
  }, [products]);

  const modelOptions = useMemo(() => {
    return models.map((m) => ({
      value: m,
      label: m,
      icon: m === "All Models" ? "🚗" : "🏎️",
    }));
  }, [models]);

  const variantOptions = useMemo(() => {
    return variants.map((v) => ({
      value: v,
      label: v,
      icon: v === "All Variants" ? "⚙️" : "🔧",
    }));
  }, [variants]);

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" },
    { value: "Discontinued", label: "Ngừng kinh doanh", icon: "🚫" },
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const m =
        p?.modelCode ||
        p?.ModelCode ||
        p?.model ||
        p?.productModel ||
        p?.code ||
        "Khác";
      const v = p?.variantCode || p?.VariantCode || p?.version || "";
      const okModel =
        !filters.model || filters.model === "All Models" || m === filters.model;
      const okVariant =
        !filters.variant ||
        filters.variant === "All Variants" ||
        v === filters.variant;
      return okModel && okVariant;
    });
  }, [products, filters]);

  return (
    <div className="admin-product-catalog-app">
      {toast && ReactDOM.createPortal(
        <div className={`admin-product-catalog-toast ${toast.type === 'error' ? 'admin-product-catalog-toast-error' : ''}`} style={{ zIndex: 99999 }}>
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {toast.type === 'error' ? (<path d="M18 6L6 18M6 6l12 12" />) : (<path d="M20 6L9 17l-5-5" />)}
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.type === 'error' ? 'Thất bại' : 'Thành công'}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div className="toast-progress"></div>
        </div>, document.body)}

      <div className="product-catalog-page">
        <div className="management-toolbar">
          <div className="filters-section">
            <CustomDropdown
              value={filters.model}
              onChange={(val) => setFilters((f) => ({ ...f, model: val }))}
              options={modelOptions}
              minWidth="200px"
            />
            <CustomDropdown
              value={filters.variant}
              onChange={(val) => setFilters((f) => ({ ...f, variant: val }))}
              options={variantOptions}
              minWidth="200px"
            />
            <CustomDropdown
              value={filters.status}
              onChange={(val) => {
                setFilters((f) => ({ ...f, status: val }));
                fetchProducts(val);
              }}
              options={statusOptions}
              minWidth="220px"
            />
          </div>
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Thêm Sản Phẩm
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="catalog-grid">
            {filtered.map((p, idx) => {
              const key =
                p?.id ??
                p?.productId ??
                p?.ProductId ??
                p?.code ??
                `${p?.model || "m"}-${p?.version || "v"}-${
                  p?.color || "c"
                }-${idx}`;
              const pid = p?.productId ?? p?.ProductId ?? p?.id;
              return (
                <ProductCard
                  key={key}
                  product={p}
                  onClick={() => {
                    if (pid) setSelectedProductId(pid);
                    setSelectedProduct(p);
                  }}
                />
              );
            })}
          </div>
        )}
        {showCreateModal && (
          <CreateProductModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(productName) => {
              setShowCreateModal(false);
              fetchProducts();
              // Show toast after modal closes
              if (productName) {
                showToast("success", `Sản phẩm "${productName}" đã được tạo thành công!`);
              } else {
                showToast("success", "Sản phẩm đã được tạo thành công!");
              }
            }}
            onError={(errorMessage) => {
              // Show error toast if provided
              if (errorMessage) {
                showToast("error", errorMessage);
              }
            }}
          />
        )}
        {selectedProductId && (
          <ProductDetailModal
            productId={selectedProductId}
            initialProduct={selectedProduct}
            onClose={() => setSelectedProductId(null)}
            onUpdate={() => fetchProducts()}
            onSaveSuccess={(message) => {
              // Show success toast
              showToast("success", message);
            }}
            onSaveError={(errorMessage) => {
              // Show error toast
              if (errorMessage) {
                showToast("error", errorMessage);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
