"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TorkExaminationFilter,
  TorkExaminationData,
  TorkExaminationSignal,
} from "@/types/tork-examination.types";
import {
  getTorkExaminationData,
  getJobList,
  getJobContent,
  getSavedSignals,
  sendTorkExaminationCommand,
  getSavedTorkExaminationData,
} from "@/utils/service/monitoring/tork-examination";
import DateTimeRangePicker from "./date-time-range-picker";
import JobSelector from "./job-selector";
import SignalInput from "./signal-input";
import TorkExaminationChart from "./tork-examination-chart";
import { toast } from "sonner";
import LoadingUi from "@/components/shared/loading-ui";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import JobContentViewer from "./job-content-viewer";
import Timer from "@/components/shared/timer";
import { RxCountdownTimer } from "react-icons/rx";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { RefreshCw } from "lucide-react";

export enum QueryMode {
  DATE_ONLY = "date-only",
  DATE_JOB = "date-job",
  DATE_JOB_SIGNALS = "date-job-signals",
}

interface TorkExaminationProps {
  controllerId: string;
}

const TorkExamination: React.FC<TorkExaminationProps> = ({ controllerId }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedSignals, setSavedSignals] = useState<TorkExaminationSignal[]>([]);
  const [jobContent, setJobContent] = useState<any>(null);
  const initMessageSent = useRef(false);
  const [autoUpdateTime, setAutoUpdateTime] = useState(true);
  const [isRefreshingSignals, setIsRefreshingSignals] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!autoUpdateTime) return;

    const interval = setInterval(() => {
      setFilter((prev) => ({
        ...prev,
        startTime: getCurrentTime(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [autoUpdateTime]);

  const [filter, setFilter] = useState<TorkExaminationFilter>({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    duration: 5,
    controllerId,
    startTime: getCurrentTime(),
    endTime: "",
    manualSignals: [],
  });

  const [examinationData, setExaminationData] = useState<TorkExaminationData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [queryMode, setQueryMode] = useState<QueryMode>(QueryMode.DATE_ONLY);

  const [lastUpdatedStartTime, setLastUpdatedStartTime] = useState<string>("");
  const [lastUpdatedDuration, setLastUpdatedDuration] = useState<number>(0);

  const currentSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (
      filter.startTime === lastUpdatedStartTime &&
      filter.duration === lastUpdatedDuration
    ) {
      return;
    }

    if (!filter.startTime) return;

    setLastUpdatedStartTime(filter.startTime);
    setLastUpdatedDuration(filter.duration);

    calculateEndTime();
  }, [filter.startTime, filter.duration]);

  useEffect(() => {
    const currentMode = queryMode;
    let newMode = QueryMode.DATE_ONLY;

    if (filter.jobId && savedSignals.length > 0) {
      newMode = QueryMode.DATE_JOB_SIGNALS;
    } else if (filter.jobId) {
      newMode = QueryMode.DATE_JOB;
    }

    if (currentMode !== newMode) {
      setQueryMode(newMode);
    }
  }, [filter.jobId, savedSignals.length]);

  useEffect(() => {
    fetchJobs();

    if (!initMessageSent.current) {
      sendTorkExaminationCommand(controllerId, undefined, "Init");
      initMessageSent.current = true;
    }
  }, [controllerId]);

  useEffect(() => {
    if (filter.jobId) {
    } else {
      setJobContent(null);
    }
  }, [filter.jobId]);

  const handleSavedSignalsChange = (signals: TorkExaminationSignal[]) => {
    setSavedSignals(signals);
    const signalNumbers = signals.map((signal) =>
      signal.signalNumber.toString()
    );
    setFilter((prev) => ({
      ...prev,
      manualSignals: signalNumbers,
    }));
  };

  const fetchJobs = async () => {
    try {
      const response = await getJobList(controllerId);

      if (Array.isArray(response)) {
        setJobs(response);
      } else {
        console.error("Invalid job list response format");
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load job list");
    }
  };

  const handleDateRangeChange = (
    startDate: string,
    endDate: string,
    duration: number
  ) => {
    setFilter((prev) => ({
      ...prev,
      startDate,
      endDate,
      duration,
    }));
  };

  const handleStartTimeChange = (startTime: string) => {
    setFilter((prev) => ({
      ...prev,
      startTime,
    }));
  };

  const handleJobSelect = (jobId: string) => {
    if (filter.jobId === jobId) return;

    const selectedJob = jobs.find((job) => job.id === jobId);

    sendTorkExaminationCommand(
      controllerId,
      {
        jobId: jobId,
        jobName: selectedJob?.name,
      },
      "JobSelect"
    );

    setFilter((prev: TorkExaminationFilter) => ({
      ...prev,
      jobId,
    }));

    loadJobContent(jobId);
  };

  const loadJobContent = async (jobId: string) => {
    if (!jobId) return;

    try {
      const content = await getJobContent(controllerId, jobId);
      setJobContent(content);
    } catch (error) {
      console.error("Error loading job content:", error);
      toast.error("Failed to load job content");
    }
  };

  const refreshTorkData = async () => {
    console.log(
      "Timer tetiklendi: veri güncelleniyor...",
      new Date().toISOString()
    );

    setIsRefreshingSignals(true);

    try {
      if (savedSignals.length > 0) {
        const updatedSignals = await getSavedSignals(controllerId);

        if (updatedSignals.length > 0) {
          const formattedSignals = updatedSignals.map((signal: any) => {
            return {
              id: signal.id,
              signalNumber: signal.signal_number || signal.signalNumber || "",
              signalState:
                signal.signal_state === true || signal.signalState === true,
              controller_id: signal.controller_id || controllerId,
              displayNumber: parseInt(
                signal.signal_number || signal.signalNumber || "0",
                10
              ),
            };
          });

          setSavedSignals(formattedSignals);
        }
      }

      const data = await getSavedTorkExaminationData(controllerId);

      if (data && data.length > 0) {
        console.log(`${data.length} yeni veri yüklendi`);
        setExaminationData(data);
      } else {
        console.log("Veri bulunamadı");
      }
    } catch (error) {
      console.error("Error refreshing tork data:", error);
    } finally {
      setTimeout(() => {
        setIsRefreshingSignals(false);
      }, 300);
    }
  };

  const handleSearch = async (isInitialLoad: boolean = true) => {
    const signalNumbers = savedSignals.map((signal) => signal.signalNumber);

    let commandData: any = {
      duration: filter.duration,
    };

    if (filter.jobId) {
      commandData.jobId = filter.jobId;

      const selectedJob = jobs.find((job) => job.id === filter.jobId);
      if (selectedJob && selectedJob.name) {
        commandData.jobName = selectedJob.name;
      }
    }

    if (signalNumbers.length > 0) {
      commandData.signalNumbers = signalNumbers;
    }

    await sendTorkExaminationCommand(controllerId, commandData, "Start");

    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      let modeDescription = "";
      switch (queryMode) {
        case QueryMode.DATE_ONLY:
          modeDescription = "for selected time range";
          break;
        case QueryMode.DATE_JOB:
          modeDescription = `for job "${
            jobs.find((j) => j.id === filter.jobId)?.name || filter.jobId
          }"`;
          break;
        case QueryMode.DATE_JOB_SIGNALS:
          modeDescription = `for job "${
            jobs.find((j) => j.id === filter.jobId)?.name || filter.jobId
          }" with selected signals`;
          break;
      }

      const apiFilter = {
        controllerId: filter.controllerId,
        duration: filter.duration,
        jobId: filter.jobId,
        manualSignals: filter.manualSignals,
      };

      const response = await getTorkExaminationData(apiFilter);

      if ("status" in response && response.status === "no_data") {
        setExaminationData([]);
        if (isInitialLoad) {
          toast.info(
            `No data found ${modeDescription}. Please check if there is any tork data in the database for this controller and time range.`
          );
        }
        return;
      }

      if (response.length > 0 && response[0].sessionId) {
        currentSessionId.current = response[0].sessionId;
      }

      setExaminationData(response as TorkExaminationData[]);

      if (response.length === 0) {
        if (isInitialLoad) {
          toast.info(`No data found ${modeDescription}`);
        }
      } else {
        if (isInitialLoad) {
          toast.success(
            `Loaded ${response.length} data points ${modeDescription}`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching examination data:", error);
      if (isInitialLoad) {
        toast.error(
          "Failed to load examination data. Check console for details."
        );
      }
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  const calculateEndTime = () => {
    if (!filter.startTime) return;

    const [hours, minutes, seconds] = filter.startTime.split(":").map(Number);

    const startDateTime = new Date();
    startDateTime.setHours(hours || 0, minutes || 0, seconds || 0);

    const endDateTime = new Date(
      startDateTime.getTime() + filter.duration * 60 * 1000
    );

    const endHours = endDateTime.getHours().toString().padStart(2, "0");
    const endMinutes = endDateTime.getMinutes().toString().padStart(2, "0");
    const endSeconds = endDateTime.getSeconds().toString().padStart(2, "0");

    const endTimeString = `${endHours}:${endMinutes}:${endSeconds}`;

    if (filter.endTime === endTimeString) return;

    setFilter((prev) => ({
      ...prev,
      endTime: endTimeString,
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Tork Examination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <DateTimeRangePicker
                startDate={filter.startDate}
                endDate={filter.endDate}
                duration={filter.duration}
                onChange={handleDateRangeChange}
                startTime={filter.startTime}
                onStartTimeChange={handleStartTimeChange}
                endTime={filter.endTime}
              />
              <Toggle
                pressed={autoUpdateTime}
                onPressedChange={setAutoUpdateTime}
                size="sm"
                className="ml-2"
                aria-label="Otomatik zaman güncelleme"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    autoUpdateTime
                      ? "text-green-500 animate-spin"
                      : "text-gray-400"
                  }`}
                />
              </Toggle>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <JobSelector
                  jobs={jobs}
                  selectedJobId={filter.jobId}
                  onSelect={handleJobSelect}
                />

                {filter.jobId && jobContent && (
                  <JobContentViewer
                    controllerId={controllerId}
                    jobId={filter.jobId}
                  />
                )}
              </div>

              <div>
                <SignalInput
                  controllerId={controllerId}
                  onSignalChange={handleSavedSignalsChange}
                  isRefreshing={isRefreshingSignals}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                onClick={() => handleSearch(true)}
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingUi isLoading={true} />
                    Fetching data...
                  </>
                ) : (
                  <>
                    <RxCountdownTimer className="h-4 w-4" />
                    Analyze Tork Data
                  </>
                )}
              </Button>

              <Timer callback={refreshTorkData} />
            </div>
          </div>
        </CardContent>
      </Card>

      {examinationData.length > 0 && (
        <TorkExaminationChart
          data={examinationData}
          showSignals={savedSignals.length > 0}
          queryMode={queryMode}
          isRefreshing={isRefreshingSignals}
        />
      )}
    </div>
  );
};

export default TorkExamination;
