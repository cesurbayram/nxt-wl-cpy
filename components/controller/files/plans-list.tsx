"use client";

import { useState, useEffect } from "react";
import {
  getBackupPlans,
  deleteBackupPlan,
  updateBackupPlan,
} from "@/utils/service/files";
import { BackupPlan } from "@/types/files.types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, X, Check } from "lucide-react";
import LoadingUi from "@/components/shared/loading-ui";
import TimePicker from "./ui/time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface PlansListProps {
  controllerId: string;
}

export default function PlansList({ controllerId }: PlansListProps) {
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BackupPlan>>({});
  const [plans, setPlans] = useState<BackupPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const data = await getBackupPlans(controllerId);
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
      setIsLoading(false);
    };

    fetchPlans();
  }, [controllerId]);

  const deletePlan = async (planId: string) => {
    try {
      await deleteBackupPlan(controllerId, planId);
      const data = await getBackupPlans(controllerId);
      setPlans(data);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleUpdate = async (planId: string) => {
    setIsUpdating(true);
    try {
      await updateBackupPlan(controllerId, planId, editForm);
      const data = await getBackupPlans(controllerId);
      setPlans(data);
      setEditingPlan(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating plan:", error);
    }
    setIsUpdating(false);
  };

  const startEditing = (plan: BackupPlan) => {
    setEditingPlan(plan.id);
    setEditForm(plan);
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setEditForm({});
  };

  const fileTypes = ["CMOS", ".jbi", ".dat", ".cnd", ".prm", ".sys", ".lst"];

  const columns: ColumnDef<BackupPlan>[] = [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }) => {
        const plan = row.original;
        return editingPlan === plan.id ? (
          <input
            type="text"
            value={editForm.name || ""}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="border p-1 rounded"
          />
        ) : (
          plan.name
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created Date",
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleDateString();
      },
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => {
        const plan = row.original;
        return editingPlan === plan.id ? (
          <TimePicker
            value={editForm.time || "00:00"}
            onChange={(time) => setEditForm((prev) => ({ ...prev, time }))}
          />
        ) : (
          plan.time
        );
      },
    },
    {
      accessorKey: "file_types",
      header: "File Types",
      cell: ({ row }) => {
        const plan = row.original;
        return editingPlan === plan.id ? (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer">
              <Checkbox
                checked={editForm.file_types?.length === fileTypes.length}
                onCheckedChange={(checked) => {
                  setEditForm((prev) => ({
                    ...prev,
                    file_types: checked ? [...fileTypes] : [],
                  }));
                }}
              />
              <span className="text-sm">All</span>
            </div>

            {fileTypes.map((type) => (
              <div
                key={type}
                className="flex items-center space-x-1 px-2 py-1 bg-[#6950e8] bg-opacity-10 rounded cursor-pointer"
              >
                <Checkbox
                  checked={(editForm.file_types || []).includes(type)}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...(editForm.file_types || []), type]
                      : (editForm.file_types || []).filter((t) => t !== type);
                    setEditForm((prev) => ({
                      ...prev,
                      file_types: newTypes,
                    }));
                  }}
                />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </div>
        ) : (
          plan.file_types.join(", ")
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const plan = row.original;
        return editingPlan === plan.id ? (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdate(plan.id)}
              disabled={isUpdating}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEditing}>
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startEditing(plan)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this plan?")
                ) {
                  deletePlan(plan.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingUi isLoading={isLoading} />;

  return (
    <div>
      <DataTable columns={columns} data={plans || []} />
    </div>
  );
}
