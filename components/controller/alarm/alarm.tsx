"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useState, useEffect, useRef } from "react";
import { getAlarmsByControllerId } from "@/utils/service/alarm";
import { getControllerById } from "@/utils/service/controller";
import AlarmList from "./alarm-list";
import { Alarm } from "@/types/alarm.types";
import Timer from "@/components/shared/timer";

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
  const [controllerInfo, setControllerInfo] = useState({
    name: "",
    ipAddress: "",
  });
  const isFirstRender = useRef(true);
  const currentTabRef = useRef(activeTab);
  const currentTypeRef = useRef(activeType);

  useEffect(() => {
    const fetchControllerInfo = async () => {
      try {
        const controller = await getControllerById(controllerId);
        setControllerInfo({
          name: controller.name || "",
          ipAddress: controller.ipAddress || "",
        });
      } catch (error) {
        console.error("Error fetching controller info:", error);
        setControllerInfo({ name: "", ipAddress: "" });
      }
    };

    if (controllerId) {
      fetchControllerInfo();
    }
  }, [controllerId]);

  const fetchAlarms = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);

      if (currentTabRef.current === "almhist") {
        const data = await getAlarmsByControllerId(
          controllerId,
          currentTabRef.current,
          currentTypeRef.current
        );
        setAlarms(data);
      } else {
        const data = await getAlarmsByControllerId(
          controllerId,
          currentTabRef.current
        );
        setAlarms(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    currentTabRef.current = activeTab;
    currentTypeRef.current = activeType;

    if (controllerId && activeTab && isFirstRender.current) {
      isFirstRender.current = false;
      fetchAlarms(true);
    }
  }, [controllerId, activeTab, activeType]);

  const handleTabChange = (value: string) => {
    isFirstRender.current = true;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="detected"
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
        <div className="w-full px-6 mb-2">
          <Timer callback={() => fetchAlarms(false)} />
        </div>
      </div>

      {tabItems.map((item) => (
        <TabsContent value={item.value} key={item.value} className="col-span-4">
          {activeTab === item.value && (
            <>
              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}
              {!isLoading && !error && (
                <AlarmList
                  alarms={alarms}
                  activeTab={activeTab}
                  ipAddress={controllerInfo.ipAddress}
                  name={controllerInfo.name}
                  activeType={activeType}
                />
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AlarmTabs;
