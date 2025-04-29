"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JobSelectorProps {
  jobs: { id: string; name: string }[];
  selectedJobId?: string;
  onSelect: (jobId: string) => void;
}

const JobSelector: React.FC<JobSelectorProps> = ({
  jobs,
  selectedJobId,
  onSelect,
}) => {
  const hasJobs = Array.isArray(jobs) && jobs.length > 0;

  return (
    <div className="space-y-1">
      <Label htmlFor="job-select" className="text-sm">
        Select Job
      </Label>
      <Select value={selectedJobId} onValueChange={(value) => onSelect(value)}>
        <SelectTrigger id="job-select" className="h-9 text-sm">
          <SelectValue placeholder="Select a job" />
        </SelectTrigger>
        <SelectContent>
          {hasJobs ? (
            <ScrollArea className="h-[200px]">
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.name}
                </SelectItem>
              ))}
            </ScrollArea>
          ) : (
            <div className="py-2 px-4 text-xs text-gray-500">No jobs found</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default JobSelector;
