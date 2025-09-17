"use client";
import React, { useState, Suspense } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { FaHubspot } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

const tabItems = [
  {
    label: "Welding Parameters & Speed Tracking",
    value: "welding-parameters",
  },
  {
    label: "Power & Gas Flow Monitoring",
    value: "power-gas-flow",
  },
  {
    label: "Parameter Deviation Alerts",
    value: "parameter-deviation",
  },
  {
    label: "Fronius Alarm Logs",
    value: "fronius-alarm",
  },
];

const PredictiveQualityContent = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "welding-parameters";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} className="mt-5" onValueChange={handleTabChange}>
      <div className="overflow-x-auto">
        <TabsList className="w-full min-w-max flex">
          {tabItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="flex-1 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
            >
              <span className="sm:hidden">
                {item.value === "welding-parameters"
                  ? "Welding"
                  : item.value === "power-gas-flow"
                  ? "Power/Gas"
                  : item.value === "parameter-deviation"
                  ? "Deviation"
                  : item.value === "fronius-alarm"
                  ? "Fronius"
                  : item.label.split(" ")[0]}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="welding-parameters">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Welding Parameters & Speed Tracking feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="power-gas-flow">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Power & Gas Flow Monitoring feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="parameter-deviation">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Parameter Deviation Alerts feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="fronius-alarm">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Fronius Alarm Logs feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const PredictiveQualityPage = () => {
  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="Predictive Quality"
      icon={<FaHubspot size={24} color="#6950e8" />}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PredictiveQualityContent />
      </Suspense>
    </PageWrapper>
  );
};

export default PredictiveQualityPage;
