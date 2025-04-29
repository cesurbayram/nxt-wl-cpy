"use client";

import React, { useState, useEffect, useRef } from "react";
import { getJobContent } from "@/utils/service/monitoring/tork-examination";
import { TorkExaminationSignal } from "@/types/tork-examination.types";
import { toast } from "sonner";

interface JobContentViewerProps {
  controllerId: string;
  jobId: string | null;
  isRefreshing?: boolean;
}

interface SignalUsage {
  lineNumber: number;
  signalNumber: string;
  action: "on" | "off";
}

interface JobContentData {
  id: string;
  name: string;
  job_content: string;
  current_line?: number;
  signalUsages?: SignalUsage[];
}

const jobContentCache = new Map();

const JobContentViewer: React.FC<JobContentViewerProps> = ({
  controllerId,
  jobId,
  isRefreshing = false,
}) => {
  const [jobContent, setJobContent] = useState<JobContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineSignalMap, setLineSignalMap] = useState<
    Map<
      number,
      {
        signalNumber: string;
        action: "on" | "off";
      }
    >
  >(new Map());

  const previousJobIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (isRefreshing && jobId) {
      fetchJobContent(false);
    }
  }, [isRefreshing, jobId]);

  const fetchJobContent = async (isInitialLoad: boolean = true) => {
    if (!jobId) return;

    const cacheKey = `${controllerId}_${jobId}`;

    if (!isInitialLoad) {
      jobContentCache.delete(cacheKey);
    } else if (jobContentCache.has(cacheKey)) {
      const cachedContent = jobContentCache.get(cacheKey);
      setJobContent(cachedContent);

      if (
        cachedContent.signalUsages &&
        Array.isArray(cachedContent.signalUsages)
      ) {
        const map = new Map();
        cachedContent.signalUsages.forEach((usage: SignalUsage) => {
          map.set(usage.lineNumber, {
            signalNumber: usage.signalNumber,
            action: usage.action,
          });
        });
        setLineSignalMap(map);
      }

      previousJobIdRef.current = jobId;
      return;
    }

    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);
      const content = await getJobContent(controllerId, jobId);

      if (!isMountedRef.current) return;

      previousJobIdRef.current = jobId;

      if (isInitialLoad) {
        jobContentCache.set(cacheKey, content);
      }

      setJobContent(content);

      if (content.signalUsages && Array.isArray(content.signalUsages)) {
        const map = new Map();
        content.signalUsages.forEach((usage: SignalUsage) => {
          map.set(usage.lineNumber, {
            signalNumber: usage.signalNumber,
            action: usage.action,
          });
        });
        setLineSignalMap(map);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError("Failed to load job content");
      }
    } finally {
      if (isMountedRef.current && isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!jobId) {
      setJobContent(null);
      previousJobIdRef.current = null;
      return;
    }

    if (previousJobIdRef.current !== jobId) {
      fetchJobContent(true);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [controllerId, jobId]);

  const renderJobContent = () => {
    if (!jobContent || !jobContent.job_content) {
      return null;
    }

    const lines = jobContent.job_content.split("\n");
    let lineCount = -1;
    let isExecutableSection = false;

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine === "NOP") {
        lineCount = 0;
        isExecutableSection = true;
      } else if (trimmedLine === "END") {
        lineCount++;
        isExecutableSection = false;
      } else if (isExecutableSection) {
        lineCount++;
      }

      const signalInfo = lineSignalMap.get(lineCount);
      const hasSignal = Boolean(signalInfo);
      const isOnSignal = hasSignal && signalInfo?.action === "on";
      const isOffSignal = hasSignal && signalInfo?.action === "off";

      const signalIndicatorClass = isOnSignal
        ? "bg-green-500"
        : isOffSignal
        ? "bg-gray-300"
        : "";

      const isCurrentLine = jobContent.current_line === lineCount;
      const showLineNumber = isExecutableSection || trimmedLine === "END";
      const isExecutableOrEnd = isExecutableSection || trimmedLine === "END";

      return (
        <div
          key={index}
          className={`py-1 px-2 ${
            isExecutableOrEnd
              ? isCurrentLine
                ? "bg-yellow-100"
                : hasSignal
                ? isOnSignal
                  ? "bg-green-50"
                  : "bg-gray-50"
                : "bg-gray-50"
              : ""
          }`}
        >
          <span className="text-gray-400 mr-4 w-6 inline-block text-right">
            {showLineNumber ? lineCount : ""}
          </span>

          {hasSignal && (
            <span
              className={`w-3 h-3 rounded-full inline-block mr-2 ${signalIndicatorClass}`}
              title={`Signal ${signalInfo?.signalNumber} ${signalInfo?.action}`}
            ></span>
          )}

          <span>{line}</span>
        </div>
      );
    });
  };

  if (isLoading && !jobContent) {
    return (
      <div className="text-gray-500 text-sm mt-2 p-4 text-center">
        Loading job content...
      </div>
    );
  }

  if (error && !jobContent) {
    return <div className="text-red-500 text-sm mt-2">Error: {error}</div>;
  }

  if (!jobId) {
    return (
      <div className="text-gray-500 text-sm italic mt-2">
        Select a job to view its content
      </div>
    );
  }

  if (!jobContent) {
    return (
      <div className="text-gray-500 text-sm italic mt-2">
        No content available for the selected job
      </div>
    );
  }

  return (
    <div className="mt-0">
      <div className="font-mono text-xs border rounded-md overflow-auto max-h-[300px]">
        {renderJobContent()}
      </div>
    </div>
  );
};

export default JobContentViewer;
