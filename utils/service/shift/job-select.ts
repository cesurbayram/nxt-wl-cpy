import {
  JobSelectData,
  JobSelectFilter,
  JobSelectResponse,
} from "@/types/job-select.types";

const getJobsByControllerAndShift = async (filter: {
  controllerId: string;
  shiftId?: string;
}): Promise<JobSelectResponse[]> => {
  try {
    const params = new URLSearchParams({
      controllerId: filter.controllerId,
    });

    if (filter.shiftId) {
      params.append("shiftId", filter.shiftId);
    }

    const response = await fetch(`/api/shift/job-select?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      next: {
        revalidate: 0,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

const sendJobSelectCommand = async (
  controllerId: string,
  shiftId?: string,
  messageType: "getJobList" = "getJobList"
): Promise<boolean> => {
  try {
    const payload: any = {
      type: "jobSelect",
      data: {
        controllerId,
        type: messageType,
      },
    };

    if (shiftId) {
      payload.data.shiftId = shiftId;
    }

    console.log("Sending job-select command:", payload);
    const apiRes = await fetch("http://savola-senddata/api/job-select-socket", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      throw new Error(
        `An error occurred when sending job-select command: ${
          errorData.error || "Unknown error"
        }`
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to send job-select command:", error);
    return false;
  }
};

export { getJobsByControllerAndShift, sendJobSelectCommand };
