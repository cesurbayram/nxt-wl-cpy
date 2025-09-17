"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Calendar,
  Clock,
  HardDrive,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  FileText,
  BookOpen,
} from "lucide-react";
import { getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import {
  performInstantBackup,
  createWeeklyBackupPlan,
} from "@/utils/service/system-expectations/cmos-backup";
import {
  createBackupPlan,
  getBackupPlans,
  deleteBackupPlan,
} from "@/utils/service/files";
import { BackupPlan } from "@/types/files.types";
import { toast } from "sonner";
import PlansList from "./plans-list";
import BackupHistory from "./backup-history";
import {
  fetchLogData,
  getFileSaveHistory,
} from "@/utils/service/system-expectations/log-data";
import { FileSaveLogEntry } from "@/types/file-save-log.types";
import LogContentDisplay from "./log-content-display";
import TeachingAnalysis from "./teaching-analysis";

const CmosBackupLogs = () => {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] = useState<string>("");
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [isInstantBackupModalOpen, setIsInstantBackupModalOpen] =
    useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([
    "CMOS",
  ]);

  interface DayPlan {
    id: number;
    name: string;
    isSelected: boolean;
    time: string;
    selectedFiles: string[];
  }

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

  const [planName, setPlanName] = useState<string>("");

  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const [showPlanList, setShowPlanList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showBackupHistory, setShowBackupHistory] = useState(false);

  const [isLoadingLogData, setIsLoadingLogData] = useState(false);

  const [fileSaveHistory, setFileSaveHistory] = useState<FileSaveLogEntry[]>(
    []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showFileSaveHistory, setShowFileSaveHistory] = useState(false);

  const fileTypes = ["CMOS", ".jbi", ".dat", ".cnd", ".prm", ".sys", ".lst"];

  useEffect(() => {
    fetchControllers();
  }, []);

  // Auto-fetch log data when component mounts or controller changes
  useEffect(() => {
    if (selectedController) {
      handleFetchLogData();
    }
  }, [selectedController]);

  const fetchControllers = async () => {
    try {
      const response = await getController();
      setControllers(response || []);
      if (response && response.length > 0) {
        setSelectedController(response[0].id || "");
      }
    } catch (error) {
      console.error("Error fetching controllers:", error);
      toast.error("Controllers could not be loaded");
    }
  };

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

  const handleSelectAll = (dayId: number) => {
    setDayPlans((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              selectedFiles:
                day.selectedFiles.length === fileTypes.length
                  ? []
                  : [...fileTypes],
            }
          : day
      )
    );
  };

  const handleInstantBackup = () => {
    if (!selectedController) {
      toast.error("Önce controller seçin!");
      return;
    }
    setIsInstantBackupModalOpen(true);
  };

  const executeInstantBackup = async () => {
    if (selectedFileTypes.length === 0) {
      toast.error("En az bir dosya türü seçin!");
      return;
    }

    setIsBackingUp(true);
    try {
      const result = await performInstantBackup(
        selectedController,
        selectedFileTypes
      );

      if (result.success) {
        toast.success(result.message || "Backup başarıyla başlatıldı!");
        setIsInstantBackupModalOpen(false);
      } else {
        toast.error(result.error || "Backup başlatılamadı!");
      }
    } catch (error) {
      console.error("Instant backup error:", error);
      toast.error("Backup starting failed. Please try again.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFetchFileSaveHistory = async () => {
    if (!selectedController) {
      toast.error("Önce controller seçin!");
      return;
    }

    setIsLoadingHistory(true);
    try {
      const history = await getFileSaveHistory(selectedController);
      setFileSaveHistory(history);
      setShowFileSaveHistory(true);
    } catch (error) {
      console.error("Error fetching file save history:", error);
      toast.error("Failed to fetch file save history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFetchLogData = async () => {
    if (!selectedController) {
      toast.error("Önce controller seçin!");
      return;
    }

    setIsLoadingLogData(true);
    try {
      const result = await fetchLogData(selectedController, "LOGDATA.DAT");

      if (result.success) {
        toast.success("Log data request sent successfully!");

        setTimeout(() => {
          handleFetchFileSaveHistory();
          setRefreshTrigger((prev) => prev + 1);
        }, 2000);
      } else {
        toast.error(result.error || "Failed to fetch log data");
      }
    } catch (error) {
      console.error("Error fetching log data:", error);
      toast.error("Failed to fetch log data");
    } finally {
      setIsLoadingLogData(false);
    }
  };

  const handleSavePlan = async () => {
    if (!selectedController) {
      toast.error("Please select a controller first");
      return;
    }

    const finalPlanName = planName.trim() || "Backup Plan";

    const selectedPlans = dayPlans.filter(
      (day) => day.isSelected && day.selectedFiles.length > 0
    );

    if (selectedPlans.length === 0) {
      toast.error("Please select at least one day with file types");
      return;
    }

    setIsCreatingPlan(true);

    try {
      for (const plan of selectedPlans) {
        const backupPlan = {
          name: `${finalPlanName} - ${plan.name}`,
          time: plan.time,
          days: [plan.id],
          file_types: plan.selectedFiles,
        };

        await createBackupPlan(selectedController, backupPlan);
      }

      toast.success("CMOS Backup plans saved successfully!");
      setIsCreatePlanModalOpen(false);

      setPlanName("");
      setDayPlans((prev) =>
        prev.map((day) => ({
          ...day,
          isSelected: false,
          selectedFiles: [],
        }))
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving backup plans:", error);
      toast.error("Failed to create backup plan. Please try again.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Select Controller:
              </Label>
              <Select
                value={selectedController}
                onValueChange={setSelectedController}
              >
                <SelectTrigger className="w-full sm:w-56 bg-white border-gray-300 shadow-sm">
                  <SelectValue placeholder="Choose a controller..." />
                </SelectTrigger>
                <SelectContent>
                  {controllers.map((controller) => (
                    <SelectItem key={controller.id} value={controller.id || ""}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>
                          {controller.name} - {controller.model}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatePlanModalOpen(true)}
                disabled={!selectedController || isCreatingPlan}
                className="flex-shrink-0 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 px-3 h-9 text-xs"
              >
                {isCreatingPlan ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Calendar className="w-3 h-3 mr-1" />
                )}
                {isCreatingPlan ? "Creating..." : "Create Plan"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!selectedController}
                onClick={() => setShowBackupHistory(!showBackupHistory)}
                className="flex-shrink-0 hover:bg-green-50 hover:text-green-700 transition-all duration-200 px-3 h-9 text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Backup History
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!selectedController}
                onClick={() => setShowPlanList(!showPlanList)}
                className="flex-shrink-0 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 px-3 h-9 text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Plan List
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!selectedController || isLoadingLogData}
                onClick={handleFetchLogData}
                className="flex-shrink-0 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 px-3 h-9 text-xs"
              >
                {isLoadingLogData ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {isLoadingLogData ? "Fetching..." : "Fetch Log Data"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!selectedController || isLoadingHistory}
                onClick={() => setShowFileSaveHistory(!showFileSaveHistory)}
                className="flex-shrink-0 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 px-3 h-9 text-xs"
              >
                {isLoadingHistory ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {isLoadingHistory ? "Loading..." : "File Save History"}
              </Button>

              <Button
                size="sm"
                onClick={() => handleInstantBackup()}
                disabled={!selectedController || isBackingUp}
                className={`flex-shrink-0 px-4 h-9 font-medium shadow-lg transition-all duration-300 text-xs ${
                  selectedController && !isBackingUp
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isBackingUp ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                {isBackingUp ? "Processing..." : "Instant Backup"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PlansList
        controllerId={selectedController}
        isVisible={showPlanList}
        refreshTrigger={refreshTrigger}
      />

      <BackupHistory
        controllerId={selectedController}
        isVisible={showBackupHistory}
        refreshTrigger={refreshTrigger}
      />

      {showFileSaveHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                File Save History
                <span className="text-sm text-gray-500 font-normal">
                  ({fileSaveHistory.length} records)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchFileSaveHistory}
                  disabled={isLoadingHistory}
                  className="text-xs"
                >
                  {isLoadingHistory ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileSaveHistory(false)}
                  className="text-xs"
                >
                  Hide
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2 text-indigo-600" />
                <span>Loading file save history...</span>
              </div>
            ) : fileSaveHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fileSaveHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border ${
                      entry.status
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{entry.status_icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {entry.file_name}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {entry.status_text}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>{entry.ip_address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>
                          {new Date(entry.created_at).toLocaleString("tr-TR")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No file save history found</p>
                <p className="text-sm mt-1">
                  File save operations will appear here after fetching log data
                </p>
                {selectedController && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchFileSaveHistory}
                    disabled={isLoadingHistory}
                    className="mt-3"
                  >
                    {isLoadingHistory ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Load History
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedController && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 min-h-[600px] items-start">
          <LogContentDisplay
            controllerId={selectedController}
            isVisible={true}
            refreshTrigger={refreshTrigger}
          />

          <TeachingAnalysis
            controllerId={selectedController}
            isVisible={true}
            refreshTrigger={refreshTrigger}
          />
        </div>
      )}

      <Dialog
        open={isCreatePlanModalOpen}
        onOpenChange={setIsCreatePlanModalOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Backup Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Plan Name (Optional)
              </Label>
              <Input
                type="text"
                placeholder="Leave empty for automatic name..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 border-b">
                <div className="col-span-2 p-3 font-medium text-base">Day</div>
                <div className="col-span-2 p-3 font-medium text-base">Time</div>
                <div className="col-span-8 p-3 font-medium text-base">
                  File Types
                </div>
              </div>

              {dayPlans.map((day) => {
                const isEnabled = day.isSelected;
                return (
                  <div
                    key={day.id}
                    className="grid grid-cols-12 border-b last:border-b-0 hover:bg-gray-50/50"
                  >
                    <div className="col-span-2 p-3 flex items-center">
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={() => handleDayToggle(day.id)}
                        className="mr-2"
                      />
                      <Label className="text-base font-medium cursor-pointer">
                        {day.name}
                      </Label>
                    </div>

                    <div className="col-span-2 p-3">
                      <Input
                        type="time"
                        value={day.time}
                        onChange={(e) =>
                          handleTimeChange(day.id, e.target.value)
                        }
                        disabled={!isEnabled}
                        className="text-base h-9"
                      />
                    </div>

                    <div className="col-span-8 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={
                              day.selectedFiles.length === fileTypes.length &&
                              fileTypes.every((ft) =>
                                day.selectedFiles.includes(ft)
                              )
                            }
                            onCheckedChange={() => handleSelectAll(day.id)}
                            disabled={!isEnabled}
                            className="scale-75"
                          />
                          <Label className="text-base font-medium text-blue-600 cursor-pointer">
                            All
                          </Label>
                        </div>

                        {fileTypes.map((fileType) => (
                          <div
                            key={fileType}
                            className="flex items-center gap-1"
                          >
                            <Checkbox
                              checked={day.selectedFiles.includes(fileType)}
                              onCheckedChange={() =>
                                handleFileTypeToggle(day.id, fileType)
                              }
                              disabled={!isEnabled}
                              className="scale-75"
                            />
                            <Label className="text-sm cursor-pointer">
                              {fileType === "CMOS"
                                ? "CMOS"
                                : fileType.replace(".", "")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatePlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={!selectedController || isCreatingPlan}
              className="min-w-[100px]"
            >
              {isCreatingPlan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Save Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isInstantBackupModalOpen}
        onOpenChange={setIsInstantBackupModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              Instant Backup
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Creating backup for today ({new Date().toLocaleDateString()}) at
              current time (
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              )
            </p>

            <div>
              <h4 className="text-sm font-medium mb-2">Select File Types:</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-600 bg-opacity-10 rounded cursor-pointer">
                  <Checkbox
                    checked={selectedFileTypes.length === fileTypes.length}
                    onCheckedChange={() => {
                      if (selectedFileTypes.length === fileTypes.length) {
                        setSelectedFileTypes([]);
                      } else {
                        setSelectedFileTypes([...fileTypes]);
                      }
                    }}
                  />
                  <span className="text-xs font-medium">All</span>
                </div>

                {fileTypes.map((fileType) => (
                  <div
                    key={fileType}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 bg-opacity-10 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedFileTypes.includes(fileType)}
                      onCheckedChange={() => {
                        if (selectedFileTypes.includes(fileType)) {
                          setSelectedFileTypes((prev) =>
                            prev.filter((type) => type !== fileType)
                          );
                        } else {
                          setSelectedFileTypes((prev) => [...prev, fileType]);
                        }
                      }}
                    />
                    <span className="text-xs">
                      {fileType === "CMOS" ? "CMOS" : fileType.replace(".", "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsInstantBackupModalOpen(false);
                setSelectedFileTypes(["CMOS"]);
              }}
              disabled={isBackingUp}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={executeInstantBackup}
              disabled={selectedFileTypes.length === 0 || isBackingUp}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold flex items-center gap-2"
              size="sm"
            >
              {isBackingUp ? (
                "Creating..."
              ) : (
                <>
                  <Download className="h-4 w-4" /> Create Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CmosBackupLogs;
