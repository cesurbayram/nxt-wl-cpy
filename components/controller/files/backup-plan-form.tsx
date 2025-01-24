import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import TimePicker from "./ui/time-picker";
import { BackupPlan } from "@/types/files.types";

interface BackupPlanFormProps {
  plan?: BackupPlan;
  onSubmit: (
    plan: Omit<BackupPlan, "id" | "controller_id" | "created_at" | "updated_at">
  ) => void;
  onCancel: () => void;
}

export const BackupPlanForm: React.FC<BackupPlanFormProps> = ({
  plan,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = React.useState(plan?.name ?? "");
  const [selectedDays, setSelectedDays] = React.useState<number[]>(
    plan?.days ?? []
  );
  const [time, setTime] = React.useState(plan?.time ?? "00:00");
  const [selectedFileTypes, setSelectedFileTypes] = React.useState<string[]>(
    plan?.file_types ?? []
  );
  const [isActive, setIsActive] = React.useState(plan?.is_active ?? true);

  const days = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 7, name: "Sunday" },
  ];

  const fileTypes = [".jbi", ".dat", ".cnd", ".prm", ".sys", ".lst"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      days: selectedDays,
      time,
      file_types: selectedFileTypes,
      is_active: isActive,
    });
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const toggleFileType = (type: string) => {
    setSelectedFileTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Plan Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter plan name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Backup Days</label>
        <div className="grid grid-cols-2 gap-2">
          {days.map((day) => (
            <label key={day.id} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedDays.includes(day.id)}
                onCheckedChange={() => toggleDay(day.id)}
              />
              <span>{day.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Backup Time</label>
        <TimePicker value={time} onChange={setTime} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">File Types</label>
        <div className="flex flex-wrap gap-2">
          {fileTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedFileTypes.includes(type)}
                onCheckedChange={() => toggleFileType(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked as boolean)}
        />
        <span>Active</span>
      </div>

      <div className="flex space-x-2">
        <Button type="submit">{plan ? "Update Plan" : "Create Plan"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
