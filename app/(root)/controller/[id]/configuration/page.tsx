"use client";

import React, { useState, useRef } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Files from "@/components/controller/files/files";
import Utilization from "@/components/controller/utilization/utilization";
import Maintenance from "@/components/controller/maintenance/maintenance";
import { Teaching } from "@/components/controller/data-analysis/teaching/teaching";
import { sendTabExitCommand } from "@/utils/service/tab-exit";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

const tabItems = [
  { label: "Files", value: "file" },
  { label: "Utilization", value: "util" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Data Analysis", value: "datanal" },
];

const ConfigurationPage = ({ params }: { params: { id: string } }) => {
  const [activeTab, setActiveTab] = useState("file");
  const previousTabRef = useRef<string | null>(null);

  const handleTabChange = async (value: string) => {
    const currentTab = previousTabRef.current || activeTab;

    const tabToSubTabMap: Record<string, string> = {
      file: "file",
      util: "util",
      maintenance: "maintenance",
      datanal: "datanal",
    };

    if (currentTab && tabToSubTabMap[currentTab]) {
      try {
        await sendTabExitCommand({
          exitedTab: tabToSubTabMap[currentTab],
          controllerId: params.id,
        });
      } catch (error) {
        console.error("Failed to send tab-exit command:", error);
      }
    }

    previousTabRef.current = value;
    setActiveTab(value);
  };

  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="Configuration & Tools"
      icon={<Wrench size={24} color="#6950e8" />}
      headerActions={
        <Link 
          href="/controller" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={18} />
          Back to Controllers
        </Link>
      }
    >
      <Tabs
        value={activeTab}
        className="mt-5"
        onValueChange={handleTabChange}
      >
        <div className="overflow-x-auto">
          <TabsList className="w-full min-w-max flex">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex-1 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="file">
          <Files controllerId={params.id} />
        </TabsContent>
        <TabsContent value="util">
          <Utilization controllerId={params.id} />
        </TabsContent>
        <TabsContent value="maintenance">
          <Maintenance controllerId={params.id} />
        </TabsContent>
        <TabsContent value="datanal">
          <Teaching controllerId={params.id} />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
};

export default ConfigurationPage;

