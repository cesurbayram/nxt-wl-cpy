"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useState, useEffect } from "react";
import { getAlarmsByControllerId } from "@/utils/service/alarm";
import AlarmList from "./alarm-list";
import { Alarm } from "@/types/alarm.types";

const tabItems = [
  {
    label: "Detected",
    value: "detected",
  },
  {
    label: "ALMHIST.DAT",
    value: "almhist",
  },
];

const almhistTypes = [
  { label: "MAJOR", value: "MAJOR" },
  { label: "MINOR", value: "MINOR" },
  { label: "SYSTEM", value: "SYSTEM" },
  { label: "USER", value: "USER" },
  { label: "OFF-LINE", value: "OFF-LINE" },
];

const AlarmTabs = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState("detected");
  const [activeType, setActiveType] = useState("MAJOR");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (controllerId && activeTab) {
      setIsLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          if (activeTab === "almhist") {
            const data = await getAlarmsByControllerId(
              controllerId,
              activeTab,
              activeType
            );
            setAlarms(data);
          } else {
            const data = await getAlarmsByControllerId(controllerId, activeTab);
            setAlarms(data);
          }
          setIsLoading(false);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Unknown error occurred")
          );
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [controllerId, activeTab, activeType]);

  return (
    <Tabs
      defaultValue="detected"
      className="grid grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={(value) => setActiveTab(value)}
    >
      <TabsList className="flex flex-col h-fit border-2 gap-1">
        {tabItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="w-full">
            {item.label}
          </TabsTrigger>
        ))}
        {activeTab === "almhist" && (
          <div className="flex flex-col mt-2">
            {almhistTypes.map((type) => (
              <button
                key={type.value}
                className={`w-full py-2 px-4 border ${
                  activeType === type.value ? "bg-gray-200" : ""
                }`}
                onClick={() => setActiveType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </TabsList>

      {tabItems.map((item) => (
        <TabsContent value={item.value} key={item.value} className="col-span-4">
          {activeTab === item.value && (
            <>
              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}
              {!isLoading && !error && (
                <AlarmList alarms={alarms} activeTab={activeTab} />
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AlarmTabs;
