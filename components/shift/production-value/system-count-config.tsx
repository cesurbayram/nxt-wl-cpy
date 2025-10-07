"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SystemCountConfigProps {
  jobId: string;
  jobName: string;
  generalNo: string;
  onGeneralNoChange: (value: string) => void;
}

export default function SystemCountConfig({
  jobId,
  jobName,
  generalNo,
  onGeneralNoChange
}: SystemCountConfigProps) {
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-medium mb-3">System Count Settings - {jobName}</h4>
      <div className="space-y-2">
        <Label htmlFor={`general-no-${jobId}`} className="text-sm">
          General Double No
        </Label>
          <Input
            id={`general-no-${jobId}`}
            type="text"
            placeholder="Örn: 90"
            value={generalNo}
            onChange={(e) => onGeneralNoChange(e.target.value)}
            className="h-9"
          />
        <p className="text-xs text-gray-500">
          Robot'taki GeneralDouble variable numarasını girin
        </p>
      </div>
    </div>
  );
}
