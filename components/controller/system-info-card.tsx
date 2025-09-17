"use client";
import { useState, useEffect } from "react";
import { SystemInfoState } from "@/types/system-info.types";
import {
  fetchSystemData,
  getSystemFileContent,
  calculateSystemStats,
  copySystemContentToClipboard,
} from "@/utils/service/system-info/system-info";

interface SystemInfoCardProps {
  controllerId: string;
}

const SystemInfoCard = ({ controllerId }: SystemInfoCardProps) => {
  const [systemState, setSystemState] = useState<SystemInfoState>({
    content: "",
    isLoading: false,
  });

  useEffect(() => {
    if (controllerId) {
      handleLoadSystemFile();
    }
  }, [controllerId]);

  const handleLoadSystemFile = async () => {
    try {
      const response = await getSystemFileContent(controllerId);

      if (response.success && response.content) {
        setSystemState((prev) => ({
          ...prev,
          content: response.content || "",
          lastUpdated: response.lastModified || new Date(),
          stats: response.content
            ? calculateSystemStats(response.content)
            : undefined,
        }));
      } else {
        console.error("Failed to load system file:", response.error);
        setSystemState((prev) => ({
          ...prev,
          content: "",
        }));
      }
    } catch (error) {
      console.error("Error loading system file:", error);
      setSystemState((prev) => ({
        ...prev,
        content: "",
      }));
    }
  };

  const handleFetchSystemInfo = async () => {
    setSystemState((prev) => ({ ...prev, isLoading: true }));

    try {
      const fetchResult = await fetchSystemData(controllerId);

      if (fetchResult.success) {
        setTimeout(async () => {
          const response = await getSystemFileContent(controllerId);

          setSystemState((prev) => ({
            ...prev,
            content: response.content || "",
            isLoading: false,
            lastUpdated: new Date(),
            stats: response.content
              ? calculateSystemStats(response.content)
              : undefined,
          }));
        }, 3000);
      } else {
        console.error("Failed to fetch system data:", fetchResult.error);
        setSystemState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching system info:", error);
      setSystemState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const handleCopyToClipboard = async () => {
    const success = await copySystemContentToClipboard(systemState.content);
    if (success) {
      console.log("Copied to clipboard successfully");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            System Information
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            disabled={!systemState.content}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy to Clipboard"
          >
            Copy
          </button>
          <button
            onClick={handleFetchSystemInfo}
            disabled={systemState.isLoading}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {systemState.isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-inner">
        {systemState.content ? (
          <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[500px] text-gray-800 leading-relaxed scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {systemState.content}
          </pre>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm">No system data available</p>
              <p className="text-xs mt-1">
                Click "Update" to fetch SYSTEM.SYS file
              </p>
            </div>
          </div>
        )}
      </div>
      {systemState.stats && (
        <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
          <span>Lines: {systemState.stats.lines}</span>
          <span>Size: {systemState.stats.size} bytes</span>
          {systemState.lastUpdated && (
            <span>Updated: {systemState.lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemInfoCard;
