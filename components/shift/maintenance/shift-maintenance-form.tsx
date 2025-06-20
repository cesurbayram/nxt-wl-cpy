import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import {
  ControllerForMaintenance,
  ShiftMaintenanceHistory,
} from "@/types/shift-maintenance.types";

interface MaintenanceFormProps {
  selectedController: ControllerForMaintenance | null;
  formData: {
    maintenance_types: string[];
    maintenance_date: string;
    servo_hours: string;
    technician: string;
    notes: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      maintenance_types: string[];
      maintenance_date: string;
      servo_hours: string;
      technician: string;
      notes: string;
    }>
  >;
  isOverhaulExpanded: boolean;
  setIsOverhaulExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  getMaintenanceStatus: (controller: ControllerForMaintenance) => any;
  maintenanceHistory: ShiftMaintenanceHistory[];
  editingRecord: ShiftMaintenanceHistory | null;
  editFormData: {
    technician: string;
    notes: string;
  };
  setEditFormData: React.Dispatch<
    React.SetStateAction<{
      technician: string;
      notes: string;
    }>
  >;
  onUpdateMaintenance: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onEditMaintenance: (history: ShiftMaintenanceHistory) => void;
  onDeleteMaintenance: (id: string) => void;
  controllers: ControllerForMaintenance[];
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  selectedController,
  formData,
  setFormData,
  isOverhaulExpanded,
  setIsOverhaulExpanded,
  submitting,
  onSubmit,
  onCancel,
  getMaintenanceStatus,
  maintenanceHistory,
  editingRecord,
  editFormData,
  setEditFormData,
  onUpdateMaintenance,
  onCancelEdit,
  onEditMaintenance,
  onDeleteMaintenance,
  controllers,
}) => {
  const maintenanceTypes = [
    {
      id: "General Maintenance",
      label: "General Maintenance",
      description: "Regular periodic maintenance",
    },
    {
      id: "Timing Belt",
      label: "Timing Belt",
      description: "Belt inspection and maintenance",
    },
    {
      id: "Battery",
      label: "Battery",
      description: "Battery check and replacement",
    },
    {
      id: "Flexible Cable",
      label: "Flexible Cable",
      description: "Internal cable inspection and maintenance",
    },
  ];

  const overhaulTypes = [
    {
      id: "Overhaul - Maintenance",
      label: "Maintenance",
      description: "General overhaul maintenance",
    },
    {
      id: "Overhaul - Belt",
      label: "Belt",
      description: "Belt replacement during overhaul",
    },
    {
      id: "Overhaul - Cable",
      label: "Internal Cable",
      description: "Cable replacement during overhaul",
    },
    {
      id: "Overhaul - Parts",
      label: "Parts Replacement",
      description: "Parts replacement during overhaul",
    },
  ];

  const handleMaintenanceTypeChange = (typeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      maintenance_types: checked
        ? [...prev.maintenance_types, typeId]
        : prev.maintenance_types.filter((t) => t !== typeId),
    }));
  };

  const handleOverhaulToggle = (checked: boolean) => {
    const overhaulTypeIds = overhaulTypes.map((type) => type.id);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        maintenance_types: [
          ...prev.maintenance_types,
          ...overhaulTypeIds.filter(
            (id) => !prev.maintenance_types.includes(id)
          ),
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        maintenance_types: prev.maintenance_types.filter(
          (id) => !overhaulTypeIds.includes(id)
        ),
      }));
    }
  };

  return (
    <>
      {selectedController && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">
              Maintenance Record - {selectedController.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Maintenance Types
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="General Maintenance"
                        checked={formData.maintenance_types.includes(
                          "General Maintenance"
                        )}
                        onCheckedChange={(checked) =>
                          handleMaintenanceTypeChange(
                            "General Maintenance",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="General Maintenance"
                        className="text-sm cursor-pointer flex-1"
                      >
                        General Maintenance
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="Battery"
                        checked={formData.maintenance_types.includes("Battery")}
                        onCheckedChange={(checked) =>
                          handleMaintenanceTypeChange(
                            "Battery",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="Battery"
                        className="text-sm cursor-pointer flex-1"
                      >
                        Battery
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="Timing Belt"
                        checked={formData.maintenance_types.includes(
                          "Timing Belt"
                        )}
                        onCheckedChange={(checked) =>
                          handleMaintenanceTypeChange(
                            "Timing Belt",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="Timing Belt"
                        className="text-sm cursor-pointer flex-1"
                      >
                        Timing Belt
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="Flexible Cable"
                        checked={formData.maintenance_types.includes(
                          "Flexible Cable"
                        )}
                        onCheckedChange={(checked) =>
                          handleMaintenanceTypeChange(
                            "Flexible Cable",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="Flexible Cable"
                        className="text-sm cursor-pointer flex-1"
                      >
                        Flexible Cable
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id="overhaul-main"
                          checked={overhaulTypes.every((type) =>
                            formData.maintenance_types.includes(type.id)
                          )}
                          onCheckedChange={(checked) =>
                            handleOverhaulToggle(checked as boolean)
                          }
                        />
                        <Label
                          className="text-sm cursor-pointer flex-1 flex items-center space-x-2"
                          onClick={() =>
                            setIsOverhaulExpanded(!isOverhaulExpanded)
                          }
                        >
                          {isOverhaulExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span>Overhaul</span>
                        </Label>
                      </div>

                      {isOverhaulExpanded && (
                        <div className="mt-1 space-y-1 ml-6">
                          {overhaulTypes.map((type) => (
                            <div
                              key={type.id}
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-orange-50 transition-colors"
                            >
                              <Checkbox
                                id={type.id}
                                checked={formData.maintenance_types.includes(
                                  type.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleMaintenanceTypeChange(
                                    type.id,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={type.id}
                                className="text-sm cursor-pointer text-gray-700"
                              >
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="maintenance_date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Maintenance Date
                  </Label>
                  <Input
                    id="maintenance_date"
                    type="date"
                    value={formData.maintenance_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maintenance_date: e.target.value,
                      }))
                    }
                    className="mt-1 h-9"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="servo_hours"
                    className="text-sm font-medium text-gray-700"
                  >
                    Servo Hours
                  </Label>
                  <Input
                    id="servo_hours"
                    type="number"
                    placeholder={`Current: ${
                      selectedController?.servo_power_time?.toLocaleString() ||
                      0
                    }`}
                    value={formData.servo_hours}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        servo_hours: e.target.value,
                      }))
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="technician"
                    className="text-sm font-medium text-gray-700"
                  >
                    Technician
                  </Label>
                  <Input
                    id="technician"
                    type="text"
                    placeholder="Technician name"
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        technician: e.target.value,
                      }))
                    }
                    className="mt-1 h-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Maintenance notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>

              {formData.maintenance_types.length > 0 && selectedController && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Maintenance Status</h4>
                  {formData.maintenance_types.map((maintenanceType) => {
                    const maintenanceData =
                      getMaintenanceStatus(selectedController);
                    const selectedMaintenance =
                      maintenanceData[
                        maintenanceType as keyof typeof maintenanceData
                      ];

                    if (!selectedMaintenance) return null;

                    return (
                      <div
                        key={maintenanceType}
                        className="p-3 bg-gray-50 rounded-md border border-gray-200"
                      >
                        <h5 className="font-medium text-sm mb-2">
                          {maintenanceType}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500">Target Hours:</span>
                            <p className="font-medium">
                              {selectedMaintenance.targetHours.toLocaleString()}{" "}
                              hrs
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Remaining Hours:
                            </span>
                            <p className="font-medium">
                              {selectedMaintenance.remaining.toLocaleString()}{" "}
                              hrs
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge
                              variant={
                                selectedMaintenance.status === "WARNING"
                                  ? "destructive"
                                  : "default"
                              }
                              className="ml-1 text-xs"
                            >
                              {selectedMaintenance.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="bg-[#6950e8] hover:bg-[#6950e8]/90 h-9"
                >
                  {submitting ? "Saving..." : "Create Maintenance Record"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">
            Maintenance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* PREDICTIVE Maintenance - only show when controller is selected */}
          {selectedController && (
            <div className="mb-3 p-2 bg-gray-50 rounded border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                PREDICTIVE - {selectedController.name}
              </h4>
              <div className="space-y-1">
                {(() => {
                  const maintenanceData =
                    getMaintenanceStatus(selectedController);
                  const maintenanceTypes = [
                    {
                      key: "General Maintenance",
                      label: "GENERAL MAINTENANCE",
                    },
                    { key: "Timing Belt", label: "TIMING BELT EXCHANGE" },
                    { key: "Battery", label: "BATTERY EXCHANGE" },
                    { key: "Flexible Cable", label: "FLEXIBLE CABLE EXCHANGE" },
                    { key: "Overhaul - Maintenance", label: "OVERHAUL" },
                  ];

                  return maintenanceTypes.map((type) => {
                    const maintenance = maintenanceData[type.key];
                    if (!maintenance) return null;

                    const percentage = Math.max(
                      0,
                      Math.min(
                        100,
                        ((maintenance.targetHours - maintenance.remaining) /
                          maintenance.targetHours) *
                          100
                      )
                    );

                    const getBarColor = () => {
                      if (maintenance.status === "OVERDUE") return "bg-red-500";
                      if (maintenance.status === "WARNING")
                        return "bg-yellow-500";
                      return "bg-green-500";
                    };

                    const getTextColor = () => {
                      if (maintenance.status === "OVERDUE")
                        return "text-red-600";
                      if (maintenance.status === "WARNING")
                        return "text-yellow-600";
                      return "text-green-600";
                    };

                    // Calculate next maintenance date
                    const calculateNextMaintenanceDate = () => {
                      const currentDate = new Date();

                      // Simply add 1 year to current date
                      const nextMaintenanceDate = new Date();
                      nextMaintenanceDate.setFullYear(
                        currentDate.getFullYear() + 1
                      );

                      return nextMaintenanceDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    };

                    return (
                      <div
                        key={type.key}
                        className="flex items-center justify-between"
                      >
                        <div className="text-xs font-medium text-gray-600 w-40">
                          {type.label}
                        </div>
                        <div className="w-96 bg-gray-200 rounded-full h-3 mx-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${getBarColor()}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xs font-medium ${getTextColor()}`}
                          >
                            {maintenance.remaining.toLocaleString()}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculateNextMaintenanceDate()}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* PREDICTIVE Maintenance for controllers with history */}
          {maintenanceHistory.length > 0 && (
            <div className="mb-6">
              {(() => {
                // Get unique controllers from maintenance history
                const uniqueControllers = Array.from(
                  new Set(maintenanceHistory.map((h) => h.controller_id))
                ).map((controllerId) => {
                  const historyRecord = maintenanceHistory.find(
                    (h) => h.controller_id === controllerId
                  );
                  // Get current controller data with up-to-date servo_power_time
                  const currentController = controllers.find(
                    (c) => c.id === controllerId
                  );

                  return {
                    id: controllerId,
                    name: (historyRecord as any)?.controller_name || "Unknown",
                    model:
                      (historyRecord as any)?.controller_model || "Unknown",
                    servo_power_time: currentController?.servo_power_time || 0, // Use current servo time from controllers
                  };
                });

                return uniqueControllers.map((controller) => (
                  <div
                    key={controller.id}
                    className="mb-3 p-2 bg-gray-50 rounded border"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                      PREDICTIVE - {controller.name}
                    </h4>
                    <div className="space-y-1">
                      {(() => {
                        const maintenanceData = getMaintenanceStatus(
                          controller as any
                        );
                        const maintenanceTypes = [
                          {
                            key: "General Maintenance",
                            label: "GENERAL MAINTENANCE",
                          },
                          { key: "Timing Belt", label: "TIMING BELT EXCHANGE" },
                          { key: "Battery", label: "BATTERY EXCHANGE" },
                          {
                            key: "Flexible Cable",
                            label: "FLEXIBLE CABLE EXCHANGE",
                          },
                          { key: "Overhaul - Maintenance", label: "OVERHAUL" },
                        ];

                        return maintenanceTypes.map((type) => {
                          const maintenance = maintenanceData[type.key];
                          if (!maintenance) return null;

                          const percentage = Math.max(
                            0,
                            Math.min(
                              100,
                              ((maintenance.targetHours -
                                maintenance.remaining) /
                                maintenance.targetHours) *
                                100
                            )
                          );

                          const getBarColor = () => {
                            if (maintenance.status === "OVERDUE")
                              return "bg-red-500";
                            if (maintenance.status === "WARNING")
                              return "bg-yellow-500";
                            return "bg-green-500";
                          };

                          const getTextColor = () => {
                            if (maintenance.status === "OVERDUE")
                              return "text-red-600";
                            if (maintenance.status === "WARNING")
                              return "text-yellow-600";
                            return "text-green-600";
                          };

                          // Calculate next maintenance date
                          const calculateNextMaintenanceDate = () => {
                            const currentDate = new Date();

                            // Simply add 1 year to current date
                            const nextMaintenanceDate = new Date();
                            nextMaintenanceDate.setFullYear(
                              currentDate.getFullYear() + 1
                            );

                            return nextMaintenanceDate.toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            );
                          };

                          return (
                            <div
                              key={type.key}
                              className="flex items-center justify-between"
                            >
                              <div className="text-xs font-medium text-gray-600 w-40">
                                {type.label}
                              </div>
                              <div className="w-96 bg-gray-200 rounded-full h-3 mx-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-300 ${getBarColor()}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-xs font-medium ${getTextColor()}`}
                                >
                                  {maintenance.remaining.toLocaleString()}h
                                </div>
                                <div className="text-xs text-gray-500">
                                  {calculateNextMaintenanceDate()}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {maintenanceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No maintenance records found
            </p>
          ) : (
            <div className="space-y-2">
              {maintenanceHistory.map((history) => (
                <div
                  key={history.id}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <h4 className="font-medium text-sm text-gray-900">
                          {(history as any).controller_name} -{" "}
                          {(history as any).controller_model}
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>
                            {format(
                              new Date(history.maintenance_date),
                              "MMM dd, yyyy"
                            )}
                          </span>
                          <span>•</span>
                          <span>
                            {history.servo_hours.toLocaleString()} hrs
                          </span>
                          <span>•</span>
                          <span>{history.technician}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        {history.maintenance_type}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => onEditMaintenance(history)}
                          title="Edit maintenance record"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                          onClick={() => onDeleteMaintenance(history.id)}
                          title="Delete maintenance record"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {history.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 italic">
                        "{history.notes}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Maintenance Record
            </h3>

            <form onSubmit={onUpdateMaintenance} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Controller:</span>{" "}
                  {(editingRecord as any).controller_name} -{" "}
                  {(editingRecord as any).controller_model}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span>{" "}
                  {editingRecord.maintenance_type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {format(
                    new Date(editingRecord.maintenance_date),
                    "MMM dd, yyyy"
                  )}
                </p>
              </div>

              <div>
                <Label
                  htmlFor="edit-technician"
                  className="text-sm font-medium text-gray-700"
                >
                  Technician
                </Label>
                <Input
                  id="edit-technician"
                  type="text"
                  value={editFormData.technician}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      technician: e.target.value,
                    }))
                  }
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="mt-1 resize-none"
                  rows={3}
                  placeholder="Maintenance notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6950e8] hover:bg-[#6950e8]/90 px-4"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceForm;
