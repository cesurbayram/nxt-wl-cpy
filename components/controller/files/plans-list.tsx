"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBackupPlans,
  deleteBackupPlan,
  updateBackupPlan,
} from "@/utils/service/files";
import { BackupPlan } from "@/types/files.types";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Edit,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingUi from "@/components/shared/loading-ui";
import TimePicker from "./ui/time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlansListProps {
  controllerId: string;
}

export default function PlansList({ controllerId }: PlansListProps) {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BackupPlan>>({});
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  // Planları getir
  const { data: plans, isLoading } = useQuery({
    queryKey: ["backup-plans", controllerId],
    queryFn: () => getBackupPlans(controllerId),
  });

  // Pagination hesaplamaları
  const totalPages = plans ? Math.ceil(plans.length / pageSize) : 0;
  const paginatedPlans = plans?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Plan silme mutasyonu
  const { mutate: deletePlan } = useMutation({
    mutationFn: (planId: string) => deleteBackupPlan(controllerId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backup-plans", controllerId],
      });
    },
  });

  // Plan güncelleme mutasyonu
  const { mutate: updatePlan, isPending: isUpdating } = useMutation({
    mutationFn: ({
      planId,
      updates,
    }: {
      planId: string;
      updates: Partial<BackupPlan>;
    }) => updateBackupPlan(controllerId, planId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backup-plans", controllerId],
      });
      setEditingPlan(null);
      setEditForm({});
    },
  });

  const startEditing = (plan: BackupPlan) => {
    setEditingPlan(plan.id);
    setEditForm(plan);
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setEditForm({});
  };

  const handleUpdate = (planId: string) => {
    updatePlan({ planId, updates: editForm });
  };

  if (isLoading) return <LoadingUi isLoading={isLoading} />;

  const fileTypes = [".jbi", ".dat", ".cnd", ".prm", ".sys", ".lst"];
  const days = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 7, name: "Sunday" },
  ];

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <div className="relative h-[400px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr>
                <th className="p-2 text-left text-sm font-medium">Plan Name</th>
                <th className="p-2 text-left text-sm font-medium">Date</th>
                <th className="p-2 text-left text-sm font-medium">Time</th>
                <th className="p-2 text-left text-sm font-medium">
                  File Types
                </th>
                <th className="p-2 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlans?.map((plan: BackupPlan) => (
                <tr key={plan.id} className="border-b">
                  {editingPlan === plan.id ? (
                    // Düzenleme modu
                    <>
                      <td className="p-4">
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
                      </td>
                      <td className="p-4">
                        {new Date(
                          editForm.created_at || ""
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <TimePicker
                          value={editForm.time || "00:00"}
                          onChange={(time) =>
                            setEditForm((prev) => ({ ...prev, time }))
                          }
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {fileTypes.map((type) => (
                            <label
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={(editForm.file_types || []).includes(
                                  type
                                )}
                                onCheckedChange={(checked) => {
                                  const newTypes = checked
                                    ? [...(editForm.file_types || []), type]
                                    : (editForm.file_types || []).filter(
                                        (t) => t !== type
                                      );
                                  setEditForm((prev) => ({
                                    ...prev,
                                    file_types: newTypes,
                                  }));
                                }}
                              />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdate(plan.id)}
                            disabled={isUpdating}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Görüntüleme modu
                    <>
                      <td className="p-4">{plan.name}</td>
                      <td className="p-4">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">{plan.time}</td>
                      <td className="p-4">{plan.file_types.join(", ")}</td>
                      <td className="p-4">
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
                                window.confirm(
                                  "Are you sure you want to delete this plan?"
                                )
                              ) {
                                deletePlan(plan.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {plans?.length || 0} plan(s) total
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows Per Page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
