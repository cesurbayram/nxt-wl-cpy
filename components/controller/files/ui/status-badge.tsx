import React from "react";
import { BackupStatus } from "@/types/files.types";
import { cn } from "@/utils/common/cn";

interface StatusBadgeProps {
  status: BackupStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        getStatusColor(status)
      )}
    >
      {status}
    </span>
  );
};
