// utils/service/teaching.ts
import {
  ComparisonResult,
  ComparisonHistoryItem,
} from "@/types/teaching.types";

export const saveComparisonResult = async (
  controllerId: string,
  result: ComparisonResult
): Promise<ComparisonResult> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/teaching/compare`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving comparison result:", error);
    throw error;
  }
};

export const getComparisonHistory = async (
  controllerId: string
): Promise<ComparisonHistoryItem[]> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/teaching/history`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching comparison history:", error);
    throw error;
  }
};

export const getComparisonById = async (
  controllerId: string,
  comparisonId: string
): Promise<ComparisonResult> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/teaching/compare/${comparisonId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching comparison by ID:", error);
    throw error;
  }
};

export const deleteComparison = async (
  controllerId: string,
  comparisonId: string
): Promise<void> => {
  try {
    // URL'yi query parameter olarak gönder
    const response = await fetch(
      `/api/controller/${controllerId}/teaching/compare?comparisonId=${comparisonId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting comparison:", error);
    throw error;
  }
};
