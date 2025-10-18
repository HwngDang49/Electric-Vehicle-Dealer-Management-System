// Custom hook for Quote API operations
import { useState, useCallback } from "react";
import quoteApiService from "../services/quoteApi";
import { API_STATUS } from "../services/constants";

/**
 * Custom hook for quote API operations
 * Provides state management and error handling for quote-related API calls
 */
export const useQuoteApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Generic API call handler
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments for the API call
   * @returns {Promise<Object>} - API response
   */
  const handleApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...args);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Quote Operations
  const getQuotes = useCallback(
    async (filters = {}) => {
      return handleApiCall(quoteApiService.getQuotes, filters);
    },
    [handleApiCall]
  );

  const getQuoteById = useCallback(
    async (id) => {
      return handleApiCall(quoteApiService.getQuoteById, id);
    },
    [handleApiCall]
  );

  const createQuote = useCallback(
    async (quoteData) => {
      try {
        // Validate required fields
        const requiredFields = ["customerId"];
        const missingFields = requiredFields.filter(
          (field) => !quoteData[field]
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        // Validate items array
        if (
          !quoteData.items ||
          !Array.isArray(quoteData.items) ||
          quoteData.items.length === 0
        ) {
          throw new Error("Items array is required and must not be empty");
        }

        // Validate each item
        quoteData.items.forEach((item, index) => {
          if (!item.productId) {
            throw new Error(`Item ${index + 1}: productId is required`);
          }
          if (!item.qty || item.qty <= 0) {
            throw new Error(`Item ${index + 1}: qty must be a positive number`);
          }
        });

        const response = await handleApiCall(
          quoteApiService.createQuote,
          quoteData
        );

        return response;
      } catch (error) {
        setError(error);
        throw error;
      }
    },
    [handleApiCall]
  );

  const updateQuote = useCallback(
    async (id, updateData) => {
      return handleApiCall(quoteApiService.updateQuote, id, updateData);
    },
    [handleApiCall]
  );

  const deleteQuote = useCallback(
    async (id) => {
      return handleApiCall(quoteApiService.deleteQuote, id);
    },
    [handleApiCall]
  );

  const finalizeQuote = useCallback(
    async (id) => {
      return handleApiCall(quoteApiService.finalizeQuote, id);
    },
    [handleApiCall]
  );

  const cancelQuote = useCallback(
    async (id) => {
      return handleApiCall(quoteApiService.cancelQuote, id);
    },
    [handleApiCall]
  );

  const convertToOrder = useCallback(
    async (id) => {
      return handleApiCall(quoteApiService.convertToOrder, id);
    },
    [handleApiCall]
  );

  const searchQuotes = useCallback(
    async (searchTerm, filters = {}) => {
      return handleApiCall(quoteApiService.searchQuotes, searchTerm, filters);
    },
    [handleApiCall]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setData(null);
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    // State
    loading,
    error,
    data,

    // Actions
    getQuotes,
    getQuoteById,
    createQuote,
    updateQuote,
    deleteQuote,
    finalizeQuote,
    cancelQuote,
    convertToOrder,
    searchQuotes,

    // Utilities
    clearError,
    clearData,
    reset,
  };
};

export default useQuoteApi;
