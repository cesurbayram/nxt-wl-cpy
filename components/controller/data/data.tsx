"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AbsoDataComponent from "./absodata/absodata";
import RegisterComponent from "./register/register";
import GeneralRegisterComponent from "./general-register/general-register";
import GeneralSignalComponent from "./general-signal/general-signal";
import GeneralVariableComponent from "./general-variable/general-variable";
import { sendTabExitCommand } from "@/utils/service/tab-exit";
import { sendGeneralVariableExitCommand, sendGeneralSignalExitCommand, sendGeneralRegisterExitCommand } from "@/utils/service/data/general-data";
import { GeneralVariableType } from "@/types/general-data.types";

const tabItems = [
  { label: "Absolute Data", value: "absoData" },
  { label: "Register", value: "register" },
  { label: "General Register", value: "generalRegister" },
  { label: "General Signal", value: "generalSignal" },
  { label: "General Variable", value: "generalVariable" },
];

interface DataProps {
  controllerId: string;
}

const Data = ({ controllerId }: DataProps) => {
  const [activeTab, setActiveTab] = useState("absoData");
  const previousTabRef = useRef<string | null>(null);


  const generalVariableMonitoringRef = useRef<{
    isMonitoring: boolean;
    generalNo?: string;
    variableType?: GeneralVariableType;
  }>({ isMonitoring: false });


  const generalSignalMonitoringRef = useRef<{
    isMonitoring: boolean;
    generalNo?: string;
  }>({ isMonitoring: false });


  const generalRegisterMonitoringRef = useRef<{
    isMonitoring: boolean;
    generalNo?: string;
  }>({ isMonitoring: false });

  const handleGeneralVariableMonitoringChange = (
    isMonitoring: boolean,
    generalNo?: string,
    variableType?: GeneralVariableType
  ) => {
    generalVariableMonitoringRef.current = {
      isMonitoring,
      generalNo,
      variableType,
    };
  };

  const handleGeneralSignalMonitoringChange = (
    isMonitoring: boolean,
    generalNo?: string
  ) => {
    generalSignalMonitoringRef.current = {
      isMonitoring,
      generalNo,
    };
  };

  const handleGeneralRegisterMonitoringChange = (
    isMonitoring: boolean,
    generalNo?: string
  ) => {
    generalRegisterMonitoringRef.current = {
      isMonitoring,
      generalNo,
    };
  };

  const handleTabChange = async (value: string) => {
    const currentTab = previousTabRef.current || activeTab;

    if (currentTab && currentTab !== value) {
      try {

        if (currentTab === "generalVariable" && generalVariableMonitoringRef.current.isMonitoring) {
          const { generalNo, variableType } = generalVariableMonitoringRef.current;
          if (generalNo && variableType) {
            await sendGeneralVariableExitCommand(controllerId, generalNo, variableType);
            console.log(`General Variable monitoring stopped for ${variableType.toUpperCase()} ${generalNo}`);
            generalVariableMonitoringRef.current = { isMonitoring: false };
          }
        }

        else if (currentTab === "generalSignal" && generalSignalMonitoringRef.current.isMonitoring) {
          const { generalNo } = generalSignalMonitoringRef.current;
          if (generalNo) {
            await sendGeneralSignalExitCommand(controllerId, generalNo);
            console.log(`General Signal monitoring stopped for ${generalNo}`);
            generalSignalMonitoringRef.current = { isMonitoring: false };
          }
        }

        else if (currentTab === "generalRegister" && generalRegisterMonitoringRef.current.isMonitoring) {
          const { generalNo } = generalRegisterMonitoringRef.current;
          if (generalNo) {
            await sendGeneralRegisterExitCommand(controllerId, generalNo);
            console.log(`General Register monitoring stopped for ${generalNo}`);
            generalRegisterMonitoringRef.current = { isMonitoring: false };
          }
        }

        else {
          await sendTabExitCommand({
            exitedTab: currentTab,
            controllerId: controllerId,
          });
          console.log(`${currentTab} monitoring stopped`);
        }
      } catch (error) {
        console.error(`Failed to send ${currentTab} exit:`, error);
      }
    }

    previousTabRef.current = value;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="absoData"
      className="grid grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={handleTabChange}
    >
      <div className="flex flex-col gap-4">
        <TabsList className="flex flex-col h-fit border-2 gap-1">
          {tabItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="w-full">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="absoData" className="mt-4 lg:mt-0 lg:col-span-4">
        <AbsoDataComponent controllerId={controllerId} />
      </TabsContent>

      <TabsContent value="register" className="mt-4 lg:mt-0 lg:col-span-4">
        <RegisterComponent controllerId={controllerId} />
      </TabsContent>

      <TabsContent value="generalRegister" className="mt-4 lg:mt-0 lg:col-span-4">
        <GeneralRegisterComponent
          controllerId={controllerId}
          onMonitoringChange={handleGeneralRegisterMonitoringChange}
        />
      </TabsContent>

      <TabsContent value="generalSignal" className="mt-4 lg:mt-0 lg:col-span-4">
        <GeneralSignalComponent
          controllerId={controllerId}
          onMonitoringChange={handleGeneralSignalMonitoringChange}
        />
      </TabsContent>

      <TabsContent value="generalVariable" className="mt-4 lg:mt-0 lg:col-span-4">
        <GeneralVariableComponent
          controllerId={controllerId}
          onMonitoringChange={handleGeneralVariableMonitoringChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default Data;
