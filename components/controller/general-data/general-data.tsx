"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralRegisterComponent from "./general-register/general-register";
import GeneralSignalComponent from "./general-signal/general-signal";
import GeneralVariableComponent from "./general-variable/general-variable";
import { sendGeneralVariableExitCommand } from "@/utils/service/general-data/general-variable";
import { sendGeneralSignalExitCommand } from "@/utils/service/general-data/general-signal";
import { sendGeneralRegisterExitCommand } from "@/utils/service/general-data/general-register";
import { GeneralVariableType } from "@/types/general-data.types";

const tabItems = [
  { label: "General Register", value: "generalRegister" },
  { label: "General Signal", value: "generalSignal" },
  { label: "General Variable", value: "generalVariable" },
];

interface GeneralDataProps {
  controllerId: string;
}

const GeneralData = ({ controllerId }: GeneralDataProps) => {
  const [activeTab, setActiveTab] = useState("generalRegister");
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
      } catch (error) {
        console.error(`Failed to send ${currentTab} exit:`, error);
      }
    }

    previousTabRef.current = value;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="generalRegister"
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

export default GeneralData;

