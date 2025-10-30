import { useState, useCallback } from "react";
import dealerApiService from "../services/dealerApi";

/**
 * Custom hook for fetching dealer name by dealer ID
 * @param {number|string} dealerId - The dealer ID to fetch name for
 * @returns {Object} { dealerName, loading, error, fetchDealerName }
 */
const useDealerName = (dealerId) => {
  const [dealerName, setDealerName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch dealer name by dealer ID
   * @param {number|string} id - Optional dealer ID (overrides initial dealerId)
   * @returns {Promise<string|null>} The dealer name or null
   */
  const fetchDealerName = useCallback(
    async (id = null) => {
      const targetId = id || dealerId;

      if (!targetId) {
        setDealerName(null);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await dealerApiService.getDealerById(targetId);
        const dealerData = response?.data || response;

        // Extract dealer name from various possible field names
        const name = dealerData?.name || dealerData?.dealerName || null;
        setDealerName(name);
        return name;
      } catch (err) {
        const errorMessage = err?.message || "Error fetching dealer name";
        setError(errorMessage);
        console.error("Error fetching dealer name:", err);
        setDealerName(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [dealerId]
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setDealerName(null);
    setLoading(false);
    setError(null);
  }, []);

  return { dealerName, loading, error, fetchDealerName, reset };
};

export default useDealerName;
