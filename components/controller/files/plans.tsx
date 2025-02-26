import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TimePicker from "./ui/time-picker";
import { BackupPlan } from "@/types/files.types";
import { createBackupPlan } from "@/utils/service/files";

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
      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left text-sm font-medium">Day</th>
              <th className="p-2 text-left text-sm font-medium">Time</th>
              <th className="p-2 text-left text-sm font-medium pl-8">
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
                    {/* All seçeneği */}
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
