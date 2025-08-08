"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AbsoDataComponent from "./absodata/absodata";
import RegisterComponent from "./register/register";
import { sendTabExitCommand } from "@/utils/service/tab-exit";

const tabItems = [
  { label: "Absolute Data", value: "absoData" },
  { label: "Register", value: "register" },
];

interface DataProps {
  controllerId: string;
}

const Data = ({ controllerId }: DataProps) => {
  const [activeTab, setActiveTab] = useState("absoData");

  const handleTabChange = async (value: string) => {
    if (activeTab && activeTab !== value) {
      try {
        await sendTabExitCommand({
          exitedTab: activeTab,
          controllerId: controllerId,
        });
        console.log(`${activeTab} monitoring stopped`);
      } catch (error) {
        console.error(`Failed to send ${activeTab} exit:`, error);
      }
    }

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

      <TabsContent value="absoData" className="col-span-4">
        <AbsoDataComponent controllerId={controllerId} />
      </TabsContent>

      <TabsContent value="register" className="col-span-4">
        <RegisterComponent controllerId={controllerId} />
      </TabsContent>
    </Tabs>
  );
};

export default Data;
