import {
  TorkExaminationData,
  TorkExaminationFilter,
  UniversalOutputSignal,
} from "@/types/tork-examination.types";

const apiCache = new Map<string, any>();

const getTorkExaminationData = async (filter: {
  controllerId: string;
  duration?: number;
  jobId?: string;
  manualSignals?: string[];
}): Promise<TorkExaminationData[]> => {
  try {
    const response = await fetch(
      `/api/controller/${filter.controllerId}/monitoring/tork-examination`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filter),
        cache: "no-store",
        next: {
          revalidate: 0,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tork examination data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tork examination data:", error);
    return [];
  }
};

const getJobList = async (
  controllerId: string
): Promise<{ id: string; name: string }[]> => {
  const cacheKey = `jobs_${controllerId}`;

  apiCache.delete(cacheKey);

  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/jobs`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch job list");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("API response is not an array:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching job list:", error);
    return [];
  }
};

const getSavedSignals = async (
  controllerId: string
): Promise<{ id: string; signalNumber: string; signalState: boolean }[]> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/signals`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch saved signals");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching signals:", error);
    return [];
  }
};

const getUniversalOutputSignals = async (
  controllerId: string
): Promise<UniversalOutputSignal[]> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/signals`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tork examination signals");
    }

    const data = await response.json();
    return data.map((signal: any) => ({
      id: signal.id,
      signalNumber: signal.signal_number,
      signalState: signal.signal_state,
    }));
  } catch (error) {
    return [];
  }
};

const addSignal = async (
  controllerId: string,
  signalNumber: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/signals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signalNumber,
          signalState: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add signal");
    }

    const cacheKey = `signals_${controllerId}`;
    apiCache.delete(cacheKey);

    return true;
  } catch (error) {
    return false;
  }
};

const deleteSignal = async (
  controllerId: string,
  signalId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/signals/${signalId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete signal");
    }

    const cacheKey = `signals_${controllerId}`;
    apiCache.delete(cacheKey);

    return true;
  } catch (error) {
    return false;
  }
};

const toggleSignalState = async (
  controllerId: string,
  signalId: string,
  newState: boolean
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/signals/${signalId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signalState: newState,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to toggle signal state");
    }

    const cacheKey = `signals_${controllerId}`;
    apiCache.delete(cacheKey);

    return true;
  } catch (error) {
    return false;
  }
};

const getJobContent = async (controllerId: string, jobId: string) => {
  const cacheKey = `job_${controllerId}_${jobId}`;

  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork-examination/jobs/${jobId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch job content");
    }

    const data = await response.json();

    apiCache.set(cacheKey, data);

    return data;
  } catch (error) {
    throw new Error("Failed to fetch job content");
  }
};

const sendTorkExaminationCommand = async (
  controllerId: string,
  commandData?: {
    jobId?: string;
    jobName?: string;
    signalNumbers?: string[];
    duration?: number;
  },
  messageType: "Init" | "JobSelect" | "Start" = "Init"
): Promise<boolean> => {
  try {
    let payload: any = {
      type: "torkExam",
      data: {
        type: messageType,
        controllerId,
      },
    };

    if (messageType === "JobSelect" && commandData?.jobId) {
      const jobId = commandData.jobId;

      if (commandData.jobName) {
        console.log(
          "Using provided job name for WebSocket:",
          commandData.jobName
        );
        payload.data.values = [{ JobName: commandData.jobName }];
      } else {
        try {
          const jobResponse = await fetch(
            `/api/controller/${controllerId}/monitoring/tork-examination/jobs/job-name?jobId=${jobId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            const jobName = jobData.job_name;

            console.log("Sending job name to WebSocket:", jobName);
            payload.data.values = [{ JobName: jobName }];
          } else {
            console.warn("Couldn't fetch job name, using job ID instead");
            payload.data.values = [{ JobName: jobId }];
          }
        } catch (error) {
          console.error("Error fetching job name:", error);

          payload.data.values = [{ JobName: jobId }];
        }
      }
    } else if (messageType === "Start") {
      console.log("Start command:", commandData);
      payload.data.values = [
        {
          duration: commandData?.duration || 5,
          jobName: commandData?.jobName,
          signalNumbers: commandData?.signalNumbers,
        },
      ];
    }

    console.log("Sending to tork-examination socket:", payload);

    const apiRes = await fetch(
      "https://savola-senddata.fabricademo.com/api/tork-examination-socket",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      throw new Error(
        `An error occurred when sending tork-examination command: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to send tork-examination command:", error);
    return false;
  }
};

const getSavedTorkExaminationData = async (
  controllerId: string,
  sessionId?: string
): Promise<TorkExaminationData[]> => {
  try {
    let url = `/api/controller/${controllerId}/monitoring/tork-examination/data`;
    if (sessionId) {
      url += `?sessionId=${sessionId}`;
    }

    const response = await fetch(url, {
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
      throw new Error("Failed to fetch saved tork examination data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching saved tork data:", error);
    return [];
  }
};

export {
  getTorkExaminationData,
  getJobList,
  getSavedSignals,
  getUniversalOutputSignals,
  addSignal,
  deleteSignal,
  toggleSignalState,
  getJobContent,
  sendTorkExaminationCommand,
  getSavedTorkExaminationData,
};
