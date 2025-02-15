"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputOutputList from "./input-output-list";
import { useState, useEffect, useRef } from "react";
import type { InputOutput } from "@/types/inputOutput.types";
import {
  getInputOutputType,
  sendInputOutputCommand,
} from "@/utils/service/input-output";
import Timer from "@/components/shared/timer";

const tabItems = [
  {
    label: "External Input",
    value: "extInput",
  },
  {
    label: "External Output",
    value: "extOutput",
  },
  {
    label: "Universal Input",
    value: "univInput",
  },
  {
    label: "Universal Output",
    value: "univOutput",
  },
  {
    label: "Spesific Input",
    value: "spesInput",
  },
  {
    label: "Spesific Output",
    value: "spesOutput",
  },
  // {
  //   label: "Interface Panel",
  //   value: "interPanel",
  // },
  {
    label: "Auxiliary Relay",
    value: "auxRel",
  },
  {
    label: "Control Status",
    value: "contStat",
  },
  {
    label: "Pseudo Input",
    value: "pseInput",
  },
  {
    label: "Network Input",
    value: "netInput",
  },
  {
    label: "Network Output",
    value: "netOutput",
  },
  // {
  //   label: "Registers",
  //   value: "register",
  // },
];

const InputOutputTabs = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState("extInput");
  const [inputoutput, setInputOutput] = useState<InputOutput[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);
  const currentTabRef = useRef(activeTab);

  const sendActiveTabRequest = async (
    activeTab: string,
    controllerId: string
  ) => {
    try {
      await sendInputOutputCommand({ controllerId, activeTab });
    } catch (error) {
      console.error("Failed to send command to controller: ", error);
    }
  };

  const fetchInputOutput = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      const data = await getInputOutputType(
        controllerId,
        currentTabRef.current
      );
      setInputOutput(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching input/output:", err);
      setError(err as Error);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    currentTabRef.current = activeTab;

    if (controllerId && activeTab && isFirstRender.current) {
      isFirstRender.current = false;
      sendActiveTabRequest(activeTab, controllerId);
      fetchInputOutput(true);
    }
  }, [controllerId, activeTab]);

  const handleTabChange = (value: string) => {
    isFirstRender.current = true;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="extInput"
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
        <div className="w-full px-6 mb-2">
          <Timer callback={() => fetchInputOutput(false)} />
        </div>
      </div>

      {tabItems.map((item) => (
        <TabsContent value={item.value} key={item.value} className="col-span-4">
          {activeTab === item.value && (
            <>
              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}
              {!isLoading && !error && (
                <InputOutputList inputOutput={inputoutput} />
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default InputOutputTabs;
