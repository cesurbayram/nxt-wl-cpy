"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useState, useEffect } from "react";
import MaintenanceList from "./maintenance-list";
import MaintenanceForm from "./maintenance-form";
import {
  getMaintenancePlans,
  getMaintenanceLogs,
  deleteMaintenancePlan,
  deleteMaintenanceLog,
  createMaintenancePlan,
  createMaintenanceLog,
} from "@/utils/service/maintenance";
import { MaintenancePlan, MaintenanceLog } from "@/types/maintenance.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Maintenance = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState<"plans" | "logs">("plans");
  const [data, setData] = useState<MaintenancePlan[] | MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlan, setIsPlan] = useState(true);

  useEffect(() => {
    if (!controllerId || !activeTab) return;

    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        if (activeTab === "plans") {
          const fetchedPlans = await getMaintenancePlans(controllerId);
          setData(fetchedPlans);
        } else if (activeTab === "logs") {
          const fetchedLogs = await getMaintenanceLogs(controllerId);
          setData(fetchedLogs);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [controllerId, activeTab]);

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === "plans") {
        await deleteMaintenancePlan(controllerId, id);
        setData((prev) =>
          (prev as MaintenancePlan[]).filter((item) => item.id !== id)
        );
      } else if (activeTab === "logs") {
        await deleteMaintenanceLog(controllerId, id);
        setData((prev) =>
          (prev as MaintenanceLog[]).filter((item) => item.id !== id)
        );
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleAddNew = () => {
    setIsDialogOpen(true);
    setIsPlan(activeTab === "plans");
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      if (isPlan) {
        const planData = {
          controllerId,
          name: formData.name,
          operationTime: formData.operationTime,
          maxOperationTime: formData.maxOperationTime,
          nextMaintenance: formData.nextMaintenance || null,
          overallTime: formData.overallTime || null,
        };

        await createMaintenancePlan(controllerId, planData);
      } else {
        const logData = {
          maintenanceId: formData.maintenanceId,
          maintenanceTime: formData.maintenanceTime,
          technician: formData.technician,
          description: formData.description || null,
        };
        await createMaintenanceLog(controllerId, logData);
      }

      const updatedData = isPlan
        ? await getMaintenancePlans(controllerId)
        : await getMaintenanceLogs(controllerId);

      setData(updatedData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Form sent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Tabs
        defaultValue="plans"
        className="grid grid-cols-5 gap-3"
        orientation="vertical"
        onValueChange={(value) => setActiveTab(value as "plans" | "logs")}
      >
        <TabsList className="flex flex-col h-fit border-2 gap-1">
          <TabsTrigger value="plans" className="w-full">
            Plans
          </TabsTrigger>
          <TabsTrigger value="logs" className="w-full">
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="col-span-4">
          {isLoading && <p>Loading Plans...</p>}
          {error && <p>Error: {error.message}</p>}
          {!isLoading && !error && (
            <MaintenanceList
              data={data as MaintenancePlan[]}
              activeTab={activeTab}
              deleteItem={(id) => handleDelete(id)}
              onAddNew={handleAddNew}
            />
          )}
        </TabsContent>

        <TabsContent value="logs" className="col-span-4">
          {isLoading && <p>Loading Logs...</p>}
          {error && <p>Error: {error.message}</p>}
          {!isLoading && !error && (
            <MaintenanceList
              data={data as MaintenanceLog[]}
              activeTab={activeTab}
              deleteItem={(id) => handleDelete(id)}
              onAddNew={handleAddNew}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isPlan ? "Add New Plan" : "Add New Log"}</DialogTitle>
          </DialogHeader>
          <MaintenanceForm
            onSubmit={handleSubmit}
            isPlan={isPlan}
            controllerId={controllerId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Maintenance;
