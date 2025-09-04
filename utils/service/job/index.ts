import { Job } from "@/types/job.types";

const getJobsByControllerId = async (controllerId: string): Promise<Job[]> => {
  const apiRes = await fetch(`/api/controller/${controllerId}/jobs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch jobs for controller: ${controllerId}`);
  }

  const result = await apiRes.json();
  return result;
};

const getJobById = async (
  controllerId: string,
  jobId: string
): Promise<Job> => {
  const apiRes = await fetch(`/api/controller/${controllerId}/jobs/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch job details for ID: ${jobId}`);
  }

  const result = await apiRes.json();
  return result;
};

const updateJobLine = async (
  controllerId: string,
  jobId: string,
  currentLine: number
): Promise<Job> => {
  const apiRes = await fetch(`/api/controller/${controllerId}/jobs/${jobId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ current_line: currentLine }),
  });

  if (!apiRes.ok) {
    throw new Error(`Failed to update job line for ID: ${jobId}`);
  }

  const result = await apiRes.json();
  return result;
};

const sendJobCommand = async ({
  controllerId,
}: {
  controllerId: string;
}): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/job-socket`,
    {
      method: "POST",
      body: JSON.stringify({ controllerId }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending job command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

export { getJobsByControllerId, getJobById, updateJobLine, sendJobCommand };
