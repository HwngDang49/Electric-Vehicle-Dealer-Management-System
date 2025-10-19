import { useState, useCallback } from "react";
import contractApiService from "../services/contractApi";

/**
 * Custom hook for Contract API operations
 * Provides state management and API calls for contract-related operations
 */
export const useContractApi = () => {
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

  const createContract = useCallback(
    async (orderId, contractData) => {
      return handleApiCall(() =>
        contractApiService.createContract(orderId, contractData)
      );
    },
    [handleApiCall]
  );

  const signContract = useCallback(
    async (contractId, signData) => {
      return handleApiCall(() =>
        contractApiService.signContract(contractId, signData)
      );
    },
    [handleApiCall]
  );

  const getContractById = useCallback(
    async (contractId) => {
      return handleApiCall(() =>
        contractApiService.getContractById(contractId)
      );
    },
    [handleApiCall]
  );

  return {
    loading,
    error,
    createContract,
    signContract,
    getContractById,
  };
};

export default useContractApi;
