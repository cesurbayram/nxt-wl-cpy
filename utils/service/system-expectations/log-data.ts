import { toast } from "sonner";
import { FileSaveLogEntry } from "@/types/file-save-log.types";
import {
  GeneralFileSaveRequest,
  GeneralFileSaveResult,
} from "@/types/log-data.types";

const fetchLogData = async (
  controllerId: string,
  fileName: string = "LOGDATA.DAT"
): Promise<GeneralFileSaveResult> => {
  try {
    console.log("Sending GeneralFileSave request:", { controllerId, fileName });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-file-save-socket`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          controllerId,
          fileName,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch log data: ${errorText}`);
    }

    const responseText = await response.text();
    console.log("GeneralFileSave response:", responseText);

    return {
      success: true,
      message: "Log data request sent successfully",
    };
  } catch (error) {
    console.error("Error fetching log data:", error);
    return {
      success: false,
      error: `Failed to fetch log data: ${error}`,
    };
  }
};

const getFileSaveHistory = async (
  controllerId: string
): Promise<FileSaveLogEntry[]> => {
  try {
    const response = await fetch(
      `/api/system-expectations/cmos-backup/file-save-history/${controllerId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch file save history");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching file save history:", error);
    throw error;
  }
};

export { fetchLogData, getFileSaveHistory };
