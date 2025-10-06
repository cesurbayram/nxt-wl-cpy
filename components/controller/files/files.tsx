"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Plans from "./plans";
import PlansList from "./plans-list";
import FilesBackupHistory from "./backup-history";
import { useState, useEffect } from "react";
import { getBackupPlans, createBackupPlan } from "@/utils/service/files";
import LoadingUi from "@/components/shared/loading-ui";
import { BackupPlan } from "@/types/files.types";
import { Clock, Database } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FilesProps {
  controllerId: string;
}

export function Files({ controllerId }: FilesProps) {
  const [plans, setPlans] = useState<BackupPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantSelectedFiles, setInstantSelectedFiles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileTypes = [
    { label: "All", value: "all" },
    { label: "CMOS", value: "cmos" },
    { label: ".jbi", value: "jbi" },
    { label: ".dat", value: "dat" },
    { label: ".cnd", value: "cnd" },
    { label: ".prm", value: "prm" },
    { label: ".sys", value: "sys" },
    { label: ".lst", value: "lst" },
    { label: ".log", value: "log" },
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const data = await getBackupPlans(controllerId);
        setPlans(data);
      } catch (error) {
        console.error("Error fetching backup plans:", error);
      }
      setIsLoading(false);
    };

    fetchPlans();
  }, [controllerId]);

  const handleInstantFileToggle = (fileType: string) => {
    if (fileType === "all") {
      if (instantSelectedFiles.length === fileTypes.length - 1) {
        setInstantSelectedFiles([]);
      } else {
        setInstantSelectedFiles(
          fileTypes.filter((f) => f.value !== "all").map((f) => f.value)
        );
      }
    } else {
      setInstantSelectedFiles((prev) =>
        prev.includes(fileType)
          ? prev.filter((f) => f !== fileType)
          : [...prev, fileType]
      );
    }
  };

  const handleInstantSave = async () => {
    if (instantSelectedFiles.length === 0) {
      alert("Please select at least one file type for instant backup");
      return;
    }

    try {
      setIsSaving(true);

      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);

      const dayId = now.getDay() === 0 ? 7 : now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = dayNames[now.getDay()];

      const instantPlan = {
        name: `Instant Backup ${dayName}`,
        days: [dayId],
        time: currentTime,
        file_types: instantSelectedFiles,
      };

      await createBackupPlan(controllerId, instantPlan);

      alert(
        `Instant backup plan created successfully for ${instantSelectedFiles.join(
          ", "
        )} - scheduled for ${currentTime}`
      );

      setShowInstantModal(false);
      setInstantSelectedFiles([]);
    } catch (error) {
      console.error("Error creating instant backup plan:", error);
      alert("Failed to create instant backup plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <LoadingUi isLoading={isLoading} />
      <Tabs defaultValue="create" className="w-full">
        {/* Header with Tabs and Instant Backup Button */}
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <TabsList className="flex h-fit border-2 gap-1">
            <TabsTrigger value="create" className="whitespace-nowrap px-4">
              Create Plan
            </TabsTrigger>
            <TabsTrigger value="list" className="whitespace-nowrap px-4">
              Plan List
            </TabsTrigger>
            <TabsTrigger value="history" className="whitespace-nowrap px-4">
              Backup History
            </TabsTrigger>
          </TabsList>

          <button
            onClick={() => setShowInstantModal(true)}
            className="rounded-xl bg-[#6950e8] bg-opacity-10 hover:bg-opacity-20 transition-colors text-[#6950e8] font-semibold px-6 py-2 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Instant Backup
          </button>
        </div>

        {/* Content */}
        <div className="w-full">
          <TabsContent value="create">
            <Card>
              <CardContent className="pt-6">
                <Plans
                  controllerId={controllerId}
                  plans={plans}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <PlansList controllerId={controllerId} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6">
                <FilesBackupHistory controllerId={controllerId} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Instant Backup Modal */}
      {showInstantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-[#6950e8]" />
              <h3 className="text-lg font-semibold">Instant Backup</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Creating backup for today ({new Date().toLocaleDateString()}) at
              current time (
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              )
            </p>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Select File Types:</h4>
              <div className="space-y-2">
                {fileTypes.map((fileType) => (
                  <div key={fileType.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`instant-${fileType.value}`}
                      checked={
                        fileType.value === "all"
                          ? instantSelectedFiles.length ===
                            fileTypes.length - 1
                          : instantSelectedFiles.includes(fileType.value)
                      }
                      onCheckedChange={() =>
                        handleInstantFileToggle(fileType.value)
                      }
                    />
                    <label
                      htmlFor={`instant-${fileType.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {fileType.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowInstantModal(false);
                  setInstantSelectedFiles([]);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleInstantSave}
                disabled={isSaving || instantSelectedFiles.length === 0}
                className="rounded-xl bg-[#6950e8] text-white px-6 py-2 hover:bg-[#592be7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Create Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Files;
