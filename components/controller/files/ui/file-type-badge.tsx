import React from "react";
import { cn } from "@/utils/common/cn";
import { X } from "lucide-react";

interface FileTypeBadgeProps {
  fileType: string;
  onRemove?: () => void;
}

export const FileTypeBadge: React.FC<FileTypeBadgeProps> = ({
  fileType,
  onRemove,
}) => {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case ".jbi":
        return "bg-blue-100 text-blue-800";
      case ".dat":
        return "bg-green-100 text-green-800";
      case ".cnd":
        return "bg-purple-100 text-purple-800";
      case ".prm":
        return "bg-orange-100 text-orange-800";
      case ".sys":
        return "bg-red-100 text-red-800";
      case ".lst":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        getTypeColor(fileType)
      )}
    >
      {fileType}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};
