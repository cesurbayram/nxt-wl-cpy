"use client";

import React, { useState, useEffect } from "react";
import { Controller } from "@/types/controller.types";
import { getController, getControllerById } from "@/utils/service/controller";
import PageWrapper from "@/components/shared/page-wrapper";
import { LiaEditSolid } from "react-icons/lia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GiMechanicalArm } from "react-icons/gi";
import ControllerStatusBar from "@/components/controller/controller-status-bar";
import LoadingUi from "@/components/shared/loading-ui";
import { UtilizationData } from "@/types/utilization.types";
import { getUtilizationData } from "@/utils/service/utilization";
import UtilizationChart from "@/components/controller/utilization/utilization-chart";
import { getBackupPlans } from "@/utils/service/files";
import { getJobsByControllerId } from "@/utils/service/job";
import { getAlarmsByControllerId } from "@/utils/service/alarm";
import Timer from "@/components/shared/timer";

const Page = ({ params }: { params: { id: string } }) => {
  const [selectedControllerId, setSelectedControllerId] = useState<
    string | null
  >(null);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] =
    useState<Controller | null>(null);
  const [utilizationData, setUtilizationData] = useState<UtilizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isControllersLoading, setIsControllersLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [alarmCounts, setAlarmCounts] = useState<{
    major: number;
    minor: number;
    system: number;
    user: number;
    offline: number;
    detected: number;
  }>({
    major: 0,
    minor: 0,
    system: 0,
    user: 0,
    offline: 0,
    detected: 0,
  });

  useEffect(() => {
    const fetchControllers = async () => {
      setIsControllersLoading(true);
      try {
        const data = await getController();
        setControllers(data);
      } catch (error) {
        console.error("Error fetching controllers:", error);
      }
      setIsControllersLoading(false);
    };

    fetchControllers();
  }, []);

  const fetchCurrentStatus = async (controllerId: string) => {
    try {
      const backupPlans = await getBackupPlans(controllerId);
      const latestBackup = backupPlans[0];
      setBackupInfo(latestBackup);

      const jobs = await getJobsByControllerId(controllerId);
      const currentJob = jobs[0];
      setJobInfo(currentJob);

      const detectedAlarms = await getAlarmsByControllerId(
        controllerId,
        "detected"
      );
      const majorAlarms = await getAlarmsByControllerId(
        controllerId,
        "almhist",
        "MAJOR"
      );
      const minorAlarms = await getAlarmsByControllerId(
        controllerId,
        "almhist",
        "MINOR"
      );
      const systemAlarms = await getAlarmsByControllerId(
        controllerId,
        "almhist",
        "SYSTEM"
      );
      const userAlarms = await getAlarmsByControllerId(
        controllerId,
        "almhist",
        "USER"
      );
      const offlineAlarms = await getAlarmsByControllerId(
        controllerId,
        "almhist",
        "OFF-LINE"
      );

      setAlarmCounts({
        major: majorAlarms.length,
        minor: minorAlarms.length,
        system: systemAlarms.length,
        user: userAlarms.length,
        offline: offlineAlarms.length,
        detected: detectedAlarms.length,
      });
    } catch (error) {
      console.error("Error fetching current status:", error);
    }
  };

  const refreshData = async () => {
    if (selectedControllerId) {
      try {
        // Önce controller status'ı güncelle
        const controllerData = await getControllerById(selectedControllerId);
        setSelectedController(controllerData);

        // Sonra utilization verilerini güncelle
        const utilizationResult = await getUtilizationData(
          selectedControllerId,
          "7d",
          "5min"
        );
        setUtilizationData(utilizationResult);

        // En son diğer verileri güncelle
        await fetchCurrentStatus(selectedControllerId);
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    }
  };

  useEffect(() => {
    const fetchControllerData = async () => {
      if (!selectedControllerId) return;

      setIsLoading(true);
      try {
        // İlk yüklemede de aynı sırayla verileri al
        const controllerData = await getControllerById(selectedControllerId);
        setSelectedController(controllerData);

        const utilizationResult = await getUtilizationData(
          selectedControllerId,
          "7d",
          "5min"
        );
        setUtilizationData(utilizationResult);

        await fetchCurrentStatus(selectedControllerId);
      } catch (error) {
        console.error("Error fetching controller data:", error);
      }
      setIsLoading(false);
    };

    fetchControllerData();
  }, [selectedControllerId]);

  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="WatchLog"
      icon={<LiaEditSolid size={24} color="#6950e8" />}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Controllers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {controllers?.map((ctrl) => (
              <div
                key={ctrl.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedControllerId === ctrl.id
                    ? "border-primary bg-muted/50"
                    : ""
                }`}
                onClick={() => setSelectedControllerId(ctrl.id || "")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{ctrl.name}</div>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      ctrl.controllerStatus?.connection
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Model: {ctrl.model}
                </div>
                <div className="text-sm text-muted-foreground">
                  IP: {ctrl.ipAddress}
                </div>
                <div className="text-sm text-muted-foreground">
                  Location: {ctrl.location}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!selectedControllerId ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <GiMechanicalArm size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Controller</h3>
          <p className="text-sm text-muted-foreground">
            Choose a controller from the list above to view its details
          </p>
        </div>
      ) : isLoading ? (
        <LoadingUi isLoading={true} />
      ) : (
        selectedController &&
        selectedController.controllerStatus && (
          <>
            <div className="mb-6">
              <div className="flex justify-end mb-2">
                <Timer callback={refreshData} />
              </div>
              <ControllerStatusBar
                controllerStatus={selectedController.controllerStatus}
              />
            </div>

            <div className="grid grid-cols-12 gap-4">
              <Card className="col-span-8">
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {utilizationData && (
                    <UtilizationChart data={utilizationData} viewType="line" />
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold mb-3">
                        Latest Backup
                      </h3>
                      {backupInfo ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">Name:</span>{" "}
                            {backupInfo.name}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">Date:</span>{" "}
                            {new Date(backupInfo.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              File Types:
                            </span>{" "}
                            {backupInfo.file_types?.join(", ")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No backup information
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold mb-3">
                        Current Job
                      </h3>
                      {jobInfo ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">Name:</span>{" "}
                            {jobInfo.job_name}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">Line:</span>{" "}
                            {jobInfo.current_line}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No active job
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold mb-3">
                        Alarm Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              Major:
                            </span>{" "}
                            {alarmCounts.major}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              Minor:
                            </span>{" "}
                            {alarmCounts.minor}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              System:
                            </span>{" "}
                            {alarmCounts.system}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">User:</span>{" "}
                            {alarmCounts.user}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              Off-line:
                            </span>{" "}
                            {alarmCounts.offline}
                          </p>
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">
                              Detected:
                            </span>{" "}
                            {alarmCounts.detected}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}
    </PageWrapper>
  );
};

export default Page;
