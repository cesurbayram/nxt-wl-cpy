"use client";
import React, { useState, Suspense } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { GiLightningArc } from "react-icons/gi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

const tabItems = [
  {
    label: "Lifetime Tracking",
    value: "lifetime-tracking",
  },
  {
    label: "Motor Lifetime Monitoring",
    value: "motor-lifetime",
  },
  {
    label: "Contactors Logging",
    value: "contactors",
  },
  {
    label: "Environmental Factors",
    value: "environmental",
  },
];

const PredictiveMaintenanceContent = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "lifetime-tracking";
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
                {item.value === "lifetime-tracking"
                  ? "Lifetime"
                  : item.value === "motor-lifetime"
                  ? "Motor"
                  : item.value === "contactors"
                  ? "Contacts"
                  : item.value === "environmental"
                  ? "Environ"
                  : item.label.split(" ")[0]}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="lifetime-tracking">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Lifetime Tracking feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="motor-lifetime">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Motor Lifetime Monitoring feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="contactors">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Contactors Logging feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="environmental">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Environmental Factors feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const PredictiveMaintenancePage = () => {
  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="Predictive Maintenance"
      icon={<GiLightningArc size={24} color="#6950e8" />}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PredictiveMaintenanceContent />
      </Suspense>
    </PageWrapper>
  );
};

export default PredictiveMaintenancePage;
