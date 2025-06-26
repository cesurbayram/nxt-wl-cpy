"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReportConfig } from "@/types/report.types";

interface ReportConfigFormProps {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
}

export function ReportConfigForm({
  config,
  onConfigChange,
}: ReportConfigFormProps) {
  const updateConfig = (updates: Partial<ReportConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label
            htmlFor="report-name"
            className="text-sm font-medium text-gray-700"
          >
            Report Name
          </Label>
          <Input
            id="report-name"
            placeholder="Enter report name"
            value={config.name || ""}
            onChange={(e) => updateConfig({ name: e.target.value })}
            className="h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="export-format"
            className="text-sm font-medium text-gray-700"
          >
            Export Format
          </Label>
          <Select
            value={config.exportFormat || "pdf"}
            onValueChange={(value: "pdf" | "excel" | "csv") =>
              updateConfig({ exportFormat: value })
            }
          >
            <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="report-description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </Label>
        <Textarea
          id="report-description"
          placeholder="Enter report description"
          value={config.description || ""}
          onChange={(e) => updateConfig({ description: e.target.value })}
          rows={3}
          className="resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
