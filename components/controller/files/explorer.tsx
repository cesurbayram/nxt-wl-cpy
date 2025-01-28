import React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { BackupFile } from "@/types/files.types";

interface ExplorerProps {
  files: BackupFile[];
  isLoading?: boolean;
}

export const Explorer: React.FC<ExplorerProps> = ({ files, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button>
            <span className="mr-2">+</span>
            <span className="text-sm font-medium">File</span>
          </Button>
          <Select defaultValue="jbi">
            <option value="jbi">Job File (.jbi)</option>
            <option value="dat">Data File (.dat)</option>
            <option value="cnd">Condition File (.cnd)</option>
          </Select>
        </div>
        <Button variant="outline">
          <span className="text-sm font-medium">Clear filters</span>
        </Button>
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-sm font-medium">File</th>
              <th className="p-4 text-left text-sm font-medium">Tools</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b">
                <td className="p-4">{file.file_name}</td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      Refresh
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
