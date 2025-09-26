"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Controller } from "@/types/controller.types";
import { getControllerById } from "@/utils/service/controller";
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
import { sendTabExitCommand } from "@/utils/service/tab-exit";
import Timer from "@/components/shared/timer";
import { Teaching } from "@/components/controller/data-analysis/teaching/teaching";
import Monitoring from "@/components/controller/monitoring/monitoring";
import Data from "@/components/controller/data/data";
import { useSearchParams } from "next/navigation";

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
    label: "Data Analysis",
    value: "datanal",
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
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") || (params.id === "0" ? "create" : "alarm");

  const [activeTab, setActiveTab] = useState(initialTab);
  const previousTab = useRef<string | null>(null);
  const [controller, setController] = useState<Controller | null>(null);

  const fetchController = async () => {
    if (params.id !== "0") {
      try {
        const data = await getControllerById(params.id);
        setController(data);
      } catch (error) {
        console.error("Failed to fetch controller:", error);
      }
    }
  };

  useEffect(() => {
    fetchController();

    return () => {

      const tabToSubTabMap: Record<string, string> = {
        variable: "byte",
        inputOutput: "extInput",
        data: "absoData",
        monitoring: "tork",
        job: "job"
      };

      if (previousTab.current && tabToSubTabMap[previousTab.current]) {
        sendTabExitCommand({
          exitedTab: tabToSubTabMap[previousTab.current],
          controllerId: params.id,
        }).catch((error) => {
          console.error(
            `Failed to send ${tabToSubTabMap[previousTab.current!]} exit on page unmount:`,
            error
          );
        });
      }
    };
  }, [params.id]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const modifiedTabs = useMemo(() => {
    if (params.id != "0") {
      return [...tabItems, { label: "Update Controller", value: "update" }];
    } else if (params.id == "0") {
      return [{ label: "Create Controller", value: "create" }];
    }
  }, [params.id]);

  const handleStatusRefresh = async () => {
    if (params.id !== "0") {
      try {
        const updatedController = await getControllerById(params.id);
        setController((prev) => ({
          ...prev,
          controllerStatus: updatedController.controllerStatus,
        }));
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);


    const currentTab = previousTab.current || activeTab;


    const tabToSubTabMap: Record<string, string> = {
      variable: "byte",
      inputOutput: "extInput",
      data: "absoData",
      monitoring: "tork",
      job: "job"
    };

    if (currentTab && tabToSubTabMap[currentTab]) {
      try {
        await sendTabExitCommand({
          exitedTab: tabToSubTabMap[currentTab],
          controllerId: params.id,
        });
        console.log(`${tabToSubTabMap[currentTab]}Exit sent for ${currentTab} tab`);
      } catch (error) {
        console.error(`Failed to send ${tabToSubTabMap[currentTab]} exit:`, error);
      }
    }

    previousTab.current = value;
  };

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
            <div className="overflow-x-auto">
              <ControllerStatusBar
                controllerStatus={controller.controllerStatus}
              />
            </div>
            <div className="w-full lg:w-1/4 flex justify-center lg:justify-end px-0 lg:px-6">
              <Timer callback={handleStatusRefresh} />
            </div>
          </div>
        )}
        <Tabs
          value={activeTab}
          className="mt-5"
          onValueChange={handleTabChange}
        >
          <div className="overflow-x-auto">
            <TabsList className="w-full min-w-max flex">
              {modifiedTabs?.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="sm:hidden">
                    {item.value === "alarm"
                      ? "Alarms"
                      : item.value === "monitoring"
                        ? "Monitor"
                        : item.value === "inputOutput"
                          ? "I/O"
                          : item.value === "variable"
                            ? "Variables"
                            : item.value === "data"
                              ? "Data"
                              : item.value === "datanal"
                                ? "Analysis"
                                : item.value === "job"
                                  ? "Job"
                                  : item.value === "file"
                                    ? "Files"
                                    : item.value === "util"
                                      ? "Util"
                                      : item.value === "maintenance"
                                        ? "Maint"
                                        : item.value === "camera"
                                          ? "Camera"
                                          : item.value === "remotePend"
                                            ? "Remote"
                                            : item.value === "update"
                                              ? "Update"
                                              : item.value === "create"
                                                ? "Create"
                                                : item.label}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
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
              <TabsContent value="monitoring">
                <Monitoring controllerId={params.id} />
              </TabsContent>
              <TabsContent value="data">
                <Data controllerId={params.id} />
              </TabsContent>
              <TabsContent value="datanal">
                <Teaching controllerId={params.id} />
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
