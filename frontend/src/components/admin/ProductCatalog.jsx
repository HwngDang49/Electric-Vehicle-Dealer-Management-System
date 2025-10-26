import React, { useEffect, useMemo, useState } from "react";
import productApi from "../../services/productApi";
import CreateProductModal from "./CreateProductModal";
import ProductDetailModal from "./ProductDetailModal";
import CustomDropdown from "./CustomDropdown";
import "./ProductCatalog.css";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "";
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(amount)
    );
  } catch {
    return String(amount);
  }
};

const ProductCard = ({ product, onClick }) => {
  // Handle both camelCase and PascalCase from API
  const name = product?.name || product?.Name || product?.productName || product?.modelCode || product?.ModelCode || "Sản phẩm";
  const model = product?.modelCode || product?.ModelCode || product?.model || product?.productModel || product?.code || "";
  const version = product?.variantCode || product?.VariantCode || product?.version || product?.trim || product?.variant || "";
  const price = product?.price ?? product?.basePrice ?? product?.listPrice ?? product?.msrp ?? 0;
  const batteryKwh = product?.batteryKwh ?? product?.BatteryKwh ?? product?.batteryKW ?? product?.batteryCapacity ?? product?.capacityKwh ?? null;
  const motorKw = product?.motorKw ?? product?.MotorKw ?? product?.motorKW ?? product?.powerKw ?? null;
  const rangeKm = product?.rangeKm ?? product?.RangeKm ?? product?.rangeKM ?? (product?.range || null);
  const imageUrl = product?.imageUrl || product?.thumbnailUrl || product?.image || "";
  const status = product?.status || product?.Status || product?.productStatus || "Active";
  const isInactive = status === "Inactive" || status === "Discontinued";

  return (
    <div className={`product-card ${isInactive ? 'inactive' : ''}`} onClick={onClick}>
      {isInactive && (
        <div className="product-status-badge">
          <span className="status-icon">⏸️</span>
          <span className="status-text">Không hoạt động</span>
        </div>
      )}
      <div className="product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="image-placeholder" />
        )}
      </div>
      <div className="product-info">
        <div className="product-title">
          <span className="model">{name}</span>
          {version && <span className="version">{version}</span>}
        </div>
        <div className="product-price">{formatCurrency(price)}</div>
        <div className="product-specs">
          <div className="spec-item">
            <span className="spec-label">Battery</span>
            <span className="spec-value">{batteryKwh ? `${batteryKwh} kWh` : "—"}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Motor</span>
            <span className="spec-value">{motorKw ? `${motorKw} kW` : "—"}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Range</span>
            <span className="spec-value">{rangeKm ? `${rangeKm} km` : "—"}</span>
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
  const [filters, setFilters] = useState({ model: "", variant: "", status: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async (statusFilter = "") => {
    setLoading(true);
    setError("");
    try {
      // Temporarily use getProducts while backend is being rebuilt
      const res = await productApi.getProducts({});
      const data = res?.data || res?.items || res || [];
      const list = Array.isArray(data) ? data : [];
      
      console.log("✅ Fetched products:", list.length, "products");
      list.forEach(p => console.log(`  - ${p.name} (${p.status})`));
      
      // Filter by status on frontend if needed
      const filteredByStatus = statusFilter 
        ? list.filter(p => (p?.status || p?.productStatus) === statusFilter)
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
      const m = p?.modelCode || p?.ModelCode || p?.model || p?.productModel || p?.code || "Khác";
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
    return models.map(m => ({
      value: m,
      label: m,
      icon: m === "All Models" ? "🚗" : "🏎️"
    }));
  }, [models]);

  const variantOptions = useMemo(() => {
    return variants.map(v => ({
      value: v,
      label: v,
      icon: v === "All Variants" ? "⚙️" : "🔧"
    }));
  }, [variants]);

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" },
    { value: "Discontinued", label: "Ngừng kinh doanh", icon: "🚫" }
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const m = p?.modelCode || p?.ModelCode || p?.model || p?.productModel || p?.code || "Khác";
      const v = p?.variantCode || p?.VariantCode || p?.version || "";
      const okModel = !filters.model || filters.model === "All Models" || m === filters.model;
      const okVariant = !filters.variant || filters.variant === "All Variants" || v === filters.variant;
      return okModel && okVariant;
    });
  }, [products, filters]);

  return (
    <div className="admin-product-catalog-app">
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
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
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
              `${p?.model || "m"}-${p?.version || "v"}-${p?.color || "c"}-${idx}`;
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
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
        />
      )}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          initialProduct={selectedProduct}
          onClose={() => setSelectedProductId(null)}
          onUpdate={() => fetchProducts()}
        />
      )}
      </div>
    </div>
  );
};

export default ProductCatalog;


