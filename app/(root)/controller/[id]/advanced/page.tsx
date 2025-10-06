"use client";

import React, { useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ControllerForm from "@/components/controller/controller-form";
import Link from "next/link";
import { ArrowLeft, Sliders } from "lucide-react";

const tabItems = [
  { label: "Camera", value: "camera" },
  { label: "Remote Pendant", value: "remotePend" },
  { label: "Update Controller", value: "update" },
];

const AdvancedPage = ({ params }: { params: { id: string } }) => {
  const [activeTab, setActiveTab] = useState("camera");

  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="Advanced Settings"
      icon={<Sliders size={24} color="#6950e8" />}
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
        onValueChange={setActiveTab}
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

        <TabsContent value="camera">
          <div className="p-6 text-center text-gray-500">
            <p>Camera feature coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="remotePend">
          <div className="p-6 text-center text-gray-500">
            <p>Remote Pendant feature coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="update">
          <ControllerForm controllerId={params.id} />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
};

export default AdvancedPage;

