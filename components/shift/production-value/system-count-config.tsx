"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { JobSystemCountService } from "@/utils/service/job-system-count/job-system-count";
import { JobSystemCountConfig, GeneralVariableType } from "@/types/job-system-count.types";

interface SystemCountConfigProps {
  jobId: string;
  jobName: string;
  controllerId: string;
  onConfigChange?: () => void;
}

export default function SystemCountConfig({
  jobId,
  jobName,
  controllerId,
  onConfigChange
}: SystemCountConfigProps) {
  const [generalNo, setGeneralNo] = useState("100");
  const [variableType, setVariableType] = useState<GeneralVariableType>("double");
  const [isReading, setIsReading] = useState(false);
  const [config, setConfig] = useState<JobSystemCountConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // Config'i yükle
  useEffect(() => {
    loadConfig();
  }, [jobId, controllerId]);

  const loadConfig = async () => {
    try {
      const existingConfig = await JobSystemCountService.getConfig(jobId, controllerId);
      if (existingConfig) {
        setConfig(existingConfig);
        setGeneralNo(existingConfig.generalNo);
        setVariableType(existingConfig.variableType);
        setIsReading(existingConfig.isActive);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const handleStartReading = async () => {
    if (!generalNo.trim()) {
      toast.error("Please enter a General No");
      return;
    }

    setLoading(true);
    try {
      const success = await JobSystemCountService.startReading(
        jobId,
        controllerId,
        generalNo.trim(),
        variableType
      );

      if (success) {
        setIsReading(true);
        await loadConfig(); // Reload config
        toast.success(`System count reading started for ${jobName}`);
        onConfigChange?.();
      } else {
        toast.error("Failed to start system count reading");
      }
    } catch (error: any) {
      console.error("Error starting reading:", error);
      toast.error(error.message || "Failed to start system count reading");
    } finally {
      setLoading(false);
    }
  };

  const handleStopReading = async () => {
    setLoading(true);
    try {
      const success = await JobSystemCountService.stopReading(jobId, controllerId);

      if (success) {
        setIsReading(false);
        await loadConfig(); // Reload config
        toast.success(`System count reading stopped for ${jobName}`);
        onConfigChange?.();
      } else {
        toast.error("Failed to stop system count reading");
      }
    } catch (error: any) {
      console.error("Error stopping reading:", error);
      toast.error(error.message || "Failed to stop system count reading");
    } finally {
      setLoading(false);
    }
  };

  const variableTypeOptions = [
    { value: "double", label: "GeneralDouble" },
    { value: "int", label: "GeneralInt" },
    { value: "byte", label: "GeneralByte" },
    { value: "real", label: "GeneralReal" },
    { value: "string", label: "GeneralString" }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          System Count Settings - {jobName}
          {isReading && <Badge variant="default" className="text-xs">Reading</Badge>}
          {config && !isReading && <Badge variant="secondary" className="text-xs">Configured</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`general-no-${jobId}`} className="text-sm">
              General No
            </Label>
            <Input
              id={`general-no-${jobId}`}
              type="text"
              placeholder="100"
              value={generalNo}
              onChange={(e) => setGeneralNo(e.target.value)}
              disabled={isReading || loading}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Variable Type</Label>
            <Select
              value={variableType}
              onValueChange={(value) => setVariableType(value as GeneralVariableType)}
              disabled={isReading || loading}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variableTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Action</Label>
            <div className="flex gap-2">
              {!isReading ? (
                <Button
                  onClick={handleStartReading}
                  disabled={loading}
                  size="sm"
                  className="h-9 flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Reading
                </Button>
              ) : (
                <Button
                  onClick={handleStopReading}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  className="h-9 flex-1"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop Reading
                </Button>
              )}
            </div>
          </div>
        </div>

        {config && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Current Config:</strong> General{config.variableType.charAt(0).toUpperCase() + config.variableType.slice(1)} {config.generalNo}
            {config.isActive ? " (Active)" : " (Inactive)"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
