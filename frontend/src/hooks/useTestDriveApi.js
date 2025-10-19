import { useState, useCallback } from "react";
import testDriveApiService from "../services/testDriveApi";

/**
 * Custom hook for test drive API operations
 */
const useTestDriveApi = () => {
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

  const useGetTestDrives = () => {
    const getTestDrives = useCallback(
      async (params = {}) => {
        return handleApiCall(() => testDriveApiService.getTestDrives(params));
      },
      [handleApiCall]
    );

    return { getTestDrives, loading, error };
  };

  const useCreateTestDrive = () => {
    const createTestDrive = useCallback(
      async (testDriveData) => {
        return handleApiCall(() => testDriveApiService.createTestDrive(testDriveData));
      },
      [handleApiCall]
    );

    return { createTestDrive, loading, error };
  };

  const useGetTestDriveById = () => {
    const getTestDriveById = useCallback(
      async (testDriveId) => {
        return handleApiCall(() => testDriveApiService.getTestDriveById(testDriveId));
      },
      [handleApiCall]
    );

    return { getTestDriveById, loading, error };
  };

  const useUpdateTestDrive = () => {
    const updateTestDrive = useCallback(
      async (testDriveId, testDriveData) => {
        return handleApiCall(() => testDriveApiService.updateTestDrive(testDriveId, testDriveData));
      },
      [handleApiCall]
    );

    return { updateTestDrive, loading, error };
  };

  const useDeleteTestDrive = () => {
    const deleteTestDrive = useCallback(
      async (testDriveId) => {
        return handleApiCall(() => testDriveApiService.deleteTestDrive(testDriveId));
      },
      [handleApiCall]
    );

    return { deleteTestDrive, loading, error };
  };

  const useScheduleTestDrive = () => {
    const scheduleTestDrive = useCallback(
      async (testDriveId, scheduleData) => {
        return handleApiCall(() => testDriveApiService.scheduleTestDrive(testDriveId, scheduleData));
      },
      [handleApiCall]
    );

    return { scheduleTestDrive, loading, error };
  };

  const useCompleteTestDrive = () => {
    const completeTestDrive = useCallback(
      async (testDriveId, completionData) => {
        return handleApiCall(() => testDriveApiService.completeTestDrive(testDriveId, completionData));
      },
      [handleApiCall]
    );

    return { completeTestDrive, loading, error };
  };

  return {
    useGetTestDrives,
    useCreateTestDrive,
    useGetTestDriveById,
    useUpdateTestDrive,
    useDeleteTestDrive,
    useScheduleTestDrive,
    useCompleteTestDrive,
  };
};

export default useTestDriveApi;
