"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import {
  getControllersForMaintenance,
  createShiftMaintenance,
  getMaintenanceHistory,
  deleteMaintenanceRecord,
  updateMaintenanceRecord,
} from "@/utils/service/shift-maintenance/shift-maintenance";
import {
  ControllerForMaintenance,
  ShiftMaintenanceHistory,
} from "@/types/shift-maintenance.types";
import { format } from "date-fns";
import LoadingUi from "@/components/shared/loading-ui";
import { useMaintenanceCalculations } from "./shift-maintenance-calculate";
import MaintenanceForm from "./shift-maintenance-form";

const ShiftMaintenance = () => {
  const [controllers, setControllers] = useState<ControllerForMaintenance[]>(
    []
  );
  const [selectedController, setSelectedController] =
    useState<ControllerForMaintenance | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<
    ShiftMaintenanceHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOverhaulExpanded, setIsOverhaulExpanded] = useState(true);
  const [editingRecord, setEditingRecord] =
    useState<ShiftMaintenanceHistory | null>(null);
  const [editFormData, setEditFormData] = useState({
    technician: "",
    notes: "",
  });

  const [formData, setFormData] = useState({
    maintenance_types: [] as string[],
    maintenance_date: format(new Date(), "yyyy-MM-dd"),
    servo_hours: "",
    technician: "",
    notes: "",
  });

  const { getMaintenanceStatus } =
    useMaintenanceCalculations(maintenanceHistory);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [controllersData, historyData] = await Promise.all([
        getControllersForMaintenance(),
        getMaintenanceHistory(),
      ]);

      setControllers(controllersData);
      setMaintenanceHistory(historyData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Veri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleControllerSelect = (controller: ControllerForMaintenance) => {
    setSelectedController(controller);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedController) {
      toast.error("Please select a controller");
      return;
    }

    if (formData.maintenance_types.length === 0) {
      toast.error("Please select at least one maintenance type");
      return;
    }

    if (!formData.technician.trim()) {
      toast.error("Please enter technician name");
      return;
    }

    try {
      setSubmitting(true);
      for (const maintenanceType of formData.maintenance_types) {
        await createShiftMaintenance({
          controller_id: selectedController.id,
          maintenance_type: maintenanceType,
          maintenance_date: formData.maintenance_date,
          servo_hours:
            parseInt(formData.servo_hours) ||
            selectedController.servo_power_time ||
            0,
          technician: formData.technician,
          notes: formData.notes,
        });
      }

      toast.success("Maintenance record created successfully");
      setFormData({
        maintenance_types: [],
        maintenance_date: format(new Date(), "yyyy-MM-dd"),
        servo_hours: "",
        technician: "",
        notes: "",
      });
      setSelectedController(null);
      fetchData();
    } catch (error) {
      console.error("Error creating maintenance:", error);
      toast.error("Error creating maintenance record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      await deleteMaintenanceRecord(id);
      toast.success("Maintenance record deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting maintenance:", error);
      toast.error("Error deleting maintenance record");
    }
  };

  const handleEditMaintenance = (history: ShiftMaintenanceHistory) => {
    setEditingRecord(history);
    setEditFormData({
      technician: history.technician,
      notes: history.notes || "",
    });
  };

  const handleUpdateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await updateMaintenanceRecord(editingRecord.id, {
        technician: editFormData.technician,
        notes: editFormData.notes,
      });
      toast.success("Maintenance record updated successfully");
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      toast.error("Error updating maintenance record");
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditFormData({
      technician: "",
      notes: "",
    });
  };

  if (loading) {
    return <LoadingUi isLoading={loading} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">
            Controller Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {controllers.map((controller) => (
              <div
                key={controller.id}
                className={`relative p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedController?.id === controller.id
                    ? "border-[#6950e8] bg-[#6950e8]/5"
                    : "border-gray-200 hover:border-[#6950e8]/50"
                }`}
                onClick={() => handleControllerSelect(controller)}
              >
                {selectedController?.id === controller.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#6950e8] rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900">
                      {controller.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          controller.servo_power_time &&
                          controller.servo_power_time > 0
                            ? "bg-green-400"
                            : "bg-gray-300"
                        }`}
                      />
                      <div className="relative w-6 h-6 opacity-50">
                        <Image
                          src="/yrc1000.png"
                          alt={`${controller.model} Controller`}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase">
                        Model
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {controller.model}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase">
                        Runtime
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {controller.servo_power_time?.toLocaleString() || 0} hrs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MaintenanceForm
        selectedController={selectedController}
        formData={formData}
        setFormData={setFormData}
        isOverhaulExpanded={isOverhaulExpanded}
        setIsOverhaulExpanded={setIsOverhaulExpanded}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setSelectedController(null)}
        getMaintenanceStatus={getMaintenanceStatus}
        maintenanceHistory={maintenanceHistory}
        editingRecord={editingRecord}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onUpdateMaintenance={handleUpdateMaintenance}
        onCancelEdit={handleCancelEdit}
        onEditMaintenance={handleEditMaintenance}
        onDeleteMaintenance={handleDeleteMaintenance}
        controllers={controllers}
      />
    </div>
  );
};

export default ShiftMaintenance;
