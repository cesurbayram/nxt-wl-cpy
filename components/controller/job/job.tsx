"use client";

import { useState, useEffect } from "react";
import { Job } from "@/types/job.types";
import { getJobsByControllerId } from "@/utils/service/job";

interface JobTabProps {
  controllerId: string;
}

const JobComponent = ({ controllerId }: JobTabProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobsByControllerId(controllerId);
        setJobs(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Jobs yüklenirken bir hata oluştu");
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
      <div className="col-span-4 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Jobs</h2>
        </div>
        <div className="p-2">
          {error ? (
            <div className="text-red-500 p-3">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-gray-500 p-3">Henüz job bulunmuyor</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-3 rounded-md cursor-pointer mb-2 ${
                  selectedJob?.id === job.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <div className="font-medium">{job.job_name}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ Panel - Job İçeriği */}
      <div className="col-span-8 bg-white rounded-lg shadow">
        {selectedJob ? (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">{selectedJob.job_name}</h3>
            </div>
            <div className="font-mono bg-gray-50 p-4 rounded-lg overflow-auto h-[400px] border border-gray-200">
              {selectedJob.job_content.split("\n").map((line, index) => (
                <div
                  key={index}
                  className={`py-1 px-2 ${
                    index + 1 === selectedJob.current_line
                      ? "bg-yellow-100"
                      : ""
                  }`}
                >
                  <span className="text-gray-400 mr-4">{index + 1}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Sol panelden bir job seçin
          </div>
        )}
      </div>
    </div>
  );
};

export default JobComponent;
