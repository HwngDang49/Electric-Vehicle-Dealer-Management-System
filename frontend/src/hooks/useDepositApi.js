import { useState, useCallback } from "react";
import depositApiService from "../services/depositApi";

/**
 * Custom hook for Deposit API operations
 * Provides state management and API calls for deposit-related operations
 */
export const useDepositApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeposit = useCallback(
    async (orderId, depositData) => {
      return handleApiCall(() =>
        depositApiService.addDeposit(orderId, depositData)
      );
    },
    [handleApiCall]
  );

  const getDepositsByOrder = useCallback(
    async (orderId) => {
      return handleApiCall(() => depositApiService.getDepositsByOrder(orderId));
    },
    [handleApiCall]
  );

  return {
    loading,
    error,
    addDeposit,
    getDepositsByOrder,
  };
};

export default useDepositApi;
