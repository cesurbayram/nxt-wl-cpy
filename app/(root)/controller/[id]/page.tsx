"use client";
import React, { useMemo } from "react";
import { Controller } from "@/types/controller.types";
import { getControllerById } from "@/utils/service/controller";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/components/shared/page-wrapper";
import { LiaEditSolid } from "react-icons/lia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Alarm from "@/components/controller/alarm/alarm";
import InputOutput from "@/components/controller/input-output/input-output";
import Variable from "@/components/controller/variable/variable";
import { GiMechanicalArm } from "react-icons/gi";
import ControllerForm from "@/components/controller/controller-form";
import ControllerStatusBar from "@/components/controller/controller-status-bar";

const tabItems = [
  {
    label: "Alarms",
    value: "alarm",
  },
  {
    label: "Monitoring",
    value: "monitoring",
  },
  {
    label: "I/O",
    value: "inputOutput",
  },
  {
    label: "Variables",
    value: "variable",
  },
  {
    label: "Data",
    value: "data",
  },
  {
    label: "Job",
    value: "job",
  },
  {
    label: "Files",
    value: "file",
  },
  {
    label: "Utilization",
    value: "util",
  },
  {
    label: "Maintenance",
    value: "maintenance",
  },
  {
    label: "Camera",
    value: "camera",
  },
  {
    label: "Remote Pendant",
    value: "remotePend",
  },
];

const Page = ({ params }: { params: { id: string } }) => {
  const { data: controller } = useQuery<Controller>({
    queryFn: async () => await getControllerById(params.id),
    queryKey: ["controller", params.id],
    enabled: params.id != "0",
    gcTime: 0,
  });

  const modifiedTabs = useMemo(() => {
    if (params.id != "0") {
      return [...tabItems, { label: "Update Controller", value: "update" }];
    } else if (params.id == "0") {
      return [{ label: "Create Controller", value: "create" }];
    }
  }, [params.id]);

  return (
    <>
      <PageWrapper
        shownHeaderButton={false}
        pageTitle={
          params.id !== "0" ? `Detail ${controller?.name}` : "Create Controller"
        }
        icon={
          params.id !== "0" ? (
            <LiaEditSolid size={24} color="#6950e8" />
          ) : (
            <GiMechanicalArm size={24} color="#6950e8" />
          )
        }
      >
        {params.id != '0' && controller?.controllerStatus &&  <ControllerStatusBar controllerStatus={controller?.controllerStatus} />}
        <Tabs
          defaultValue={params.id == "0" ? "create" : "alarm"}
          className="mt-5"
        >
          <TabsList className="w-full flex">
            {modifiedTabs?.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex-1"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {params.id != "0" && (
            <>
              <TabsContent value="alarm">
                <Alarm />
              </TabsContent>
              <TabsContent value="inputOutput">
                <InputOutput />
              </TabsContent>
              <TabsContent value="variable">
                <Variable controllerId={params.id} />
              </TabsContent>
            </>
          )}
          <TabsContent value={params.id == "0" ? "create" : "update"}>
            <ControllerForm controllerId={params.id} />
          </TabsContent>
        </Tabs>
      </PageWrapper>
    </>
  );
};

export default Page;
