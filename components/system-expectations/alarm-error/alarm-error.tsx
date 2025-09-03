"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download,
  Settings,
} from "lucide-react";
import { getController } from "@/utils/service/controller";
import { getSystemAlarmsByType } from "@/utils/service/system-expectations/alarm-error";
import { Controller } from "@/types/controller.types";
import { SystemAlarmHistoryItem } from "@/types/alarm-error.types";
import SystemAlarmDetailModal from "./alarm-detail-modal";
import AlarmFilter from "./alarm-filter";

const AlarmErrorLogs = () => {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("MAJOR");
  const [alarms, setAlarms] = useState<SystemAlarmHistoryItem[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<
    SystemAlarmHistoryItem[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedAlarm, setSelectedAlarm] =
    useState<SystemAlarmHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchControllers();
  }, []);

  useEffect(() => {
    if (selectedController) {
      fetchAlarms();
    }
  }, [selectedController, selectedType]);

  const fetchControllers = async () => {
    try {
      const data = await getController();
      setControllers(data);
      if (data.length > 0) {
        setSelectedController(data[0].id!);
      }
    } catch (error) {
      console.error("Failed to fetch controllers:", error);
    }
  };

  const fetchAlarms = async () => {
    if (!selectedController) return;

    setLoading(true);
    try {
      const data = await getSystemAlarmsByType(
        selectedController,
        selectedType
      );
      setAlarms(data);
    } catch (error) {
      console.error("Failed to fetch alarms:", error);
      setAlarms([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case "MAJOR":
        return "text-red-600 bg-red-50";
      case "MINOR":
        return "text-yellow-600 bg-yellow-50";
      case "USER":
        return "text-blue-600 bg-blue-50";
      case "SYSTEM":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleAlarmCodeClick = (alarm: SystemAlarmHistoryItem) => {
    setSelectedAlarm(alarm);
    setIsModalOpen(true);
  };

  const handleFilteredAlarmsChange = (filtered: SystemAlarmHistoryItem[]) => {
    setFilteredAlarms(filtered);
    setCurrentPage(1);
  };

  const getControllerName = () => {
    return (
      controllers.find((c) => c.id === selectedController)?.name || "Unknown"
    );
  };

  const totalPages = Math.ceil(filteredAlarms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlarms = filteredAlarms.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Controller
                </label>
                <Select
                  value={selectedController}
                  onValueChange={setSelectedController}
                >
                  <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-blue-400 focus:border-blue-500">
                    <SelectValue placeholder="Select Controller" />
                  </SelectTrigger>
                  <SelectContent>
                    {controllers.map((controller) => (
                      <SelectItem key={controller.id} value={controller.id!}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">
                              {controller.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {controller.model}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Alarm Type
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-orange-400 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAJOR">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Major</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MINOR">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Minor</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="USER">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SYSTEM">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between h-full">
              {selectedController && filteredAlarms.length > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500">
                      Total Alarms:
                      <Badge className="ml-2 bg-red-50 text-red-700 text-xs px-2 py-0.5 h-5">
                        {filteredAlarms.length} {selectedType.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Controller:
                      <span className="ml-2 text-blue-600 font-medium">
                        {getControllerName()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 flex-1">
                  Select a controller to view alarms
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          {selectedController && (
            <AlarmFilter
              alarms={alarms}
              onFilteredAlarmsChange={handleFilteredAlarmsChange}
              controllerName={getControllerName()}
            />
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading alarms...</div>
            ) : (
              <div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold">#</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Mode</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAlarms.length > 0 ? (
                        currentAlarms.map((alarm, index) => (
                          <TableRow
                            key={`${alarm.code}-${startIndex + index}`}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            }`}
                          >
                            <TableCell className="font-mono text-sm font-medium text-gray-600">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(alarm.originDate).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                  {alarm.code}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                                  onClick={() => handleAlarmCodeClick(alarm)}
                                  title="View alarm details and solution"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell
                              className="text-sm max-w-xs truncate"
                              title={alarm.name}
                            >
                              {alarm.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getSeverityColor(
                                  alarm.type
                                )} font-semibold px-3 py-1 rounded-full text-xs`}
                              >
                                {alarm.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {alarm.mode}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200"
                                onClick={() => {
                                  /* TODO: CMMS Integration */
                                }}
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Create Work Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <AlertTriangle className="w-8 h-8 text-gray-400" />
                              <div>
                                {filteredAlarms.length !== alarms.length
                                  ? `No alarms found matching the current filters (${alarms.length} total alarms available)`
                                  : "No alarms found for the selected criteria"}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredAlarms.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredAlarms.length)} of{" "}
                      {filteredAlarms.length} alarms
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNum =
                              Math.max(
                                1,
                                Math.min(totalPages - 4, currentPage - 2)
                              ) + i;
                            if (pageNum <= totalPages) {
                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => goToPage(pageNum)}
                                  className="h-8 w-8 p-0 text-xs"
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                            return null;
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SystemAlarmDetailModal
        alarm={selectedAlarm}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        controllerId={selectedController}
      />
    </div>
  );
};

export default AlarmErrorLogs;
