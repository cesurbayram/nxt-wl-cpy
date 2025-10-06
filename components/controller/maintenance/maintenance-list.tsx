"use client";

import React, { useState, useRef } from "react";
import { MaintenancePlan } from "@/types/maintenance.types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../shared/data-table";
import { Button } from "../../ui/button";
import { MdDelete, MdOutlineSettings } from "react-icons/md";
import { getUtilizationData } from "@/utils/service/utilization";
import { Card, CardContent } from "@/components/ui/card";

interface MaintenanceListProps {
  data: MaintenancePlan[];
  deleteItem: (id: string) => void;
}

const MaintenanceList = ({
  data,
  deleteItem,
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

    const nextMaintenance = parseInt(nextMaintenanceTime || "0");

    const remainingHours = nextMaintenance - currentHours;

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
        icon: <MdOutlineSettings className="text-yellow-600 text-2xl" />,
        text: `${remainingHours}h left`,
        color: "text-yellow-600",
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
      header: () => <div className="w-full px-4">Status</div>,
      size: 120,
      cell: ({ row }) => {
        const plan = row.original;
        const status = getMaintenanceStatus(
          plan.controllerId,
          plan.servoPowerTime,
          plan.nextMaintenanceTime
        );

        return (
          <div className="flex flex-col items-center justify-center w-full">
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
      header: () => <div className="w-full px-4">Name</div>,
      size: 180,
      cell: ({ getValue }) => (
        <div className="px-4">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: "companyName",
      header: () => <div className="w-full px-4">Authority</div>,
      size: 180,
      cell: ({ getValue }) => (
        <div className="px-4">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: "maintenanceDate",
      header: () => <div className="w-full px-4">Date</div>,
      size: 150,
      cell: ({ getValue }) => (
        <div className="px-4">
          {new Date(getValue() as string).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
      ),
    },
    {
      accessorKey: "servoPowerTime",
      header: () => <div className="w-full px-4">Current Hours</div>,
      size: 150,
      cell: ({ row }) => {
        const currentHours =
          servoPowerTimes[row.original.controllerId] ||
          parseInt(row.original.servoPowerTime);
        return <div className="px-4">{`${currentHours} hours`}</div>;
      },
    },
    {
      accessorKey: "nextMaintenanceTime",
      header: () => <div className="w-full px-4">Next Maintenance</div>,
      size: 150,
      cell: ({ getValue }) => (
        <div className="px-4">{`${getValue()} hours`}</div>
      ),
    },
    // {
    //   accessorKey: "createdAt",
    //   header: "Created Date",
    //   size: 150,
    //   cell: ({ getValue }) => (
    //     <div className="flex items-center px-4">
    //       {getValue()
    //         ? new Date(getValue() as string).toLocaleDateString("tr-TR", {
    //             year: "numeric",
    //             month: "2-digit",
    //             day: "2-digit",
    //           })
    //         : "-"}
    //     </div>
    //   ),
    // },
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
      <CardContent className="pt-6">
        {isLoading ? (
          <p className="p-4">Loading...</p>
        ) : error ? (
          <p className="p-4">Error: {error.message}</p>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceList;
