"use client";
import React, { useState, Suspense } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { GiAutomaticSas } from "react-icons/gi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

const tabItems = [
  {
    label: "QSet Logs",
    value: "qset-logs",
  },
  {
    label: "Parameter Change Detection",
    value: "parameter-change",
  },
  {
    label: "TCP Log Integration",
    value: "tcp-log",
  },
  {
    label: "CMMS Integration",
    value: "cmms",
  },
];

const AutomatedQSetContent = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "qset-logs";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} className="mt-5" onValueChange={handleTabChange}>
      <TabsList className="w-full flex">
        {tabItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="flex-1">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="qset-logs">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              QSet Logs feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="parameter-change">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Parameter Change Detection feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="tcp-log">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              TCP Log Integration feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="cmms">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              CMMS Integration feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const AutomatedQSetPage = () => {
  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="Automated QSet"
      icon={<GiAutomaticSas size={24} color="#6950e8" />}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <AutomatedQSetContent />
      </Suspense>
    </PageWrapper>
  );
};

export default AutomatedQSetPage;
