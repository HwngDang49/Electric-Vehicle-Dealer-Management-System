import { useState, useEffect, useCallback } from "react";
import paymentApiService from "../services/paymentApi";

export const usePaymentApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApiService.getPayments();
      setPayments(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApiService.getPaymentById(id);
      setPayment(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const newPayment = await paymentApiService.createPayment(paymentData);
      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyPayment = useCallback(async (id, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPayment = await paymentApiService.updatePayment(
        id,
        paymentData
      );
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? updatedPayment : p))
      );
      return updatedPayment;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removePayment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await paymentApiService.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    payments,
    payment,
    fetchPayments,
    fetchPaymentById,
    addPayment,
    modifyPayment,
    removePayment,
  };
};

// Export default for index.js compatibility
export default usePaymentApi;
