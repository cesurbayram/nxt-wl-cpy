import React from "react";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
  disabled?: boolean;
}

export default function TimePicker({
  value,
  defaultValue = "00:00",
  onChange,
  disabled = false,
}: TimePickerProps) {
  return (
    <Input
      type="time"
      value={value || defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="w-32"
    />
  );
}
