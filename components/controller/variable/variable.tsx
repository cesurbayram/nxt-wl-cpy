"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VariableList from "./variable-list";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getVariablesByType,
  sendVariableCommand,
} from "@/utils/service/variable";
import { Variable } from "@/types/variable.types";
import Timer from "@/components/shared/timer";
import LoadingUi from "@/components/shared/loading-ui";

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
      // Sadece ilk yüklemede loading göster
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
      // İlk yüklemede loading göster
      listVariables(true);
    }
  }, [controllerId, activeTab]);

  const handleTabChange = (value: string) => {
    isFirstRender.current = true;
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="byte"
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
          <Timer callback={() => listVariables(false)} />
        </div>
      </div>

      {tabItems.map((item) => (
        <TabsContent value={item.value} key={item.value} className="col-span-4">
          {activeTab === item.value && (
            <>
              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}
              {!isLoading && !error && <VariableList variables={variables} />}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default variableList;
