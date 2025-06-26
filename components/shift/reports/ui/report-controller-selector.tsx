"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronDown } from "lucide-react";

interface Controller {
  id: string;
  name: string;
  model: string;
  location: string;
  status: string;
}

interface ReportControllerSelectorProps {
  selectedControllerIds: string[];
  onControllerSelectionChange: (controllerIds: string[]) => void;
}

export default function ReportControllerSelector({
  selectedControllerIds,
  onControllerSelectionChange,
}: ReportControllerSelectorProps) {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchControllers();
  }, []);

  useEffect(() => {
    if (controllers.length > 0) {
      setSelectAll(selectedControllerIds.length === controllers.length);
    }
  }, [selectedControllerIds, controllers]);

  const fetchControllers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/controller");
      if (!response.ok) {
        throw new Error("Failed to fetch controllers");
      }
      const data = await response.json();
      setControllers(data);
    } catch (error) {
      console.error("Error fetching controllers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleControllerToggle = (controllerId: string) => {
    const newSelection = selectedControllerIds.includes(controllerId)
      ? selectedControllerIds.filter((id) => id !== controllerId)
      : [...selectedControllerIds, controllerId];

    onControllerSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onControllerSelectionChange([]);
    } else {
      onControllerSelectionChange(controllers.map((c) => c.id));
    }
  };

  const getSelectionText = () => {
    if (selectedControllerIds.length === 0) {
      return "All controllers";
    } else if (selectedControllerIds.length === controllers.length) {
      return "All controllers selected";
    } else if (selectedControllerIds.length === 1) {
      const controller = controllers.find(
        (c) => c.id === selectedControllerIds[0]
      );
      return controller?.name || "1 controller selected";
    } else {
      return `${selectedControllerIds.length} controllers selected`;
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Controller Selection</Label>

      <Card>
        <CardContent className="p-4">
          <Button
            variant="outline"
            className="w-full justify-between h-10"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isLoading}
          >
            <span>
              {isLoading ? "Loading controller list..." : getSelectionText()}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>

          {isExpanded && !isLoading && (
            <div className="mt-3 space-y-3">
              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All
                </Label>
              </div>

              <Separator />

              <ScrollArea className="h-48">
                <div className="space-y-2 pr-3">
                  {controllers.map((controller) => (
                    <div
                      key={controller.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={controller.id}
                        checked={selectedControllerIds.includes(controller.id)}
                        onCheckedChange={() =>
                          handleControllerToggle(controller.id)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={controller.id}
                          className="text-sm font-medium cursor-pointer block"
                        >
                          {controller.name}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {controller.model} • {controller.location}
                        </div>
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          controller.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {controllers.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Controller not found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
