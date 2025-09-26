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
import { sendTabExitCommand } from "@/utils/service/tab-exit";

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
  const previousTabRef = useRef<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (previousTabRef.current && controllerId) {
        sendTabExitCommand({
          exitedTab: previousTabRef.current,
          controllerId: controllerId,
        }).catch((error) => {
          console.error(
            `Failed to send ${previousTabRef.current}Exit on unmount:`,
            error
          );
        });
      }
    };
  }, [controllerId]);

  const handleTabChange = async (value: string) => {

    const currentTab = previousTabRef.current || activeTab;

    if (currentTab && currentTab !== value) {
      try {
        await sendTabExitCommand({
          exitedTab: currentTab,
          controllerId: controllerId,
        });
        console.log(`${currentTab}Exit sent`);
      } catch (error) {
        console.error(`Failed to send ${currentTab}Exit:`, error);
      }
    }

    previousTabRef.current = value;
    isFirstRender.current = true;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="extInput"
      className="flex flex-col lg:grid lg:grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={handleTabChange}
    >
      <div className="flex flex-col gap-4 lg:col-span-1">
        <div className="overflow-x-auto lg:overflow-x-visible">
          <TabsList className="flex lg:flex-col h-fit border-2 gap-1 w-full lg:w-auto">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="w-full whitespace-nowrap px-2 lg:px-4 text-xs lg:text-sm flex-shrink-0"
              >
                <span className="lg:hidden">
                  {item.label.length > 8
                    ? item.label.substring(0, 8) + "..."
                    : item.label}
                </span>
                <span className="hidden lg:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-full px-2 lg:px-6 mb-2">
          <Timer callback={() => fetchInputOutput(false)} />
        </div>
      </div>

      <div className="lg:col-span-4">
        {tabItems.map((item) => (
          <TabsContent
            value={item.value}
            key={item.value}
            className="mt-4 lg:mt-0"
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
      </div>
    </Tabs>
  );
};

export default InputOutputTabs;
