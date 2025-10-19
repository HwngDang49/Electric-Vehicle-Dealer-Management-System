import { useState, useCallback } from "react";
import depositApiService from "../services/depositApi";

/**
 * Custom hook for deposit API operations
 */
const useDepositApi = () => {
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

  const useAddDeposit = () => {
    const addDeposit = useCallback(
      async (depositData) => {
        return handleApiCall(() => depositApiService.addDeposit(depositData));
      },
      [handleApiCall]
    );

    return { addDeposit, loading, error };
  };

  const useGetDepositsByOrder = () => {
    const getDepositsByOrder = useCallback(
      async (orderId) => {
        return handleApiCall(() => depositApiService.getDepositsByOrder(orderId));
      },
      [handleApiCall]
    );

    return { getDepositsByOrder, loading, error };
  };

  const useGetDepositById = () => {
    const getDepositById = useCallback(
      async (depositId) => {
        return handleApiCall(() => depositApiService.getDepositById(depositId));
      },
      [handleApiCall]
    );

    return { getDepositById, loading, error };
  };

  const useUpdateDeposit = () => {
    const updateDeposit = useCallback(
      async (depositId, depositData) => {
        return handleApiCall(() => depositApiService.updateDeposit(depositId, depositData));
      },
      [handleApiCall]
    );

    return { updateDeposit, loading, error };
  };

  const useDeleteDeposit = () => {
    const deleteDeposit = useCallback(
      async (depositId) => {
        return handleApiCall(() => depositApiService.deleteDeposit(depositId));
      },
      [handleApiCall]
    );

    return { deleteDeposit, loading, error };
  };

  return {
    useAddDeposit,
    useGetDepositsByOrder,
    useGetDepositById,
    useUpdateDeposit,
    useDeleteDeposit,
  };
};

export default useDepositApi;
