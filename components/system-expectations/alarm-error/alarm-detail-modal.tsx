"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SystemAlarmHistoryItem,
  SystemAlarmDetail,
} from "@/types/alarm-error.types";
import {
  getSystemAlarmDetail,
  createSystemWorkOrder,
} from "@/utils/service/system-expectations/alarm-error";
import { ExternalLink, FileText, Wrench, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SystemAlarmDetailModalProps {
  alarm: SystemAlarmHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  controllerId: string;
}

const SystemAlarmDetailModal = ({
  alarm,
  isOpen,
  onClose,
  controllerId,
}: SystemAlarmDetailModalProps) => {
  const [alarmDetail, setAlarmDetail] = useState<SystemAlarmDetail | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);

  useEffect(() => {
    if (isOpen && alarm) {
      fetchAlarmDetail();
    }
  }, [isOpen, alarm]);

  const fetchAlarmDetail = async () => {
    if (!alarm) return;

    setLoading(true);
    try {
      const detail = await getSystemAlarmDetail(controllerId, alarm.code);
      setAlarmDetail(detail);
    } catch (error) {
      console.error("Failed to fetch alarm detail:", error);
      toast.error("Failed to load alarm details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!alarm || !alarmDetail) return;

    setCreatingWorkOrder(true);
    try {
      await createSystemWorkOrder(
        controllerId,
        alarm.code,
        `${alarm.name} - ${alarmDetail.description}`
      );
      toast.success("System work order created successfully");
    } catch (error) {
      console.error("Failed to create system work order:", error);
      toast.error("Failed to create system work order");
    } finally {
      setCreatingWorkOrder(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!alarm) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alarm Details - Code: {alarm.code}
          </DialogTitle>
          <DialogDescription>
            Detailed information and solution for alarm code {alarm.code}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading alarm details...</p>
              </div>
            </div>
          ) : alarmDetail ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">
                    Alarm Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Code:</span>{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {alarm.code}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Name:</span>{" "}
                      {alarm.name}
                    </div>
                    <div>
                      <span className="text-sm font-medium">Date:</span>{" "}
                      {new Date(alarm.originDate).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">
                    Classification
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Type:</span>{" "}
                      <Badge variant="outline">{alarm.type}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Description
                </h3>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {alarmDetail.description}
                </p>
              </div>

              {/* Causes */}
              {alarmDetail.causes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">
                    Possible Causes
                  </h3>
                  <ul className="space-y-1">
                    {alarmDetail.causes.map((cause, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-red-500 mt-1">•</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Solution */}
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Solution
                </h3>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm">{alarmDetail.solution}</p>
                </div>
              </div>

              {/* Preventive Actions */}
              {alarmDetail.preventiveActions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">
                    Preventive Actions
                  </h3>
                  <ul className="space-y-1">
                    {alarmDetail.preventiveActions.map((action, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No detailed information available for this alarm code.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                The alarm details might not be configured in the CSV database.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateWorkOrder}
              disabled={creatingWorkOrder}
              className="flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              {creatingWorkOrder ? "Creating..." : "Create Work Order"}
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SystemAlarmDetailModal;
