import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TimePicker from "./ui/time-picker";
import { BackupPlan } from "@/types/files.types";
import { createBackupPlan } from "@/utils/service/files";
import { Save } from "lucide-react";

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
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              selectedFiles: day.selectedFiles.includes(fileType)
                ? day.selectedFiles.filter((f) => f !== fileType)
                : [...day.selectedFiles, fileType],
            }
          : day
      )
    );
  };

  const handleSave = async () => {
    const selectedPlans = dayPlans.filter(
      (day) => day.isSelected && day.selectedFiles.length > 0
    );

    if (selectedPlans.length === 0) {
      alert("Please select at least one day with file types");
      return;
    }

    setIsSaving(true);

    try {
      for (const plan of selectedPlans) {
        const backupPlan = {
          name: `${plan.name} Backup Plan`,
          time: plan.time,
          days: [plan.id],
          file_types: plan.selectedFiles,
        };

        await createBackupPlan(controllerId, backupPlan);
      }

      alert("Backup plans saved successfully!");

      // Reset form
      setDayPlans((prev) =>
        prev.map((day) => ({
          ...day,
          isSelected: false,
          selectedFiles: [],
        }))
      );

      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving backup plans:", error);
      alert("Failed to save backup plans. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-4">

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      Day
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      File Types
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dayPlans.map((day) => (
                    <tr
                      key={day.id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        day.isSelected
                          ? "bg-[#6950e8] bg-opacity-5"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`day-${day.id}`}
                            checked={day.isSelected}
                            onCheckedChange={() => handleDayToggle(day.id)}
                          />
                          <label
                            htmlFor={`day-${day.id}`}
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                          >
                            {day.name}
                          </label>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <TimePicker
                          value={day.time}
                          onChange={(time) => handleTimeChange(day.id, time)}
                          disabled={!day.isSelected}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          <div className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer">
                            <Checkbox
                              checked={
                                day.selectedFiles.length === fileTypes.length
                              }
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
                              disabled={!day.isSelected}
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
                                disabled={!day.isSelected}
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
                className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors text-white font-semibold px-6 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
    </div>
  );
}
