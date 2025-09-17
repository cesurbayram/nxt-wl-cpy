"use client";

import { useState, useEffect, useRef } from "react";
import { Job } from "@/types/job.types";
import { getJobsByControllerId, sendJobCommand } from "@/utils/service/job";
import Timer from "@/components/shared/timer";

interface JobTabProps {
  controllerId: string;
}

const JobComponent = ({ controllerId }: JobTabProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFirstRender = useRef(true);

  const findExecutableLines = (content: string) => {
    const lines = content.split("\n");
    const executableLines: number[] = [];
    let isExecutableSection = false;
    let lineCount = -1;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine === "NOP") {
        isExecutableSection = true;
        lineCount = 0;
        executableLines.push(lineCount);
      } else if (trimmedLine === "END") {
        isExecutableSection = false;
        executableLines.push(lineCount + 1);
      } else if (isExecutableSection) {
        lineCount++;
        executableLines.push(lineCount);
      }
    });

    return executableLines;
  };

  const sendJobRequest = async (controllerId: string) => {
    try {
      await sendJobCommand({ controllerId });
    } catch (error) {
      console.error("Failed to send command to controller: ", error);
    }
  };

  const fetchJobs = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      const data = await getJobsByControllerId(controllerId);
      setJobs(data);

      if (!selectedJob && data.length > 0) {
        setSelectedJob(data[0]);
      } else if (selectedJob) {
        const updatedSelectedJob = data.find(
          (job) => job.id === selectedJob.id
        );
        setSelectedJob(updatedSelectedJob || data[0]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err as Error);
      setJobs([]);
      setSelectedJob(null);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      sendJobRequest(controllerId);
      fetchJobs(true);
    }
  }, [controllerId]);

  const renderJobContent = () => {
    if (!selectedJob) return null;

    const lines = selectedJob.job_content.split("\n");
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

      const isCurrentLine = selectedJob.current_line === lineCount;
      const showLineNumber = isExecutableSection || trimmedLine === "END";
      const isExecutableOrEnd = isExecutableSection || trimmedLine === "END";

      return (
        <div
          key={index}
          className={`py-1 px-2 ${
            isExecutableOrEnd
              ? isCurrentLine
                ? "bg-yellow-100 dark:bg-yellow-900"
                : "bg-gray-50 dark:bg-gray-800"
              : ""
          }`}
        >
          <span className="text-gray-400 dark:text-gray-500 mr-4">
            {showLineNumber ? lineCount : ""}
          </span>
          <span className="dark:text-gray-200">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full">
      <div className="lg:lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="text-sm font-medium dark:text-white">Jobs</div>
        </div>
        <div className="p-2">
          {error ? (
            <div className="text-red-500 p-3">{error.message}</div>
          ) : jobs.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 p-3">
              No jobs found yet
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-3 rounded-md cursor-pointer mb-2 ${
                  selectedJob?.id === job.id
                    ? "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="text-sm font-medium dark:text-white">
                  {job.job_name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <Timer callback={() => fetchJobs(false)} />
            </div>

            {isLoading ? (
              <p>Loading...</p>
            ) : selectedJob ? (
              <div>
                <div className="mb-4">
                  <div className="text-sm font-medium dark:text-white">
                    {selectedJob.job_name}
                  </div>
                </div>
                <div className="font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto h-[400px] border border-gray-200 dark:border-gray-700">
                  {renderJobContent()}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a job from the left panel
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobComponent;
