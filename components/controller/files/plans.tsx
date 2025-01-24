import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const fileTypes = [".jbi", ".dat", ".cnd", ".prm", ".sys", ".lst"];
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
    } catch (error) {
      console.error("Plan kaydedilirken hata oluştu:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center space-x-2">
        <span>Copy plan:</span>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="device1">Device 1</SelectItem>
            <SelectItem value="device2">Device 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Day</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">File types</th>
              <th className="p-4 text-left">Tools</th>
            </tr>
          </thead>
          <tbody>
            {dayPlans.map((day) => (
              <tr key={day.id} className="border-b">
                <td className="p-4">
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
                <td className="p-4">
                  <TimePicker
                    defaultValue={day.time}
                    onChange={(time) => handleTimeChange(day.id, time)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {fileTypes.map((type) => (
                      <div
                        key={type}
                        className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer"
                        onClick={() => handleFileTypeToggle(day.id, type)}
                      >
                        <Checkbox
                          checked={day.selectedFiles.includes(type)}
                          onCheckedChange={() =>
                            handleFileTypeToggle(day.id, type)
                          }
                        />
                        <span className="text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm">
                    +
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleSave}
          disabled={
            isSaving ||
            !dayPlans.some(
              (day) => day.isSelected && day.selectedFiles.length > 0
            )
          }
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Kapat
        </Button>
      </div>
    </div>
  );
}
