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
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Maintenance = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState<"plans" | "logs">("plans");
  const [planData, setPlanData] = useState<MaintenancePlan[]>([]);
  const [logData, setLogData] = useState<MaintenanceLog[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlan, setIsPlan] = useState(true);

  const fetchData = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
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
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchData(true);
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
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "plans" | "logs")}
      >
        {/* Header with Tabs and Buttons */}
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <TabsList className="flex h-fit border-2 gap-1">
            <TabsTrigger value="plans" className="whitespace-nowrap px-4">
              Plans
            </TabsTrigger>
            <TabsTrigger value="logs" className="whitespace-nowrap px-4">
              Logs
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddNew}
              className="rounded-xl bg-[#6950e8] text-white px-6 py-2 hover:bg-[#592be7] transition-colors"
            >
              + Add New {activeTab === "plans" ? "Plan" : "Log"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          <TabsContent value="plans">
            {isLoading && <p>Loading Plans...</p>}
            {error && <p>Error: {error.message}</p>}
            {!isLoading && !error && (
              <MaintenanceList
                data={planData}
                deleteItem={(id) => handleDelete(id)}
              />
            )}
          </TabsContent>

          <TabsContent value="logs">
            {isLoading && <p>Loading Logs...</p>}
            {error && <p>Error: {error.message}</p>}
            {!isLoading && !error && (
              <MaintenanceLogList
                data={logData}
                deleteItem={(id) => handleDelete(id)}
                maintenancePlans={maintenancePlans}
              />
            )}
          </TabsContent>
        </div>
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
