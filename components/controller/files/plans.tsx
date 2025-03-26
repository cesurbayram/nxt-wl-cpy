import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TimePicker from "./ui/time-picker";
import { BackupPlan } from "@/types/files.types";
import { createBackupPlan } from "@/utils/service/files";
import { Save, Clock, Database } from "lucide-react";

interface PlansProps {
  controllerId: string;
  plans: BackupPlan[];
  isLoading?: boolean;
  onClose?: () => void;
}

interface DayPlan {
  id: number;
  name: string;
  isSelected: boolean;
  time: string;
  selectedFiles: string[];
}

export default function Plans({
  controllerId,
  plans,
  isLoading,
  onClose,
}: PlansProps) {
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([
    {
      id: 1,
      name: "Monday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
    {
      id: 2,
      name: "Tuesday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
    {
      id: 3,
      name: "Wednesday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
    {
      id: 4,
      name: "Thursday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
    {
      id: 5,
      name: "Friday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
    {
      id: 6,
      name: "Saturday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
    {
      id: 7,
      name: "Sunday",
      isSelected: false,
      time: "00:00",
      selectedFiles: [],
    },
  ]);

  const fileTypes = [
    "CMOS",
    ".jbi",
    ".dat",
    ".cnd",
    ".prm",
    ".sys",
    ".lst",
    ".log",
  ];
  const [isSaving, setIsSaving] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantSelectedFiles, setInstantSelectedFiles] = useState<string[]>(
    []
  );

  const handleDayToggle = (dayId: number) => {
    setDayPlans((prev) =>
      prev.map((day) =>
        day.id === dayId ? { ...day, isSelected: !day.isSelected } : day
      )
    );
  };

  const handleTimeChange = (dayId: number, time: string) => {
    setDayPlans((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, time } : day))
    );
  };

  const handleFileTypeToggle = (dayId: number, fileType: string) => {
    setDayPlans((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const selectedFiles = day.selectedFiles.includes(fileType)
            ? day.selectedFiles.filter((f) => f !== fileType)
            : [...day.selectedFiles, fileType];
          return { ...day, selectedFiles };
        }
        return day;
      })
    );
  };

  const handleInstantFileToggle = (fileType: string) => {
    setInstantSelectedFiles((prev) =>
      prev.includes(fileType)
        ? prev.filter((f) => f !== fileType)
        : [...prev, fileType]
    );
  };

  const handleInstantSelectAll = () => {
    setInstantSelectedFiles(
      instantSelectedFiles.length === fileTypes.length ? [] : [...fileTypes]
    );
  };

  const handleInstantSave = async () => {
    try {
      if (!controllerId) {
        throw new Error("Controller ID is required");
      }

      if (instantSelectedFiles.length === 0) {
        alert("Please select at least one file type");
        return;
      }

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
      setShowInstantModal(false);
      setInstantSelectedFiles([]);

      onClose?.();
    } catch (error) {
      console.error("Instant backup creation error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving with Controller ID:", controllerId);

      if (!controllerId) {
        throw new Error("Controller ID is required");
      }

      setIsSaving(true);

      const selectedPlans = dayPlans
        .filter((day) => day.isSelected && day.selectedFiles.length > 0)
        .map((day) => ({
          name: `${day.name} Backup`,
          days: [day.id],
          time: day.time,
          file_types: day.selectedFiles,
        }));

      for (const plan of selectedPlans) {
        try {
          await createBackupPlan(controllerId, plan);
        } catch (error) {
          console.error("Plan oluşturma hatası:", error);
          throw error;
        }
      }

      setDayPlans((prev) =>
        prev.map((day) => ({
          ...day,
          isSelected: false,
          selectedFiles: [],
        }))
      );

      onClose?.();
    } catch (error) {
      console.error("Plan kaydedilirken hata oluştu:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          onClick={() => setShowInstantModal(true)}
          variant="outline"
          className="rounded-xl bg-[#6950e8] bg-opacity-10 hover:bg-opacity-20 transition-colors text-[#6950e8] font-semibold px-6 py-1.5 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Instant Backup
        </Button>
      </div>

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

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Select File Types:</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer">
                  <Checkbox
                    checked={instantSelectedFiles.length === fileTypes.length}
                    onCheckedChange={handleInstantSelectAll}
                  />
                  <span className="text-xs">All</span>
                </div>

                {fileTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={instantSelectedFiles.includes(type)}
                      onCheckedChange={() => handleInstantFileToggle(type)}
                    />
                    <span className="text-xs">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowInstantModal(false);
                  setInstantSelectedFiles([]);
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInstantSave}
                disabled={isSaving || instantSelectedFiles.length === 0}
                variant="default"
                className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors text-white font-semibold flex items-center gap-2"
                size="sm"
              >
                {isSaving ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Create Backup
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Day
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Time
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 pl-8">
                File Types
              </th>
            </tr>
          </thead>
          <tbody>
            {dayPlans.map((day) => (
              <tr key={day.id} className="border-b">
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={day.isSelected}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <label
                      htmlFor={`day-${day.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.name}
                    </label>
                  </div>
                </td>
                <td className="p-2">
                  <TimePicker
                    defaultValue={day.time}
                    onChange={(time) => handleTimeChange(day.id, time)}
                  />
                </td>
                <td className="p-2 pl-8">
                  <div className="flex flex-wrap gap-1">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer">
                      <Checkbox
                        checked={day.selectedFiles.length === fileTypes.length}
                        onCheckedChange={() => {
                          const shouldSelectAll =
                            day.selectedFiles.length !== fileTypes.length;
                          setDayPlans((prev) =>
                            prev.map((d) =>
                              d.id === day.id
                                ? {
                                    ...d,
                                    selectedFiles: shouldSelectAll
                                      ? [...fileTypes]
                                      : [],
                                  }
                                : d
                            )
                          );
                        }}
                      />
                      <span className="text-xs">All</span>
                    </div>
                    {fileTypes.map((type) => (
                      <div
                        key={type}
                        className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={day.selectedFiles.includes(type)}
                          onCheckedChange={(checked) => {
                            setDayPlans((prev) =>
                              prev.map((d) =>
                                d.id === day.id
                                  ? {
                                      ...d,
                                      selectedFiles: checked
                                        ? [...d.selectedFiles, type]
                                        : d.selectedFiles.filter(
                                            (t) => t !== type
                                          ),
                                    }
                                  : d
                              )
                            );
                          }}
                        />
                        <span className="text-xs">{type}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-2">
        <Button
          onClick={handleSave}
          disabled={
            isSaving ||
            !dayPlans.some(
              (day) => day.isSelected && day.selectedFiles.length > 0
            )
          }
          variant="default"
          className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors text-white font-semibold px-6 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
