import { useState, useCallback } from "react";
import contractApiService from "../services/contractApi";

/**
 * Custom hook for contract API operations
 */
const useContractApi = () => {
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

  const useCreateContract = () => {
    const createContract = useCallback(
      async (contractData) => {
        return handleApiCall(() => contractApiService.createContract(contractData));
      },
      [handleApiCall]
    );

    return { createContract, loading, error };
  };

  const useSignContract = () => {
    const signContract = useCallback(
      async (contractId, signatureData) => {
        return handleApiCall(() => contractApiService.signContract(contractId, signatureData));
      },
      [handleApiCall]
    );

    return { signContract, loading, error };
  };

  const useGetContractById = () => {
    const getContractById = useCallback(
      async (contractId) => {
        return handleApiCall(() => contractApiService.getContractById(contractId));
      },
      [handleApiCall]
    );

    return { getContractById, loading, error };
  };

  const useGetContracts = () => {
    const getContracts = useCallback(
      async (params = {}) => {
        return handleApiCall(() => contractApiService.getContracts(params));
      },
      [handleApiCall]
    );

    return { getContracts, loading, error };
  };

  const useUpdateContract = () => {
    const updateContract = useCallback(
      async (contractId, contractData) => {
        return handleApiCall(() => contractApiService.updateContract(contractId, contractData));
      },
      [handleApiCall]
    );

    return { updateContract, loading, error };
  };

  const useDeleteContract = () => {
    const deleteContract = useCallback(
      async (contractId) => {
        return handleApiCall(() => contractApiService.deleteContract(contractId));
      },
      [handleApiCall]
    );

    return { deleteContract, loading, error };
  };

  return {
    useCreateContract,
    useSignContract,
    useGetContractById,
    useGetContracts,
    useUpdateContract,
    useDeleteContract,
  };
};

export default useContractApi;
