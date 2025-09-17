"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VariableList from "./variable-list";
import { useState, useEffect, useRef } from "react";
import {
  getVariablesByType,
  sendVariableCommand,
} from "@/utils/service/variable";
import { Variable } from "@/types/variable.types";
import Timer from "@/components/shared/timer";
import LoadingUi from "@/components/shared/loading-ui";
import { sendTabExitCommand } from "@/utils/service/tab-exit";

const tabItems = [
  {
    label: "BYTE",
    value: "byte",
  },
  {
    label: "INTEGER",
    value: "int",
  },
  {
    label: "DOUBLE",
    value: "double",
  },
  {
    label: "REAL",
    value: "real",
  },
  {
    label: "STRING",
    value: "string",
  },
  // {
  //   label: "POSITION",
  //   value: "position",
  // },
  // {
  //   label: "VAR.DAT",
  //   value: "vardat",
  // },
];

const variableList = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState("byte");
  const [variables, setVariables] = useState<Variable[]>([]);
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
      await sendVariableCommand({ controllerId, activeTab });
    } catch (error) {
      console.error("Failed to send command to controller: ", error);
    }
  };

  const listVariables = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      const variableRes = await getVariablesByType(
        controllerId,
        currentTabRef.current
      );
      setVariables(variableRes);
      setError(null);
    } catch (error) {
      console.error("/api/controller: ", error);
      setError(error as Error);
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

      listVariables(true);
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
    if (previousTabRef.current && previousTabRef.current !== value) {
      try {
        await sendTabExitCommand({
          exitedTab: previousTabRef.current,
          controllerId: controllerId,
        });
        console.log(`${previousTabRef.current}Exit sent`);
      } catch (error) {
        console.error(`Failed to send ${previousTabRef.current}Exit:`, error);
      }
    }

    previousTabRef.current = value;
    isFirstRender.current = true;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="byte"
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
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-full px-2 lg:px-6 mb-2">
          <Timer callback={() => listVariables(false)} />
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
                {!isLoading && !error && <VariableList variables={variables} />}
              </>
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default variableList;
