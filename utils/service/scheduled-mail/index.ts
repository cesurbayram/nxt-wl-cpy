import {
  MailJobConfig,
  ScheduledMailJob,
  MailJobResponse,
} from "@/types/scheduled-mail.types";

export const createScheduledMailJob = async (
  config: MailJobConfig
): Promise<MailJobResponse> => {
  try {
    const response = await fetch("/api/scheduled-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to create scheduled mail job"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating scheduled mail job:", error);
    throw error;
  }
};

export const getScheduledMailJobs = async (options?: {
  page?: number;
  pageSize?: number;
  status?: "scheduled" | "completed" | "failed";
}): Promise<{ jobs: ScheduledMailJob[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();

    if (options?.page) params.append("page", options.page.toString());
    if (options?.pageSize)
      params.append("pageSize", options.pageSize.toString());
    if (options?.status) params.append("status", options.status);

    const queryString = params.toString();
    const url = queryString
      ? `/api/scheduled-mail?${queryString}`
      : "/api/scheduled-mail";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch scheduled mail jobs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching scheduled mail jobs:", error);
    throw error;
  }
};

export const getScheduledMailJob = async (
  jobId: string
): Promise<ScheduledMailJob> => {
  try {
    const response = await fetch(`/api/scheduled-mail/${jobId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch scheduled mail job");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching scheduled mail job:", error);
    throw error;
  }
};

export const updateScheduledMailJob = async (
  jobId: string,
  updates: Partial<MailJobConfig>
): Promise<{ message: string; job: ScheduledMailJob }> => {
  try {
    const response = await fetch(`/api/scheduled-mail/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to update scheduled mail job"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating scheduled mail job:", error);
    throw error;
  }
};

export const deleteScheduledMailJob = async (
  jobId: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`/api/scheduled-mail/${jobId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to delete scheduled mail job"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting scheduled mail job:", error);
    throw error;
  }
};

export const getMailJobStatusColor = (status: string): string => {
  switch (status) {
    case "scheduled":
      return "text-blue-600 bg-blue-100";
    case "completed":
      return "text-green-600 bg-green-100";
    case "failed":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getMailJobStatusText = (status: string): string => {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};
