"use client";

import { useState, useEffect, useRef } from "react";
import { Job } from "@/types/job.types";
import { getJobsByControllerId, sendJobCommand } from "@/utils/service/job";

interface JobTabProps {
  controllerId: string;
}

const JobComponent = ({ controllerId }: JobTabProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  const sendJobRequest = async (controllerId: string) => {
    try {
      await sendJobCommand({ controllerId });
    } catch (error) {
      console.error("Failed to send command to controller: ", error);
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      sendJobRequest(controllerId);
    }
    const fetchJobs = async () => {
      try {
        const data = await getJobsByControllerId(controllerId);
        setJobs(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Error loading jobs");
        setJobs([]);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [controllerId]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* Sol Panel - Job Listesi */}
      <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="text-sm font-medium dark:text-white">Jobs</div>
        </div>
        <div className="p-2">
          {error ? (
            <div className="text-red-500 p-3">{error}</div>
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

      {/* Sağ Panel - Job İçeriği */}
      <div className="col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        {selectedJob ? (
          <div className="p-4">
            <div className="mb-4">
              <div className="text-sm font-medium dark:text-white">
                {selectedJob.job_name}
              </div>
            </div>
            <div className="font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto h-[400px] border border-gray-200 dark:border-gray-700">
              {selectedJob.job_content.split("\n").map((line, index) => (
                <div
                  key={index}
                  className={`py-1 px-2 ${
                    index + 1 === selectedJob.current_line
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : ""
                  }`}
                >
                  <span className="text-gray-400 dark:text-gray-500 mr-4">
                    {index + 1}
                  </span>
                  <span className="dark:text-gray-200">{line}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a job from the left panel
          </div>
        )}
      </div>
    </div>
  );
};

export default JobComponent;
