import { SystemInfoResponse } from "@/types/system-info.types";

const fetchSystemData = async (
  controllerId: string,
  fileName: string = "SYSTEM.SYS"
): Promise<{ success: boolean; message?: string; error?: string }> => {
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
      throw new Error(`Failed to fetch system data: ${errorText}`);
    }

    const responseText = await response.text();
    console.log("GeneralFileSave response:", responseText);

    return {
      success: true,
      message: "System data request sent successfully",
    };
  } catch (error) {
    console.error("Error fetching system data:", error);
    return {
      success: false,
      error: `Failed to fetch system data: ${error}`,
    };
  }
};

const getSystemFileContent = async (
  controllerId: string
): Promise<SystemInfoResponse> => {
  try {
    const response = await fetch(`/api/system-info/read-file/${controllerId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        content: null,
        error: errorData.error || "Failed to fetch system file content",
        debug: errorData.debug,
      };
    }

    const data = await response.json();

    if (!data.content) {
      return {
        success: false,
        content: null,
        error: data.message || "No system data available",
        debug: data.debug,
      };
    }

    return {
      success: true,
      content: data.content,
      fileName: data.fileName,
      lastModified: data.lastModified ? new Date(data.lastModified) : undefined,
      message: data.message || "File loaded successfully",
    };
  } catch (error) {
    console.error("Error fetching system file content:", error);
    return {
      success: false,
      content: null,
      error: `Failed to fetch system file content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

const calculateSystemStats = (content: string) => {
  if (!content) {
    return { lines: 0, size: 0 };
  }

  return {
    lines: content.split("\n").length,
    size: new Blob([content]).size,
  };
};

const copySystemContentToClipboard = async (
  content: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

export {
  fetchSystemData,
  getSystemFileContent,
  calculateSystemStats,
  copySystemContentToClipboard,
};
