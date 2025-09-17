"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Clock, RefreshCw, Edit, Trash2 } from "lucide-react";
import {
  getBackupPlans,
  deleteBackupPlan,
  updateBackupPlan,
} from "@/utils/service/files";
import { BackupPlan } from "@/types/files.types";
import { toast } from "sonner";

interface PlansListProps {
  controllerId: string;
  isVisible: boolean;
  refreshTrigger?: number;
}

const PlansList = ({
  controllerId,
  isVisible,
  refreshTrigger,
}: PlansListProps) => {
  const [plans, setPlans] = useState<BackupPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BackupPlan | null>(null);
  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanTime, setEditPlanTime] = useState("");
  const [editPlanFileTypes, setEditPlanFileTypes] = useState<string[]>([]);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const fileTypes = ["CMOS", ".jbi", ".dat", ".cnd", ".prm", ".sys", ".lst"];

  useEffect(() => {
    const fetchPlans = async () => {
      if (!controllerId) {
        setPlans([]);
        return;
      }

      setIsLoadingPlans(true);
      try {
        const data = await getBackupPlans(controllerId);
        setPlans(data);
      } catch (error) {
        console.error("Error fetching backup plans:", error);
        setPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    if (isVisible) {
      fetchPlans();
    }
  }, [controllerId, isVisible, refreshTrigger]);

  const handleDeletePlan = async (planId: string) => {
    if (!controllerId) return;

    try {
      await deleteBackupPlan(controllerId, planId);
      toast.success("Plan successfully deleted!");

      const data = await getBackupPlans(controllerId);
      setPlans(data);
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan. Please try again.");
    }
  };

  const handleEditPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      toast.error("Plan not found!");
      return;
    }

    setEditingPlan(plan);
    setEditPlanName(plan.name);
    setEditPlanTime(plan.time);
    setEditPlanFileTypes(plan.file_types || []);
    setIsEditModalOpen(true);
  };

  const handleFileTypeToggle = (fileType: string) => {
    setEditPlanFileTypes((prev) =>
      prev.includes(fileType)
        ? prev.filter((type) => type !== fileType)
        : [...prev, fileType]
    );
  };

  const handleSelectAllFileTypes = () => {
    setEditPlanFileTypes((prev) =>
      prev.length === fileTypes.length ? [] : [...fileTypes]
    );
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !controllerId) return;

    if (!editPlanName.trim()) {
      toast.error("Plan name is required!");
      return;
    }

    if (editPlanFileTypes.length === 0) {
      toast.error("Please select at least one file type!");
      return;
    }

    setIsUpdatingPlan(true);
    try {
      const updatedPlan = {
        name: editPlanName.trim(),
        time: editPlanTime,
        file_types: editPlanFileTypes,
      };

      await updateBackupPlan(controllerId, editingPlan.id, updatedPlan);
      toast.success("Plan updated successfully!");

      const data = await getBackupPlans(controllerId);
      setPlans(data);

      setIsEditModalOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan. Please try again.");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          CMOS Backup Plans
          {isLoadingPlans && (
            <RefreshCw className="w-4 h-4 animate-spin ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading plans...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No backup plans found</p>
            <p className="text-sm mt-1">
              Create your first plan using the "Create Plan" button
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Plan Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Created Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    File Types
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr
                    key={plan.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        {plan.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {plan.created_at
                        ? new Date(plan.created_at).toLocaleDateString("tr-TR")
                        : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        {plan.time}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {plan.file_types?.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-500">
              {plans.length} plan(s) found
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-green-600" />
              Edit Backup Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Plan Name</Label>
              <Input
                type="text"
                placeholder="Enter plan name..."
                value={editPlanName}
                onChange={(e) => setEditPlanName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Time</Label>
              <Input
                type="time"
                value={editPlanTime}
                onChange={(e) => setEditPlanTime(e.target.value)}
                className="mt-1 w-48"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                File Types
              </Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  <Checkbox
                    checked={editPlanFileTypes.length === fileTypes.length}
                    onCheckedChange={handleSelectAllFileTypes}
                  />
                  <Label className="text-sm font-medium text-blue-600 cursor-pointer">
                    Select All
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {fileTypes.map((fileType) => (
                    <div key={fileType} className="flex items-center gap-2">
                      <Checkbox
                        checked={editPlanFileTypes.includes(fileType)}
                        onCheckedChange={() => handleFileTypeToggle(fileType)}
                      />
                      <Label className="text-sm cursor-pointer">
                        {fileType === "CMOS"
                          ? "CMOS"
                          : fileType.replace(".", "")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPlan(null);
              }}
              disabled={isUpdatingPlan}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePlan}
              disabled={
                isUpdatingPlan ||
                !editPlanName.trim() ||
                editPlanFileTypes.length === 0
              }
              className="min-w-[100px]"
            >
              {isUpdatingPlan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PlansList;
