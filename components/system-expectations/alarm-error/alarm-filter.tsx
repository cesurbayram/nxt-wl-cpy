"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Calendar, Download } from "lucide-react";
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


  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          alarm.name.toLowerCase().includes(searchLower) ||
          alarm.code.toLowerCase().includes(searchLower) ||
          alarm.type.toLowerCase().includes(searchLower) ||
          alarm.mode.toLowerCase().includes(searchLower);
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

      return true;
    });
  }, [alarms, searchTerm, dateFrom, dateTo]);

  React.useEffect(() => {
    onFilteredAlarmsChange(filteredAlarms);
  }, [filteredAlarms, onFilteredAlarmsChange]);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchTerm || dateFrom || dateTo;

  const handleExportExcel = () => {
    const excelData = filteredAlarms.map((alarm) => ({
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

  if (alarms.length === 0) return null;

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by code, description, type, mode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>


        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 w-40"
            placeholder="From"
          />
          <span className="text-sm text-gray-400">-</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 w-40"
            placeholder="To"
          />
        </div>


        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-10 px-3"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          {filteredAlarms.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="h-10 px-3"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>


      {hasActiveFilters && (
        <div className="mt-2 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredAlarms.length}</span> of{" "}
          <span className="font-semibold">{alarms.length}</span> alarms
        </div>
      )}
    </div>
  );
};

export default AlarmFilter;
