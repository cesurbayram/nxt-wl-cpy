"use client";
import React, { useState, Suspense } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CmosBackupLogs from "@/components/system-expectations/cmos-backup/cmos-backup";
import AlarmErrorLogs from "@/components/system-expectations/alarm-error/alarm-error";
import AbsoluteDataLogs from "@/components/system-expectations/abso-log-change/abso-change";
import TcpChangeLogs from "@/components/system-expectations/tcp-change/tcp-change";
import AutoToolChangeLogs from "@/components/system-expectations/auto-tool-change/auto-tool-change";
import { useSearchParams } from "next/navigation";

const tabItems = [
  {
    label: "CMOS & Backup Logs",
    value: "cmos-backup",
  },
  {
    label: "Alarm / Error Logs",
    value: "alarm-error",
  },
  {
    label: "Absolute Data Logs",
    value: "abso-log-change",
  },
  {
    label: "TCP Logs",
    value: "tcp-change",
  },
  {
    label: "Automatic Tool Logs",
    value: "auto-tool-change",
  },
];

const SystemExpectationsContent = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "cmos-backup";
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

      <TabsContent value="cmos-backup">
        <CmosBackupLogs />
      </TabsContent>
      <TabsContent value="alarm-error">
        <AlarmErrorLogs />
      </TabsContent>
      <TabsContent value="abso-log-change">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Absolute Data Logs feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="tcp-change">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              TCP Logs feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="auto-tool-change">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500">
              Automatic Tool Logs feature will be available soon
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const SystemExpectationsPage = () => {
  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="System Expectations"
      icon={<MdOutlineSettingsBackupRestore size={24} color="#6950e8" />}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SystemExpectationsContent />
      </Suspense>
    </PageWrapper>
  );
};

export default SystemExpectationsPage;
