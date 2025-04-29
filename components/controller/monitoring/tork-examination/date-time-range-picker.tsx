"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, addMinutes, isValid, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TimePicker from "./ui/time-picker";

interface DateTimeRangePickerProps {
  startDate: string;
  endDate: string;
  duration: number;
  onChange: (startDate: string, endDate: string, duration: number) => void;
  startTime?: string;
  onStartTimeChange?: (time: string) => void;
  endTime?: string;
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  startDate,
  endDate,
  duration,
  onChange,
  startTime,
  onStartTimeChange,
  endTime,
}) => {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getValidDate = (dateString: string): Date => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? date : new Date();
    } catch (e) {
      console.error("Invalid date format:", dateString);
      return new Date();
    }
  };

  const [start, setStart] = useState<Date>(getValidDate(startDate));
  const [end, setEnd] = useState<Date>(getValidDate(endDate));
  const [selectedDuration, setSelectedDuration] = useState<number>(duration);

  const [timeValue, setTimeValue] = useState<string>(
    startTime || getCurrentTime()
  );

  useEffect(() => {
    if (!startTime) {
      const currentTime = getCurrentTime();
      setTimeValue(currentTime);
      if (onStartTimeChange) {
        onStartTimeChange(currentTime);
      }
    }
  }, []);

  useEffect(() => {
    if (duration !== selectedDuration) {
      setSelectedDuration(duration);
    }
  }, [duration]);

  useEffect(() => {
    const newDate = getValidDate(startDate);

    if (
      start.getDate() !== newDate.getDate() ||
      start.getMonth() !== newDate.getMonth() ||
      start.getFullYear() !== newDate.getFullYear()
    ) {
      setStart(newDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (startTime && startTime !== timeValue) {
      setTimeValue(startTime);
    }
  }, [startTime]);

  useEffect(() => {
    try {
      const startDate = new Date(start);

      if (timeValue) {
        const [hours, minutes, seconds] = timeValue.split(":").map(Number);
        startDate.setHours(hours || 0, minutes || 0, seconds || 0);
      }

      const newEnd = new Date(startDate.getTime() + selectedDuration * 60000);

      setEnd(newEnd);

      const startISOString = startDate.toISOString();
      const endISOString = newEnd.toISOString();

      onChange(startISOString, endISOString, selectedDuration);
    } catch (e) {
      console.error("Error calculating end time:", e);
    }
  }, [start, timeValue, selectedDuration]);

  const handleTimeChange = (timeString: string) => {
    if (timeString === timeValue) return;

    setTimeValue(timeString);

    if (onStartTimeChange) {
      onStartTimeChange(timeString);
    }

    try {
      const [hours, minutes, seconds] = timeString.split(":").map(Number);

      const newStartDate = new Date(start);
      newStartDate.setHours(hours || 0, minutes || 0, seconds || 0);

      if (
        isValid(newStartDate) &&
        (newStartDate.getHours() !== start.getHours() ||
          newStartDate.getMinutes() !== start.getMinutes() ||
          newStartDate.getSeconds() !== start.getSeconds())
      ) {
        setStart(newStartDate);
      }
    } catch (e) {
      console.error("Error updating time:", e);
    }
  };

  const durationOptions = [
    { value: 1, label: "1 minute" },
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
  ];

  const formatSafely = (date: Date, formatStr: string) => {
    try {
      return isValid(date) ? format(date, formatStr, { locale: enUS }) : "-";
    } catch (e) {
      return "-";
    }
  };

  const formatEndDateTime = (date: Date) => {
    try {
      if (!isValid(date)) return "-";
      const dateStr = format(date, "MMMM d, yyyy", { locale: enUS });
      const timeStr = format(date, "HH:mm:ss", { locale: enUS });
      return `${dateStr} ${timeStr}`;
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="space-y-1">
        <Label className="text-sm">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-9 justify-start text-left font-normal text-sm"
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {formatSafely(start, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={start}
              onSelect={(date) => date && setStart(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1">
        <Label className="text-sm">Start Time</Label>
        <TimePicker value={timeValue} onChange={handleTimeChange} />
      </div>

      <div className="space-y-1">
        <Label className="text-sm">Duration</Label>
        <Select
          value={selectedDuration.toString()}
          onValueChange={(value) => setSelectedDuration(parseInt(value))}
        >
          <SelectTrigger className="w-[125px] h-9 text-sm">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {durationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-sm">End Time (Calculated)</Label>
        <div className="px-3 py-1.5 border rounded-md bg-gray-50 w-[280px] h-9 flex items-center">
          <Clock className="mr-2 h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">{formatEndDateTime(end)}</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeRangePicker;
