"use client";

import React from "react";
import { MaintenanceLog, MaintenancePlan } from "@/types/maintenance.types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";
import { Button } from "../../ui/button";
import { MdDelete } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      accessorKey: "maintenance_id", // maintenance_id olarak değiştirdik
      header: "Plan Name",
      cell: ({ row }) => {
        const log = row.original;
        // maintenance_id kullanarak plan'ı bul
        const plan = maintenancePlans.find((p) => p.id === log.maintenance_id);
        return plan ? plan.name : "Unknown Plan";
      },
    },
    {
      accessorKey: "maintenance_time", // maintenance_time olarak değiştirdik
      header: "Maintenance Time",
      cell: ({ row }) => {
        const date = row.original.maintenance_time;
        if (!date) return "-";
        try {
          return new Date(date).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        } catch {
          return "Invalid Date";
        }
      },
    },
    {
      accessorKey: "technician",
      header: "Technician",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => row.original.id && deleteItem(row.original.id)}
          className="hover:bg-red-50"
        >
          <MdDelete className="text-red-500" />
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Maintenance Logs</CardTitle>
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
