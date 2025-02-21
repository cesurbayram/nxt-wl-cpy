"use client";

import React from "react";
import { MaintenanceLog, MaintenancePlan } from "@/types/maintenance.types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";
import { Button } from "../../ui/button";
import { MdDelete } from "react-icons/md";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MaintenanceLogListProps {
  data: MaintenanceLog[];
  deleteItem: (id: string) => void;
  onAddNew: () => void;
  maintenancePlans: MaintenancePlan[];
}

const MaintenanceLogList = ({
  data,
  deleteItem,
  onAddNew,
  maintenancePlans,
}: MaintenanceLogListProps) => {
  const columns: ColumnDef<MaintenanceLog>[] = [
    {
      accessorKey: "maintenance_id",
      header: () => <div className="w-full px-4">Plan Name</div>,
      size: 180,
      cell: ({ row }) => {
        const log = row.original;
        const plan = maintenancePlans.find((p) => p.id === log.maintenance_id);
        return <div className="px-4">{plan ? plan.name : "Unknown Plan"}</div>;
      },
    },
    {
      accessorKey: "maintenance_time",
      header: () => <div className="w-full px-4">Maintenance Time</div>,
      size: 150,
      cell: ({ row }) => {
        const date = row.original.maintenance_time;
        if (!date) return <div className="px-4">-</div>;
        try {
          return (
            <div className="px-4">
              {new Date(date).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
          );
        } catch {
          return <div className="px-4">Invalid Date</div>;
        }
      },
    },
    {
      accessorKey: "technician",
      header: () => <div className="w-full px-4">Technician</div>,
      size: 150,
      cell: ({ getValue }) => (
        <div className="px-4">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: "description",
      header: () => <div className="w-full px-4">Description</div>,
      size: 200,
      cell: ({ row }) => (
        <div className="px-4">{row.original.description || "-"}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center w-full">Actions</div>,
      size: 100,
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <Button
            variant="ghost"
            onClick={() => row.original.id && deleteItem(row.original.id)}
            className="hover:bg-red-50"
          >
            <MdDelete className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
        <Button
          onClick={onAddNew}
          className="rounded-xl bg-[#6950e8] text-white"
        >
          + Add New Log
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
};

export default MaintenanceLogList;
