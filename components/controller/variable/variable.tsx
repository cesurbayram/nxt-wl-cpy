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
];

const variableList = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState("byte");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);

  const fetchData = async () => {
    if (controllerId && activeTab) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getVariablesByType(controllerId, activeTab);
        setVariables(data);
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
      await sendVariableCommand({ controllerId, activeTab });
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
        defaultValue="byte"
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
                {!isLoading && !error && <VariableList variables={variables} />}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default variableList;
