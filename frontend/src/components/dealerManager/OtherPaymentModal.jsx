import React, { useState } from "react";
import paymentApiService from "../../services/paymentApi";
import apiClient from "../../services/api";
import "./VNPayPaymentModal.css";

const OtherPaymentModal = ({ invoice, onClose, onSuccess }) => {
  const [method, setMethod] = useState("Cash");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (images and PDF)
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File không được vượt quá 10MB!");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById("bank-transfer-file-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    if (submitting || uploading) return;
    setSubmitting(true);

    try {
      let fileUrl = null;

      // Upload file if BankTransfer method and file is selected
      if (method === "BankTransfer" && selectedFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);

          const uploadResponse = await apiClient.post(
            "/files/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Extract file URL from response
          fileUrl =
            uploadResponse.data?.value ||
            uploadResponse.data?.data ||
            uploadResponse.data;
          if (typeof fileUrl !== "string") {
            throw new Error("Không nhận được URL file từ server");
          }
        } catch (uploadError) {
          alert(
            "❌ Upload ảnh chuyển khoản thất bại: " +
              (uploadError?.response?.data?.errors?.[0] ||
                uploadError?.message ||
                "Lỗi không xác định")
          );
          setUploading(false);
          setSubmitting(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Create payment with file URL in referenceNo and note separately
      await paymentApiService.createPayment({
        invoiceId: invoice.invoiceId,
        method,
        referenceNo: fileUrl || undefined,
        note: note.trim() || undefined,
      });

      if (onSuccess) onSuccess();
    } catch (e) {
      let errorMessage = "Lỗi không xác định";

      // Extract error message from various possible formats
      if (e?.response?.data?.errors) {
        // Ardalis.Result format: { errors: [...] }
        const errors = e.response.data.errors;
        errorMessage = Array.isArray(errors) ? errors[0] : errors;
      } else if (e?.response?.data?.error) {
        errorMessage = e.response.data.error;
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }

      alert(`❌ Tạo thanh toán thất bại: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vnpay-modal-overlay" onClick={onClose}>
      <div className="vnpay-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vnpay-modal-header">
          <h2>Thanh toán khác</h2>
          <button className="vnpay-close-button" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="vnpay-modal-body">
          <div className="vnpay-invoice-info">
            <h3>Thông tin hóa đơn</h3>
            <div className="vnpay-info-grid">
              <div className="vnpay-info-row">
                <span className="vnpay-label">Số hóa đơn:</span>
                <span className="vnpay-value">{invoice.invoiceNo}</span>
              </div>
              <div className="vnpay-info-row vnpay-total">
                <span className="vnpay-label">Tổng tiền:</span>
                <span className="vnpay-value">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="vnpay-payment-info">
            <div className="vnpay-info-grid" style={{ gap: 12 }}>
              <div
                className="vnpay-info-row"
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span className="vnpay-label" style={{ minWidth: 120 }}>
                  Phương thức:
                </span>
                <select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    // Clear file when switching away from BankTransfer
                    if (e.target.value !== "BankTransfer") {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }
                  }}
                  className="filter-select"
                >
                  <option value="Cash">Tiền mặt</option>
                  <option value="BankTransfer">Chuyển khoản</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              {/* File upload only shows for BankTransfer */}
              {method === "BankTransfer" && (
                <div
                  className="vnpay-info-row"
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span className="vnpay-label" style={{ minWidth: 120 }}>
                      Ảnh chuyển khoản:
                    </span>
                    <div style={{ position: "relative", flex: 1 }}>
                      <input
                        type="file"
                        id="bank-transfer-file-input"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileChange}
                        style={{
                          position: "absolute",
                          width: 0,
                          height: 0,
                          opacity: 0,
                          overflow: "hidden",
                          zIndex: -1,
                        }}
                      />
                      <label
                        htmlFor="bank-transfer-file-input"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 16px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                          border: "none",
                          width: "100%",
                          justifyContent: "center",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#45a049";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "#4CAF50";
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {selectedFile ? selectedFile.name : "Chọn file ảnh/PDF"}
                      </label>
                    </div>
                  </div>

                  {/* File preview */}
                  {filePreview && (
                    <div
                      style={{
                        marginLeft: 132,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <img
                          src={filePreview}
                          alt="Preview"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          {selectedFile?.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            background: "#ff4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PDF preview */}
                  {selectedFile &&
                    selectedFile.type === "application/pdf" &&
                    !filePreview && (
                      <div
                        style={{
                          marginLeft: 132,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          📄 {selectedFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            background: "#ff4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                </div>
              )}

              {/* Note field - shows for all methods */}
              <div
                className="vnpay-info-row"
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <span className="vnpay-label" style={{ minWidth: 120 }}>
                  Ghi chú:
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  className="search-input"
                  style={{
                    flex: 1,
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    padding: "10px",
                    color: "#000",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="vnpay-action-buttons">
            <button
              className="vnpay-cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              className="vnpay-button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                uploading ||
                (method === "BankTransfer" && !selectedFile)
              }
            >
              {uploading
                ? "Đang upload..."
                : submitting
                ? "Đang tạo..."
                : "Tạo thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherPaymentModal;
