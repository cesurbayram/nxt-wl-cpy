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

  useEffect(() => {
    const fetchControllerData = async () => {
      if (!selectedControllerId) return;

      setIsLoading(true);
      try {
        const [controllerData, utilizationResult] = await Promise.all([
          getControllerById(selectedControllerId),
          getUtilizationData(selectedControllerId, "7d", "5min"),
        ]);

        setSelectedController(controllerData);
        setUtilizationData(utilizationResult);
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
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedController.controllerStatus.connection
                        ? "NORMAL"
                        : "FAULT"}
                    </div>
                    <div className="text-4xl font-bold mt-2">
                      {selectedController.controllerStatus.error || 0}
                    </div>
                    <div className="text-sm mt-2">ERRORS</div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      System Health:{" "}
                      {selectedController.controllerStatus.connection
                        ? "100%"
                        : "0%"}
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
