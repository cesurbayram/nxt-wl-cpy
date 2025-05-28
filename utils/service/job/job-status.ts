import { JobStatus } from "@/types/job-status.types";

const getJobStatuses = async (): Promise<JobStatus[]> => {
  const apiRes = await fetch("/api/job-status", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when fetching job statuses");

  const result = await apiRes.json();
  return result;
};

const getJobStatusesByFilters = async (
  controllerId?: string,
  shiftId?: string,
  jobId?: string
): Promise<JobStatus[]> => {
  const params = new URLSearchParams();

  if (controllerId) params.append("controllerId", controllerId);
  if (shiftId) params.append("shiftId", shiftId);
  if (jobId) params.append("jobId", jobId);

  const apiRes = await fetch(`/api/job-status?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when fetching job statuses");

  const result = await apiRes.json();
  return result;
};

export { getJobStatuses, getJobStatusesByFilters };
