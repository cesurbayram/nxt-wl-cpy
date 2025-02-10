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
  // {
  //   label: "Interface Panel",
  //   value: "interPanel",
  // },
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
  {
    label: "Registers",
    value: "register",
  },
];

const InputOutputTabs = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState("extInput");
  const [inputoutput, setInputOutput] = useState<InputOutput[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);

  const fetchData = async () => {
    if (controllerId && activeTab) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getInputOutputType(controllerId, activeTab);
        setInputOutput(data);
        setIsLoading(false);
      } catch (err) {
        setError(error);
        setIsLoading(false);
      }
    }
  };

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

  useEffect(() => {
    if (controllerId && activeTab && isFirstRender.current) {
      isFirstRender.current = false;
      sendActiveTabRequest(activeTab, controllerId);
      fetchData();
    }
  }, [controllerId, activeTab]);

  const handleTabChange = (value: string) => {
    isFirstRender.current = true;
    setActiveTab(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Timer callback={fetchData} />
      </div>
      <Tabs
        defaultValue="extInput"
        className="grid grid-cols-5 gap-3"
        orientation="vertical"
        onValueChange={handleTabChange}
      >
        <TabsList className="flex flex-col h-fit border-2 gap-1">
          {tabItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="w-full">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabItems.map((item) => (
          <TabsContent
            value={item.value}
            key={item.value}
            className="col-span-4"
          >
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
    </div>
  );
};

export default InputOutputTabs;
