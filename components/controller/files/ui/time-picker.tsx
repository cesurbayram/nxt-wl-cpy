import React from "react";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
}

export default function TimePicker({
  value,
  defaultValue = "00:00",
  onChange,
}: TimePickerProps) {
  return (
    <Input
      type="time"
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-32"
    />
  );
}
