import { useState, useCallback } from "react";
import testDriveApiService from "../services/testDriveApi";

/**
 * Custom hook for Test Drive API operations
 * Provides state management and API calls for test drive-related operations
 */
export const useTestDriveApi = () => {
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

  const getTestDrives = useCallback(
    async (filters) => {
      return handleApiCall(() => testDriveApiService.getTestDrives(filters));
    },
    [handleApiCall]
  );

  const getTestDriveById = useCallback(
    async (id) => {
      return handleApiCall(() => testDriveApiService.getTestDriveById(id));
    },
    [handleApiCall]
  );

  const createTestDrive = useCallback(
    async (testDriveData) => {
      return handleApiCall(() =>
        testDriveApiService.createTestDrive(testDriveData)
      );
    },
    [handleApiCall]
  );

  const updateTestDrive = useCallback(
    async (id, updateData) => {
      return handleApiCall(() =>
        testDriveApiService.updateTestDrive(id, updateData)
      );
    },
    [handleApiCall]
  );

  const deleteTestDrive = useCallback(
    async (id) => {
      return handleApiCall(() => testDriveApiService.deleteTestDrive(id));
    },
    [handleApiCall]
  );

  const scheduleTestDrive = useCallback(
    async (id, scheduleData) => {
      return handleApiCall(() =>
        testDriveApiService.scheduleTestDrive(id, scheduleData)
      );
    },
    [handleApiCall]
  );

  const completeTestDrive = useCallback(
    async (id, completionData) => {
      return handleApiCall(() =>
        testDriveApiService.completeTestDrive(id, completionData)
      );
    },
    [handleApiCall]
  );

  const searchTestDrives = useCallback(
    async (searchTerm, filters) => {
      return handleApiCall(() =>
        testDriveApiService.searchTestDrives(searchTerm, filters)
      );
    },
    [handleApiCall]
  );

  return {
    loading,
    error,
    getTestDrives,
    getTestDriveById,
    createTestDrive,
    updateTestDrive,
    deleteTestDrive,
    scheduleTestDrive,
    completeTestDrive,
    searchTestDrives,
  };
};

export default useTestDriveApi;
