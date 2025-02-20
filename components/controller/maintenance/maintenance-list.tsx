"use client";

import React, { useState, useRef } from "react";
import { MaintenancePlan } from "@/types/maintenance.types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";
import { Button } from "../../ui/button";
import { MdDelete, MdOutlineSettings } from "react-icons/md";
import { getUtilizationData } from "@/utils/service/utilization";
import Timer from "@/components/shared/timer";

interface MaintenanceListProps {
  data: MaintenancePlan[];
  deleteItem: (id: string) => void;
  onAddNew: () => void;
}

const MaintenanceList = ({
  data,
  deleteItem,
  onAddNew,
}: MaintenanceListProps) => {
  const [servoPowerTimes, setServoPowerTimes] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUtilizationData = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }

      // Düzeltilmiş kod
      const uniqueControllerIds = Array.from(
        new Set(data.map((plan) => plan.controllerId))
      );

      const newServoPowerTimes: { [key: string]: number } = {};

      for (const controllerId of uniqueControllerIds) {
        const utilizationData = await getUtilizationData(
          controllerId,
          "7d",
          "1d"
        );
        if (utilizationData && utilizationData.length > 0) {
          newServoPowerTimes[controllerId] =
            utilizationData[0].servo_power_time;
        }
      }

      setServoPowerTimes(newServoPowerTimes);
      setError(null);
    } catch (error) {
      console.error("Error fetching utilization data:", error);
      setError(error as Error);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  const getMaintenanceStatus = (
    controllerId: string,
    servoPowerTime: string,
    nextMaintenanceTime: string | undefined
  ) => {
    const currentHours =
      servoPowerTimes[controllerId] || parseInt(servoPowerTime);
    const targetHours = parseInt(nextMaintenanceTime || "0") - 12000;
    const remainingHours = 12000 - (currentHours - targetHours);

    if (!currentHours || !nextMaintenanceTime) {
      return {
        icon: <MdOutlineSettings className="text-gray-500 text-2xl" />,
        text: "No Data",
        color: "text-gray-500",
      };
    }

    if (remainingHours <= 0) {
      return {
        icon: <MdOutlineSettings className="text-red-600 text-2xl" />,
        text: `${Math.abs(remainingHours)}h exceeded`,
        color: "text-red-600",
      };
    } else if (remainingHours <= 2000) {
      return {
        icon: <MdOutlineSettings className="text-orange-600 text-2xl" />,
        text: `${remainingHours}h left`,
        color: "text-orange-600",
      };
    }

    return {
      icon: <MdOutlineSettings className="text-green-600 text-2xl" />,
      text: `${remainingHours}h left`,
      color: "text-green-600",
    };
  };

  const columns: ColumnDef<MaintenancePlan>[] = [
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const plan = row.original;
        const status = getMaintenanceStatus(
          plan.controllerId,
          plan.servoPowerTime,
          plan.nextMaintenanceTime
        );

        return (
          <div className="flex flex-col items-center justify-center w-28 -ml-2">
            {status.icon}
            <span
              className={`text-xs ${status.color} mt-0.5 text-center font-medium`}
            >
              {status.text}
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
      accessorKey: "companyName",
      header: "Company/Authority",
    },
    {
      accessorKey: "maintenanceDate",
      header: "Maintenance Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "servoPowerTime",
      header: "Current Hours",
      cell: ({ row }) => {
        const currentHours =
          servoPowerTimes[row.original.controllerId] ||
          parseInt(row.original.servoPowerTime);
        return `${currentHours} hours`;
      },
    },
    {
      accessorKey: "nextMaintenanceTime",
      header: "Next Maintenance At",
      cell: ({ getValue }) => `${getValue()} hours`,
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ getValue }) =>
        getValue() ? new Date(getValue() as string).toLocaleDateString() : "-",
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-full px-6 mb-2">
          <Timer callback={() => fetchUtilizationData(false)} />
        </div>
        <Button
          onClick={onAddNew}
          className="rounded-xl bg-[#6950e8] text-white"
        >
          + Add New Plan
        </Button>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
};

export default MaintenanceList;
