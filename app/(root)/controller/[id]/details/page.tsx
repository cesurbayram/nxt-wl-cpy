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
import Job from "@/components/controller/job/job";
import { sendTabExitCommand } from "@/utils/service/tab-exit";
import Timer from "@/components/shared/timer";
import Monitoring from "@/components/controller/monitoring/monitoring";
import Data from "@/components/controller/data/data";
import RegisterComponent from "@/components/controller/register/register";
import GeneralData from "@/components/controller/general-data/general-data";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

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
    label: "Register",
    value: "register",
  },
  {
    label: "Data",
    value: "data",
  },
  {
    label: "General Data",
    value: "generalData",
  },
  {
    label: "Job",
    value: "job",
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
        register: "register",
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
      return tabItems;
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
      register: "register",
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
          params.id !== "0" ? `Controller Details - ${controller?.name}` : "Create Controller"
        }
        icon={
          params.id !== "0" ? (
            <Eye size={24} color="#6950e8" />
          ) : (
            <GiMechanicalArm size={24} color="#6950e8" />
          )
        }
        headerActions={
          params.id !== "0" ? (
            <Link 
              href="/controller" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Back to Controllers
            </Link>
          ) : undefined
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
                            : item.value === "register"
                              ? "Register"
                              : item.value === "data"
                                ? "Data"
                                : item.value === "generalData"
                                  ? "General"
                                  : item.value === "job"
                                    ? "Job"
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
              <TabsContent value="register">
                <RegisterComponent controllerId={params.id} />
              </TabsContent>
              <TabsContent value="data">
                <Data controllerId={params.id} />
              </TabsContent>
              <TabsContent value="generalData">
                <GeneralData controllerId={params.id} />
              </TabsContent>
              <TabsContent value="job">
                <Job controllerId={params.id} />
              </TabsContent>
              <TabsContent value="monitoring">
                <Monitoring controllerId={params.id} />
              </TabsContent>
            </>
          )}
          {params.id == "0" && (
            <TabsContent value="create">
              <ControllerForm controllerId={params.id} />
            </TabsContent>
          )}
        </Tabs>
      </PageWrapper>
    </>
  );
};

export default Page;
