"use client";       
import React, { useState, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import TabSkeleton from "@/components/shared/tab-skeleton";
import { Info, Activity, AlertTriangle, Database, Wrench } from "lucide-react";

const BasicInfoTab = dynamic(() => import("./tabs/basic-info"), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const StatusTab = dynamic(() => import("./tabs/status"), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const AlarmLogTab = dynamic(() => import("./tabs/alarm-log"), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const BackupTab = dynamic(() => import("./tabs/backup"), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const MaintenanceTab = dynamic(() => import("./tabs/maintenance"), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

interface ControllerTabsProps {
  controllerId: string;
  controllerName?: string;
}

export default function ControllerTabs({
  controllerId,
  controllerName,
}: ControllerTabsProps) {
  const [activeTab, setActiveTab] = useState("basic-info");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
          {controllerName || "Controller Details"}
        </h2>
      </div>


      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col mt-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <button
            onClick={() => setActiveTab("basic-info")}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${activeTab === "basic-info"
              ? "bg-blue-50 border-blue-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className={`mb-2 p-2 rounded-lg ${activeTab === "basic-info" ? "bg-blue-100" : "bg-gray-100"
              }`}>
              <Info className={`h-6 w-6 ${activeTab === "basic-info" ? "text-blue-600" : "text-gray-600"
                }`} />
            </div>
            <span className={`text-sm font-medium ${activeTab === "basic-info" ? "text-blue-700" : "text-gray-700"
              }`}>
              Basic Info
            </span>
          </button>

          <button
            onClick={() => setActiveTab("status")}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${activeTab === "status"
              ? "bg-blue-50 border-blue-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className={`mb-2 p-2 rounded-lg ${activeTab === "status" ? "bg-blue-100" : "bg-gray-100"
              }`}>
              <Activity className={`h-6 w-6 ${activeTab === "status" ? "text-blue-600" : "text-gray-600"
                }`} />
            </div>
            <span className={`text-sm font-medium ${activeTab === "status" ? "text-blue-700" : "text-gray-700"
              }`}>
              Status
            </span>
          </button>

          <button
            onClick={() => setActiveTab("alarm-log")}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${activeTab === "alarm-log"
              ? "bg-blue-50 border-blue-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className={`mb-2 p-2 rounded-lg ${activeTab === "alarm-log" ? "bg-blue-100" : "bg-gray-100"
              }`}>
              <AlertTriangle className={`h-6 w-6 ${activeTab === "alarm-log" ? "text-blue-600" : "text-gray-600"
                }`} />
            </div>
            <span className={`text-sm font-medium ${activeTab === "alarm-log" ? "text-blue-700" : "text-gray-700"
              }`}>
              Alarm & Log
            </span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${activeTab === "backup"
              ? "bg-blue-50 border-blue-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className={`mb-2 p-2 rounded-lg ${activeTab === "backup" ? "bg-blue-100" : "bg-gray-100"
              }`}>
              <Database className={`h-6 w-6 ${activeTab === "backup" ? "text-blue-600" : "text-gray-600"
                }`} />
            </div>
            <span className={`text-sm font-medium ${activeTab === "backup" ? "text-blue-700" : "text-gray-700"
              }`}>
              Backup
            </span>
          </button>

          <button
            onClick={() => setActiveTab("maintenance")}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${activeTab === "maintenance"
              ? "bg-blue-50 border-blue-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className={`mb-2 p-2 rounded-lg ${activeTab === "maintenance" ? "bg-blue-100" : "bg-gray-100"
              }`}>
              <Wrench className={`h-6 w-6 ${activeTab === "maintenance" ? "text-blue-600" : "text-gray-600"
                }`} />
            </div>
            <span className={`text-sm font-medium ${activeTab === "maintenance" ? "text-blue-700" : "text-gray-700"
              }`}>
              Maintenance
            </span>
          </button>
        </div>


        <div className="flex-1 overflow-y-auto">
          <TabsContent value="basic-info" className="mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <BasicInfoTab controllerId={controllerId} />
            </Suspense>
          </TabsContent>

          {activeTab === "status" && (
            <TabsContent value="status" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <StatusTab controllerId={controllerId} />
              </Suspense>
            </TabsContent>
          )}

          {activeTab === "alarm-log" && (
            <TabsContent value="alarm-log" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <AlarmLogTab controllerId={controllerId} controllerName={controllerName} />
              </Suspense>
            </TabsContent>
          )}

          {activeTab === "backup" && (
            <TabsContent value="backup" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <BackupTab controllerId={controllerId} />
              </Suspense>
            </TabsContent>
          )}

          {activeTab === "maintenance" && (
            <TabsContent value="maintenance" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <MaintenanceTab controllerId={controllerId} />
              </Suspense>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}

