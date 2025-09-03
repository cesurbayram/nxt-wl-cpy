"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, X, Calendar, FileText } from "lucide-react";
import { SystemAlarmHistoryItem } from "@/types/alarm-error.types";
import * as XLSX from "xlsx";

interface AlarmFilterProps {
  alarms: SystemAlarmHistoryItem[];
  onFilteredAlarmsChange: (filteredAlarms: SystemAlarmHistoryItem[]) => void;
  controllerName?: string;
  className?: string;
}

const AlarmFilter = ({
  alarms,
  onFilteredAlarmsChange,
  controllerName = "Unknown",
  className = "",
}: AlarmFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedModes, setSelectedModes] = useState<string[]>([]);

  const availableModes = Array.from(
    new Set(alarms.map((alarm) => alarm.mode))
  ).filter(Boolean);

  const applyFilters = () => {
    const filtered = alarms.filter((alarm) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          alarm.name.toLowerCase().includes(searchLower) ||
          alarm.code.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (dateFrom || dateTo) {
        const alarmDate = new Date(alarm.originDate);
        if (dateFrom && alarmDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (alarmDate > toDate) return false;
        }
      }

      if (selectedModes.length > 0) {
        if (!selectedModes.includes(alarm.mode)) return false;
      }

      return true;
    });

    onFilteredAlarmsChange(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, dateFrom, dateTo, selectedModes, alarms]);

  const handleModeToggle = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setSelectedModes([]);
  };

  const hasActiveFilters =
    searchTerm || dateFrom || dateTo || selectedModes.length > 0;

  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setDateFrom(today);
    setDateTo(today);
  };

  const setLastWeek = () => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    setDateFrom(weekAgo.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
  };

  const setLast30Days = () => {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    setDateFrom(monthAgo.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
  };

  const handleExportExcel = () => {
    let filtered = alarms.filter((alarm) => {
      if (
        searchTerm &&
        !alarm.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;

      if (dateFrom || dateTo) {
        const alarmDate = new Date(alarm.originDate);
        if (dateFrom && alarmDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (alarmDate > toDate) return false;
        }
      }
      if (selectedModes.length > 0 && !selectedModes.includes(alarm.mode))
        return false;
      return true;
    });

    const excelData = filtered.map((alarm) => ({
      Date: new Date(alarm.originDate).toLocaleString(),
      Code: alarm.code,
      Description: alarm.name,
      Type: alarm.type,
      Mode: alarm.mode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "System Alarms");

    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = `${controllerName}_system_alarms_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const filteredCount = alarms.filter((alarm) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        alarm.name.toLowerCase().includes(searchLower) ||
        alarm.code.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (dateFrom || dateTo) {
      const alarmDate = new Date(alarm.originDate);
      if (dateFrom && alarmDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (alarmDate > toDate) return false;
      }
    }
    if (selectedModes.length > 0 && !selectedModes.includes(alarm.mode))
      return false;
    return true;
  }).length;

  if (alarms.length === 0) return null;

  return (
    <div className={`mb-6 p-3 bg-gray-50 rounded-lg border ${className}`}>
      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search Section */}
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 relative">
            <Input
              placeholder="Search by code, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Date Range Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-sm flex-1 sm:w-32"
              placeholder="From"
            />
            <span className="text-xs text-gray-500 hidden sm:inline">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-sm flex-1 sm:w-32"
              placeholder="To"
            />
          </div>

          {/* Quick Date Buttons - Mobile: Stack, Desktop: Inline */}
          <div className="flex gap-1 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={setToday}
              className="h-7 text-xs px-2 flex-1 sm:flex-none"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setLastWeek}
              className="h-7 text-xs px-2 flex-1 sm:flex-none"
            >
              7d
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setLast30Days}
              className="h-7 text-xs px-2 flex-1 sm:flex-none"
            >
              30d
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-end">
          {availableModes.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Mode:
              </span>
              <div className="flex bg-gray-100 rounded-md p-0.5 gap-0.5 flex-wrap">
                {availableModes.map((mode) => (
                  <Button
                    key={mode}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleModeToggle(mode)}
                    className={`h-6 text-xs px-2 rounded transition-all duration-200 ${
                      selectedModes.includes(mode)
                        ? "bg-white shadow-sm text-blue-700 font-semibold"
                        : "hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-gray-600 px-2"
              >
                Clear
              </Button>
            )}
            {filteredCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="h-7 text-xs px-2"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
            <span className="font-medium">Filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs h-5 px-2">
                "
                {searchTerm.length > 15
                  ? searchTerm.substring(0, 15) + "..."
                  : searchTerm}
                "
              </Badge>
            )}
            {dateFrom && (
              <Badge variant="secondary" className="text-xs h-5 px-2">
                From{" "}
                {new Date(dateFrom).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </Badge>
            )}
            {dateTo && (
              <Badge variant="secondary" className="text-xs h-5 px-2">
                To{" "}
                {new Date(dateTo).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </Badge>
            )}
            {selectedModes.length > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-2">
                {selectedModes.join(", ")}
              </Badge>
            )}
            <span className="text-gray-500 ml-auto font-medium">
              {filteredCount}/{alarms.length} alarms
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmFilter;
