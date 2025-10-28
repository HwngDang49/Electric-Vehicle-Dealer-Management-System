import React, {
  useState,
  useCallback,
  useMemo,
} from "react";
import { ToastContext } from "./ToastContext";

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast) => {
      const id = Math.random().toString(36).substring(7);
      const newToast = {
        id,
        ...toast,
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, newToast]);

      // Auto remove toast after duration
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "success",
        message,
        ...options,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "error",
        message,
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "warning",
        message,
        ...options,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "info",
        message,
        ...options,
      });
    },
    [addToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

