"use client";
import React, { useMemo, useState } from "react";
import { Controller } from "@/types/controller.types";
import { getControllerById } from "@/utils/service/controller";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/shared/page-wrapper";
import { LiaEditSolid } from "react-icons/lia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Alarm from "@/components/controller/alarm/alarm";
import InputOutput from "@/components/controller/input-output/input-output";
import Variable from "@/components/controller/variable/variable";
import { GiMechanicalArm } from "react-icons/gi";
import ControllerForm from "@/components/controller/controller-form";
import ControllerStatusBar from "@/components/controller/controller-status-bar";
import Maintenance from "@/components/controller/maintenance/maintenance";
import Utilization from "@/components/controller/utilization/utilization";
import Files from "@/components/controller/files/files";
import Job from "@/components/controller/job/job";
import Timer from "@/components/shared/timer";

const tabItems = [
  {
    label: "Alarms",
    value: "alarm",
  },
  {
    label: "Monitoring",
    value: "monitoring",
  },
  {
    label: "I/O",
    value: "inputOutput",
  },
  {
    label: "Variables",
    value: "variable",
  },
  {
    label: "Data",
    value: "data",
  },
  {
    label: "Job",
    value: "job",
  },
  {
    label: "Files",
    value: "file",
  },
  {
    label: "Utilization",
    value: "util",
  },
  {
    label: "Maintenance",
    value: "maintenance",
  },
  {
    label: "Camera",
    value: "camera",
  },
  {
    label: "Remote Pendant",
    value: "remotePend",
  },
];

const Page = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("alarm");

  const { data: controller } = useQuery<Controller>({
    queryFn: async () => await getControllerById(params.id),
    queryKey: ["controller", params.id],
    enabled: params.id != "0",
    gcTime: 0,
  });

  const handleTimerCallback = () => {
    if (params.id !== "0") {
      switch (activeTab) {
        case "alarm":
          queryClient.invalidateQueries({ queryKey: ["alarms", params.id] });
          break;
        case "inputOutput":
          queryClient.invalidateQueries({ queryKey: ["io", params.id] });
          break;
        case "variable":
          queryClient.invalidateQueries({ queryKey: ["variables", params.id] });
          break;
        case "maintenance":
          queryClient.invalidateQueries({
            queryKey: ["maintenance", params.id],
          });
          break;
        case "util":
          queryClient.invalidateQueries({
            queryKey: ["utilization", params.id],
          });
          break;
        case "file":
          queryClient.invalidateQueries({ queryKey: ["files", params.id] });
          break;
        case "job":
          queryClient.invalidateQueries({ queryKey: ["jobs", params.id] });
          break;
        default:
          queryClient.invalidateQueries({
            queryKey: ["controller", params.id],
          });
      }
    }
  };

  const modifiedTabs = useMemo(() => {
    if (params.id != "0") {
      return [...tabItems, { label: "Update Controller", value: "update" }];
    } else if (params.id == "0") {
      return [{ label: "Create Controller", value: "create" }];
    }
  }, [params.id]);

  return (
    <>
      <PageWrapper
        shownHeaderButton={false}
        pageTitle={
          params.id !== "0" ? `Detail ${controller?.name}` : "Create Controller"
        }
        icon={
          params.id !== "0" ? (
            <LiaEditSolid size={24} color="#6950e8" />
          ) : (
            <GiMechanicalArm size={24} color="#6950e8" />
          )
        }
      >
        {params.id != "0" && controller?.controllerStatus && (
          <>
            <div className="flex justify-between items-center w-full px-6 mb-2">
              <Timer callback={handleTimerCallback} />
            </div>
            <ControllerStatusBar
              controllerStatus={controller?.controllerStatus}
            />
          </>
        )}
        <Tabs
          defaultValue={params.id == "0" ? "create" : "alarm"}
          className="mt-5"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="w-full flex">
            {modifiedTabs?.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex-1"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {params.id != "0" && (
            <>
              <TabsContent value="alarm">
                <Alarm controllerId={params.id} />
              </TabsContent>
              <TabsContent value="inputOutput">
                <InputOutput controllerId={params.id} />
              </TabsContent>
              <TabsContent value="variable">
                <Variable controllerId={params.id} />
              </TabsContent>
              <TabsContent value="maintenance">
                <Maintenance controllerId={params.id} />
              </TabsContent>
              <TabsContent value="util">
                <Utilization controllerId={params.id} />
              </TabsContent>
              <TabsContent value="file">
                <Files controllerId={params.id} />
              </TabsContent>
              <TabsContent value="job">
                <Job controllerId={params.id} />
              </TabsContent>
            </>
          )}
          <TabsContent value={params.id == "0" ? "create" : "update"}>
            <ControllerForm controllerId={params.id} />
          </TabsContent>
        </Tabs>
      </PageWrapper>
    </>
  );
};

export default Page;
