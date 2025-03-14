"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tork from "./tork/tork";

const tabItems = [
  {
    label: "Tork",
    value: "tork",
  },
];

interface MonitoringProps {
  controllerId: string;
}

const Monitoring = ({ controllerId }: MonitoringProps) => {
  const [activeTab, setActiveTab] = useState("tork");

  return (
    <Tabs
      defaultValue="tork"
      className="grid grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={(value) => setActiveTab(value)}
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

      <TabsContent value="tork" className="col-span-4">
        <Tork controllerId={controllerId} />
      </TabsContent>
    </Tabs>
  );
};

export default Monitoring;
