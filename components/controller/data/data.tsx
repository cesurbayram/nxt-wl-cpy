"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AbsoDataComponent from "./absodata/absodata";

const tabItems = [{ label: "Absolute Data", value: "absoData" }];

interface DataProps {
  controllerId: string;
}

const Data = ({ controllerId }: DataProps) => {
  const [activeTab, setActiveTab] = useState("absoData");

  return (
    <Tabs
      defaultValue="absoData"
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

      <TabsContent value="absoData" className="col-span-4">
        <AbsoDataComponent controllerId={controllerId} />
      </TabsContent>
    </Tabs>
  );
};

export default Data;
