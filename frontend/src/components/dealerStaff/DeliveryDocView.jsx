import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./DeliveryDocView.css";
import { API_ENDPOINTS } from "../../services/constants";
import apiClient from "../../services/api";
import deliveryApiService from "../../services/deliveryApiService";

const DeliveryDocView = ({ delivery, onBack, onDeliveryCompleted }) => {
  // Check if delivery has document
  const [hasDocument, setHasDocument] = useState(delivery?.hasDocument || false);
  const [documentData, setDocumentData] = useState(
    delivery?.documentData || {
      documentUrl: "",
      uploadedAt: "",
      isUploaded: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Sync with delivery data
  useEffect(() => {
    const hasDoc = delivery?.hasDocument || !!(delivery?.documentData?.documentUrl);
    setHasDocument(hasDoc);
    setDocumentData(
      delivery?.documentData || {
        documentUrl: "",
        uploadedAt: "",
        isUploaded: false,
      }
    );
  }, [delivery?.hasDocument, delivery?.documentData]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      showToast("error", "Chỉ chấp nhận file PDF!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "File không được vượt quá 10MB!");
      return;
    }

    setSelectedFile(file);

    // Auto upload file
    try {
      setUploading(true);
      console.log("📤 Uploading delivery document:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(API_ENDPOINTS.FILES.UPLOAD_DELIVERY_DOC, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ File uploaded successfully:", response.data);

      const fileUrl = response.data?.value || response.data?.data || response.data;
      setDocumentData((prev) => ({
        ...prev,
        documentUrl: fileUrl,
      }));

      showToast("success", `Upload file "${file.name}" thành công!`);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể upload file";
      showToast("error", errorMessage);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDocument = async () => {
    try {
      setLoading(true);

      if (!documentData.documentUrl) {
        showToast("error", "Vui lòng upload tài liệu bàn giao xe trước!");
        return;
      }

      // Chỉ lưu URL, không đổi status
      const result = await deliveryApiService.updateDeliveryDoc(
        delivery?.backendId || 0,
        documentData.documentUrl
      );

      if (result.success) {
        // Update local state
        const updatedDocumentData = {
          ...documentData,
          isUploaded: true,
          uploadedAt: new Date().toISOString(),
        };
        setDocumentData(updatedDocumentData);
        setHasDocument(true);

        // Notify parent to reload delivery data with toast message
        if (onDeliveryCompleted) {
          onDeliveryCompleted(delivery?.id || "", {
            documentUrl: updatedDocumentData.documentUrl,
            isUploaded: true,
            uploadedAt: updatedDocumentData.uploadedAt,
            toastMessage: {
              type: "success",
              message: "Tài liệu bàn giao xe đã được tạo thành công!"
            }
          });
        }

        // Đóng modal sau khi lưu thành công - toast sẽ hiển thị ở DeliveryDetailView
        if (onBack) {
          onBack();
        }
      } else {
        const errorMsg = result.error || "Không thể lưu tài liệu";
        showToast("error", errorMsg);
      }
    } catch (error) {
      console.error("❌ Error saving document:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi lưu tài liệu";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewDocument = () => {
    setHasDocument(true);
  };

  // Early return if delivery is null
  if (!delivery) {
    return (
      <div className="delivery-doc-view-app">
        <div className="delivery-doc-view">
          <div className="delivery-doc-content">
            <div className="delivery-doc-header">
              <div className="header-info">
                <h1>Tài liệu bàn giao xe</h1>
              </div>
              <button className="back-btn" onClick={onBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại
              </button>
            </div>
            <div className="delivery-doc-body">
              <div className="no-document-section">
                <div className="no-document-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h2>Không có dữ liệu</h2>
                <p>Không thể tải thông tin giao hàng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-doc-view-app">
      {toast && ReactDOM.createPortal(
        <div className={`delivery-doc-toast ${toast.type === 'error' ? 'delivery-doc-toast-error' : ''}`} style={{ zIndex: 99999 }}>
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

      <div className="delivery-doc-view">
        <div className="delivery-doc-content">
          {/* Header */}
          <div className="delivery-doc-header">
            <div className="header-info">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h1>Tài liệu bàn giao xe - {delivery?.id || "N/A"}</h1>
                {delivery?.hasDocument && (
                  <span
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Đã có tài liệu
                  </span>
                )}
              </div>
            </div>
            <button className="back-btn" onClick={onBack}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
          </div>

          {/* Document Content */}
          <div className="delivery-doc-body">
            {!hasDocument && !delivery?.hasDocument && !documentData.documentUrl && !delivery?.documentData?.documentUrl ? (
              // No document - show create button
              <div className="no-document-section">
                <div className="no-document-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <polyline
                      points="14,2 14,8 20,8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="16"
                      y1="13"
                      x2="8"
                      y2="13"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="16"
                      y1="17"
                      x2="8"
                      y2="17"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <polyline
                      points="10,9 9,9 8,9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h2>Chưa có tài liệu</h2>
                <p>Đơn hàng này chưa có tài liệu bàn giao xe. Bạn có thể upload tài liệu mới.</p>
                <button
                  className="create-document-btn"
                  onClick={handleCreateNewDocument}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Upload tài liệu mới
                </button>
              </div>
            ) : (
              // Has document - show document form
              <div className="document-form">
                {/* Document File Section */}
                <div className="form-section">
                  <h3>File tài liệu bàn giao xe (PDF)</h3>
                  <div className="upload-area">
                    {uploading ? (
                      <div className="upload-zone">
                        <div
                          style={{
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              border: "4px solid #e5e7eb",
                              borderTop: "4px solid #20c997",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                              margin: "0 auto 12px",
                            }}
                          />
                          <p style={{ color: "#20c997", fontWeight: "500" }}>
                            Đang upload file...
                          </p>
                        </div>
                      </div>
                    ) : selectedFile || documentData.documentUrl || delivery?.documentData?.documentUrl ? (
                      <div className={delivery?.hasDocument ? "file-display-card" : "uploaded-file"}>
                        <div className="file-info">
                          <div className="file-icon">
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#20c997"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                              <line x1="9" y1="15" x2="15" y2="15" />
                              <line x1="9" y1="18" x2="15" y2="18" />
                            </svg>
                          </div>
                          <div className="file-details">
                            <p className="file-name">
                              {selectedFile?.name || "Tài liệu bàn giao xe.pdf"}
                            </p>
                            <p className="file-size">
                              {selectedFile 
                                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                                : "PDF Document"}
                            </p>
                          </div>
                        </div>
                        {(documentData.documentUrl || delivery?.documentData?.documentUrl) && (
                          <a
                            href={documentData.documentUrl || delivery?.documentData?.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-file-link"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Xem file
                          </a>
                        )}
                        {!delivery?.hasDocument && (
                          <button
                            className="remove-file-btn"
                            onClick={() => {
                              setSelectedFile(null);
                              setDocumentData((prev) => ({
                                ...prev,
                                documentUrl: "",
                              }));
                            }}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="upload-zone">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <polyline
                            points="7,10 12,15 17,10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <line
                            x1="12"
                            y1="15"
                            x2="12"
                            y2="3"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        <p>Chọn file PDF để upload</p>
                        <small style={{ color: "#666", marginTop: "4px" }}>
                          Tối đa 10MB
                        </small>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      id="pdf-upload"
                      disabled={delivery?.hasDocument || uploading}
                    />
                    {!delivery?.hasDocument && (
                      <label
                        htmlFor="pdf-upload"
                        className={`upload-btn ${uploading ? "disabled" : ""}`}
                        style={{
                          pointerEvents: uploading ? "none" : "auto",
                          opacity: uploading ? 0.5 : 1,
                        }}
                      >
                        {selectedFile || documentData.documentUrl
                          ? "Thay đổi PDF"
                          : "Chọn file PDF"}
                      </label>
                    )}
                  </div>
                </div>

                {/* Complete Delivery Button - Only show when creating new document */}
                {!delivery?.hasDocument && (
                  <div className="form-section">
                    <button
                      className="complete-delivery-btn"
                      disabled={loading || !documentData.documentUrl}
                      onClick={handleSaveDocument}
                    >
                      {loading ? "Đang xử lý..." : "Tạo tài liệu"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDocView;
