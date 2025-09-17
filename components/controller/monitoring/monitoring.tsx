"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tork from "./tork/tork";
import TorkExamination from "./tork-examination/tork-examination";
import { clearTorkData } from "@/utils/service/monitoring/tork";

const tabItems = [
  {
    label: "Current Torq",
    value: "tork",
  },
  // {
  //   label: "Tork Examination",
  //   value: "tork-examination",
  // },
];

interface MonitoringProps {
  controllerId: string;
}

const Monitoring = ({ controllerId }: MonitoringProps) => {
  const [activeTab, setActiveTab] = useState("tork");
  const [prevActiveTab, setPrevActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (prevActiveTab === "tork" && activeTab !== "tork") {
      const clearData = async () => {
        try {
          await clearTorkData(controllerId);
          console.log("Tork data cleared successfully");
        } catch (error) {
          console.error("Failed to clear tork data:", error);
        }
      };
      clearData();
    }

    setPrevActiveTab(activeTab);
  }, [activeTab, controllerId, prevActiveTab]);

  return (
    <Tabs
      defaultValue="tork"
      className="flex flex-col lg:grid lg:grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={(value) => setActiveTab(value)}
    >
      <div className="flex flex-col gap-4 lg:col-span-1">
        <div className="overflow-x-auto lg:overflow-x-visible">
          <TabsList className="flex lg:flex-col h-fit border-2 gap-1 w-full lg:w-auto">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="w-full whitespace-nowrap px-2 lg:px-4 flex-shrink-0"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <div className="lg:col-span-4">
        <TabsContent value="tork" className="mt-4 lg:mt-0">
          <Tork controllerId={controllerId} />
        </TabsContent>

        <TabsContent value="tork-examination" className="mt-4 lg:mt-0">
          <TorkExamination controllerId={controllerId} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Monitoring;
