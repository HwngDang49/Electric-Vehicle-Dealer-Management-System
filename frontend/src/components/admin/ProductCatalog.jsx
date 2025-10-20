import React, { useEffect, useMemo, useState } from "react";
import productApi from "../../services/productApi";
import CreateProductModal from "./CreateProductModal";
import ProductDetailModal from "./ProductDetailModal";
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
  const name = product?.name || product?.productName || product?.model || "Sản phẩm";
  const model = product?.model || product?.productModel || product?.code || "";
  const version = product?.version || product?.trim || product?.variant || "";
  const price = product?.price ?? product?.basePrice ?? product?.listPrice ?? product?.msrp ?? 0;
  const batteryKwh = product?.batteryKwh ?? product?.batteryKW ?? product?.batteryCapacity ?? product?.capacityKwh ?? null;
  const motorKw = product?.motorKw ?? product?.motorKW ?? product?.powerKw ?? null;
  const rangeKm = product?.rangeKm ?? product?.rangeKM ?? (product?.range || null);
  const imageUrl = product?.imageUrl || product?.thumbnailUrl || product?.image || "";

  return (
    <div className="product-card" onClick={onClick}>
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
      {/* No actions for now */}
    </div>
  );
};

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ model: "", variant: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productApi.getProducts({});
      const data = res?.data || res?.items || res || [];
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => {
        const timeA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const timeB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        if (timeA !== timeB) return timeB - timeA; // newest first
        const idA = Number(a?.productId ?? a?.id ?? 0);
        const idB = Number(b?.productId ?? b?.id ?? 0);
        return idB - idA;
      });
      setProducts(sorted);
    } catch (e) {
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
    products.forEach((p) => set.add(p?.model || p?.productModel || p?.code || "Khác"));
    return ["All Models", ...Array.from(set)];
  }, [products]);

  const variants = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p?.version && set.add(p.version));
    return ["All Variants", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const m = p?.model || p?.productModel || p?.code || "Khác";
      const v = p?.version || "";
      const okModel = !filters.model || filters.model === "All Models" || m === filters.model;
      const okVariant = !filters.variant || filters.variant === "All Variants" || v === filters.variant;
      return okModel && okVariant;
    });
  }, [products, filters]);

  return (
    <div className="product-catalog-page">
      <div className="catalog-header">
        <h2>Quản Lý Sản Phẩm</h2>
        <div className="filters">
          <select
            value={filters.model}
            onChange={(e) => setFilters((f) => ({ ...f, model: e.target.value }))}
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filters.variant}
            onChange={(e) => setFilters((f) => ({ ...f, variant: e.target.value }))}
          >
            {variants.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Thêm Sản phẩm
          </button>
        </div>
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
              p?.code ??
              `${p?.model || "m"}-${p?.version || "v"}-${p?.color || "c"}-${idx}`;
            const pid = p?.productId ?? p?.id;
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
        />
      )}
    </div>
  );
};

export default ProductCatalog;


