import { JobSelect } from "@/types/job-select.types";

const getJobSelects = async (): Promise<JobSelect[]> => {
  try {
    const apiRes = await fetch("/api/job-select", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (apiRes.ok !== true)
      throw new Error("An error occurred when fetching job selects");

    const result = await apiRes.json();
    return result;
  } catch (error) {
    console.error("Error fetching job selects:", error);
    return [];
  }
};

const getJobSelectById = async (id: string): Promise<JobSelect | null> => {
  try {
    const apiRes = await fetch(`/api/job-select/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (apiRes.ok !== true)
      throw new Error("An error occurred when fetching job select");

    const result = await apiRes.json();
    return result;
  } catch (error) {
    console.error("Error fetching job select:", error);
    return null;
  }
};

const getJobs = async () => {
  try {
    const apiRes = await fetch("/api/job-select", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (apiRes.ok !== true)
      throw new Error("An error occurred when fetching jobs");

    const result = await apiRes.json();
    return result;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export { getJobSelects, getJobSelectById, getJobs };
