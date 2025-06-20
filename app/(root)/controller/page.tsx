"use client";
import React, { useEffect, useState } from "react";
import ControllerList from "@/components/controller/controller-list";
import ControllerCardGrid from "@/components/controller/controller-card-grid";
import ControllerMetrics from "@/components/controller/controller-metric";
import ControllerFilters, {
  FilterOptions,
} from "@/components/controller/controller-filters";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { useRouter } from "next/navigation";
import { GiRobotGrab } from "react-icons/gi";
import { deleteController, getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import Timer from "@/components/shared/timer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const router = useRouter();
  const [controller, setController] = useState<Controller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [isPending, setIsPending] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    model: "",
    application: "",
    status: "",
    connection: "",
    location: "",
    serialNumber: "",
    ipAddress: "",
  });

  const listController = async () => {
    try {
      const controllerRes = await getController();
      setController(controllerRes);
    } catch (error) {
      console.error("/api/controller: ", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    listController();
  }, []);

  const filteredControllers = React.useMemo(() => {
    return controller.filter((controllerItem) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          controllerItem.name?.toLowerCase().includes(searchTerm) ||
          controllerItem.ipAddress?.toLowerCase().includes(searchTerm) ||
          controllerItem.location?.toLowerCase().includes(searchTerm) ||
          controllerItem.serialNumber?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      if (filters.model && controllerItem.model !== filters.model) {
        return false;
      }

      if (
        filters.application &&
        controllerItem.application !== filters.application
      ) {
        return false;
      }

      if (filters.status && controllerItem.status !== filters.status) {
        return false;
      }

      if (filters.connection) {
        const isConnected = controllerItem.controllerStatus?.connection;
        if (filters.connection === "connected" && !isConnected) return false;
        if (filters.connection === "disconnected" && isConnected) return false;
      }

      if (filters.location && controllerItem.location !== filters.location) {
        return false;
      }

      if (filters.ipAddress) {
        const ipTerm = filters.ipAddress.toLowerCase();
        const matchesIP = controllerItem.ipAddress
          ?.toLowerCase()
          .includes(ipTerm);
        if (!matchesIP) return false;
      }

      if (filters.serialNumber) {
        const serialTerm = filters.serialNumber.toLowerCase();
        const matchesSerial = controllerItem.serialNumber
          ?.toLowerCase()
          .includes(serialTerm);
        if (!matchesSerial) return false;
      }

      return true;
    });
  }, [controller, filters]);

  const deleteMutation = async ({ id }: Controller) => {
    setIsPending(true);
    try {
      await deleteController({ id });
      await listController();
    } catch (error) {
      console.error("Error deleting controller:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRouteControllerCreate = () => {
    router.push("/controller/0");
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({
      search: "",
      model: "",
      application: "",
      status: "",
      connection: "",
      location: "",
      serialNumber: "",
      ipAddress: "",
    });
  };

  const ViewToggle = () => (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode("grid")}
        className={`h-8 ${
          viewMode === "grid"
            ? "bg-[#6950e8] text-white hover:bg-[#6950e8]/90"
            : "hover:bg-[#6950e8]/10 hover:text-[#6950e8]"
        }`}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode("table")}
        className={`h-8 ${
          viewMode === "table"
            ? "bg-[#6950e8] text-white hover:bg-[#6950e8]/90"
            : "hover:bg-[#6950e8]/10 hover:text-[#6950e8]"
        }`}
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <LoadingUi isLoading={loading || isPending} />
      <PageWrapper
        buttonText="Add New Controller"
        pageTitle="Controllers"
        icon={<GiRobotGrab size={24} color="#6950e8" />}
        buttonAction={handleRouteControllerCreate}
        headerActions={<ViewToggle />}
      >
        <div className="space-y-6">
          {initialLoadDone && controller.length === 0 ? (
            <Card className="mb-6">
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center p-8">
                  <GiRobotGrab size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    No Controllers Added
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Click "Add New Controller" to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <ControllerMetrics controllers={controller} />

              <ControllerFilters
                controllers={controller}
                onFilterChange={handleFilterChange}
                onReset={handleFilterReset}
              />

              {controller.length > 0 && (
                <div className="flex justify-between items-center">
                  <div className="w-1/3">
                    <Timer callback={listController} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredControllers.length} of{" "}
                      {controller.length} controllers
                    </span>
                    {filteredControllers.length !== controller.length && (
                      <Badge variant="secondary" className="text-xs">
                        Filtered
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {viewMode === "grid" ? (
                <ControllerCardGrid
                  controllers={filteredControllers}
                  deleteClick={deleteMutation}
                />
              ) : (
                <ControllerList
                  controller={filteredControllers}
                  deleteClick={deleteMutation}
                />
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default Page;
