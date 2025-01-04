"use client";

import React from "react";
import { MaintenancePlan, MaintenanceLog } from "@/types/maintenance.types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";
import { Button } from "../../ui/button";
import { MdDelete } from "react-icons/md";
import {
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsXCircleFill,
} from "react-icons/bs";

interface MaintenanceListProps {
  data: MaintenancePlan[] | MaintenanceLog[];
  activeTab: "plans" | "logs";
  deleteItem: (id: string) => void;
  onAddNew: () => void;
}

const MaintenanceList = ({
  data,
  activeTab,
  deleteItem,
  onAddNew,
}: MaintenanceListProps) => {
  const planColumns: ColumnDef<MaintenancePlan>[] = [
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const plan = row.original;

        if (!plan?.operationTime || !plan?.totalElapsedTime) {
          return (
            <div className="flex items-center gap-2">
              <BsCheckCircleFill className="text-gray-400 text-xl" />
              <span className="text-xs text-gray-500">No data</span>
            </div>
          );
        }

        const operationHours = parseInt(plan.operationTime.toString());
        const totalElapsed = parseInt(plan.totalElapsedTime.toString());

        const percentage =
          operationHours > 0 ? (totalElapsed / operationHours) * 100 : 0;

        if (percentage >= 100) {
          return (
            <div className="flex items-center gap-2">
              <BsXCircleFill className="text-red-500 text-xl" />
              <span className="text-xs text-red-500">
                Maintenance Required ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        } else if (percentage >= 90) {
          return (
            <div className="flex items-center gap-2">
              <BsExclamationCircleFill className="text-orange-500 text-xl" />
              <span className="text-xs text-orange-500">
                Maintenance Soon ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <BsCheckCircleFill className="text-green-500 text-xl" />
            <span className="text-xs text-green-500">
              OK ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Plan Name",
    },
    {
      accessorKey: "operation_time",
      header: "Operation Time",
    },
    {
      accessorKey: "max_operation_time",
      header: "Max Operation Time",
    },
    {
      accessorKey: "overall_time",
      header: "Overall Time",
    },
    {
      accessorKey: "last_maintenance",
      header: "Last Maintenance",
      cell: ({ getValue }) =>
        getValue() ? new Date(getValue() as string).toLocaleString() : "N/A",
    },
    {
      accessorKey: "total_elapsed_time",
      header: "Total Elapsed Time",
    },
    {
      accessorKey: "next_maintenance",
      header: "Next Maintenance",
      cell: ({ getValue }) =>
        getValue() ? new Date(getValue() as string).toLocaleString() : "N/A",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (row.original.id) {
                deleteItem(row.original.id);
              }
            }}
          >
            <MdDelete className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const logColumns: ColumnDef<MaintenanceLog>[] = [
    {
      accessorKey: "plan_name",
      header: "Plan Name",
    },
    {
      accessorKey: "maintenance_time",
      header: "Maintenance Time",
      cell: ({ getValue }) => {
        const value = getValue();
        try {
          return value ? new Date(value as string).toLocaleString() : "N/A";
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
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (row.original.id) {
                deleteItem(row.original.id);
              }
            }}
          >
            <MdDelete className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={onAddNew}
          className="rounded-xl bg-[#6950e8] text-white"
        >
          + Add New {activeTab === "plans" ? "Plan" : "Log"}
        </Button>
      </div>
      {activeTab === "plans" && (
        <DataTable columns={planColumns} data={data as MaintenancePlan[]} />
      )}
      {activeTab === "logs" && (
        <DataTable columns={logColumns} data={data as MaintenanceLog[]} />
      )}
    </div>
  );
};

export default MaintenanceList;
