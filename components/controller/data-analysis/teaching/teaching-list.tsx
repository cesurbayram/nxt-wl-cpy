import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileType,
  FSUSubType,
  FSU_SUBTYPE_CONFIGS,
} from "@/types/teaching.types";

interface TeachingListProps {
  selectedFileType: FileType;
  onFileTypeChange: (fileType: FileType) => void;
  selectedFSUSubType: FSUSubType | null;
  onFSUSubTypeChange: (subType: FSUSubType | null) => void;
}

const TeachingList: React.FC<TeachingListProps> = ({
  selectedFileType,
  onFileTypeChange,
  selectedFSUSubType,
  onFSUSubTypeChange,
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">FSU Categories</h3>
      <TabsList className="flex flex-col h-fit border-2 gap-1">
        {FSU_SUBTYPE_CONFIGS.map((config) => (
          <TabsTrigger
            key={config.type}
            value={config.type}
            className={`w-full text-sm font-medium ${
              selectedFSUSubType === config.type
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            onClick={() => onFSUSubTypeChange(config.type)}
          >
            {config.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default TeachingList;
