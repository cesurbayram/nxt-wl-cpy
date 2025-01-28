import React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./ui/status-badge";
import { BackupFile } from "@/types/files.types";
import { formatFileSize, formatDate } from "@/utils/common/format";

interface FileListProps {
  files: BackupFile[];
  onDownload: (file: BackupFile) => void;
  onDelete: (file: BackupFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="border rounded-md">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left text-sm font-medium">File Name</th>
            <th className="p-4 text-left text-sm font-medium">Type</th>
            <th className="p-4 text-left text-sm font-medium">Size</th>
            <th className="p-4 text-left text-sm font-medium">Status</th>
            <th className="p-4 text-left text-sm font-medium">Backup Date</th>
            <th className="p-4 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b">
              <td className="p-4 text-sm font-medium">{file.file_name}</td>
              <td className="p-4 text-sm font-medium">{file.file_type}</td>
              <td className="p-4 text-sm font-medium">
                {formatFileSize(file.size)}
              </td>
              <td className="p-4">
                <StatusBadge status={file.status} />
              </td>
              <td className="p-4 text-sm font-medium">
                {formatDate(new Date(file.backup_date))}
              </td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(file)}
                    className="text-sm font-medium"
                  >
                    Download
                  </Button>
                  {file.file_type === ".jbi" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(file)}
                      className="text-red-600 text-sm font-medium"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
