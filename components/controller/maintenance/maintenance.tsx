"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import MaintenanceList from "./maintenance-list";
import MaintenanceLogList from "./maintenance-log-list";
import MaintenanceForm from "./maintenance-form";
import MaintenanceLogForm from "./maintenance-log-form";
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
import { toast } from "sonner";

const Maintenance = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState<"plans" | "logs">("plans");
  const [planData, setPlanData] = useState<MaintenancePlan[]>([]);
  const [logData, setLogData] = useState<MaintenanceLog[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlan, setIsPlan] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === "plans") {
        const fetchedPlans = await getMaintenancePlans(controllerId);
        setPlanData(fetchedPlans);
        setMaintenancePlans(fetchedPlans);
      } else {
        const [fetchedLogs, fetchedPlans] = await Promise.all([
          getMaintenanceLogs(controllerId),
          getMaintenancePlans(controllerId),
        ]);
        setLogData(fetchedLogs);
        setMaintenancePlans(fetchedPlans);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!controllerId || !activeTab) return;
    fetchData();
  }, [controllerId, activeTab]);

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === "plans") {
        await deleteMaintenancePlan(controllerId, id);
        setPlanData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Plan deleted successfully");
      } else {
        await deleteMaintenanceLog(controllerId, id);
        setLogData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Log deleted successfully");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete item");
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
        await createMaintenancePlan(controllerId, {
          controllerId,
          name: formData.name,
          operationTime: formData.operationTime,
          companyName: formData.companyName,
          maintenanceDate: formData.maintenanceDate,
          servoPowerTime: formData.servoPowerTime,
          nextMaintenanceTime: formData.nextMaintenanceTime,
        });

        const updatedPlans = await getMaintenancePlans(controllerId);
        setPlanData(updatedPlans);
        setMaintenancePlans(updatedPlans);
        toast.success("Plan created successfully");
      } else {
        console.log("Sending log data:", formData);

        await createMaintenanceLog(controllerId, formData);

        const [updatedLogs, updatedPlans] = await Promise.all([
          getMaintenanceLogs(controllerId),
          getMaintenancePlans(controllerId),
        ]);
        setLogData(updatedLogs);
        setMaintenancePlans(updatedPlans);
        toast.success("Log created successfully");
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save data");
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
              data={planData}
              deleteItem={(id) => handleDelete(id)}
              onAddNew={handleAddNew}
            />
          )}
        </TabsContent>

        <TabsContent value="logs" className="col-span-4">
          {isLoading && <p>Loading Logs...</p>}
          {error && <p>Error: {error.message}</p>}
          {!isLoading && !error && (
            <MaintenanceLogList
              data={logData}
              deleteItem={(id) => handleDelete(id)}
              onAddNew={handleAddNew}
              maintenancePlans={maintenancePlans}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isPlan ? "Add New Plan" : "Add New Log"}</DialogTitle>
          </DialogHeader>
          {isPlan ? (
            <MaintenanceForm
              onSubmit={handleSubmit}
              controllerId={controllerId}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <MaintenanceLogForm
              onSubmit={handleSubmit}
              maintenancePlans={maintenancePlans.filter((plan) => plan.id)}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Maintenance;
