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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SystemAlarmHistoryItem,
  SystemAlarmDetail,
} from "@/types/alarm-error.types";
import {
  getSystemAlarmDetail,
  createSystemWorkOrder,
} from "@/utils/service/system-expectations/alarm-error";
import {
  ExternalLink,
  FileText,
  Wrench,
  AlertTriangle,
  Mail,
  Send,
} from "lucide-react";
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
  const [showMailForm, setShowMailForm] = useState(false);
  const [createdWorkOrder, setCreatedWorkOrder] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  useEffect(() => {
    if (isOpen && alarm) {
      fetchAlarmDetail();
      fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUsers(
          userData.filter((user: any) => user.email && user.email.trim() !== "")
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!alarm || !alarmDetail) return;

    setCreatingWorkOrder(true);
    try {
      const result = await createSystemWorkOrder(
        controllerId,
        alarm.code,
        `${alarm.name} - ${alarmDetail.description}`
      );
      setCreatedWorkOrder(result.workOrder);
      toast.success("System work order created successfully");
      setShowMailForm(true);
    } catch (error) {
      console.error("Failed to create system work order:", error);
      toast.error("Failed to create system work order");
    } finally {
      setCreatingWorkOrder(false);
    }
  };

  const handleSendMail = async () => {
    if (!createdWorkOrder || !recipientEmail) {
      toast.error("Please select a recipient");
      return;
    }

    setSendingMail(true);
    try {
      const response = await fetch(
        "/api/system-expectations/alarm-error-logs/work-order/send-mail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workOrderId: createdWorkOrder.id,
            recipientEmail: recipientEmail,
          }),
        }
      );

      if (response.ok) {
        toast.success("Work order notification sent successfully");
        setShowMailForm(false);
        setRecipientEmail("");
        setSelectedUser(null);
      } else {
        toast.error("Failed to send work order notification");
      }
    } catch (error) {
      console.error("Failed to send work order mail:", error);
      toast.error("Failed to send work order notification");
    } finally {
      setSendingMail(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alarm Details - Code: {alarm.code}
          </DialogTitle>
          <DialogDescription>
            Detailed information and solution for alarm code {alarm.code}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
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

              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Description
                </h3>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {alarmDetail.description}
                </p>
              </div>

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

              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Solution
                </h3>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm">{alarmDetail.solution}</p>
                </div>
              </div>

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

        {showMailForm && createdWorkOrder && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2 flex-shrink-0">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              Send Work Order Notification
            </h3>

            <div className="mb-3">
              <Label
                htmlFor="recipient-email"
                className="text-xs font-medium text-gray-700"
              >
                📧 Recipient Email Address{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1 mt-1">
                <Input
                  id="recipient-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter email address (e.g., user@toyota-boshoku.com)"
                  className="h-9 text-sm flex-1 border-blue-300 focus:border-blue-500"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecipientEmail("");
                    setSelectedUser(null);
                  }}
                  className="h-9 px-3 text-xs"
                  type="button"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <Label
                htmlFor="user-select"
                className="text-xs font-medium text-gray-500"
              >
                👤 Quick Select (Optional)
              </Label>
              <p className="text-xs text-gray-400 mb-2">
                Select a user to auto-fill email address
              </p>
              <Select
                value={selectedUser?.id || ""}
                onValueChange={(value) => {
                  const user = users.find((u) => u.id === value);
                  setSelectedUser(user);
                  if (user) {
                    setRecipientEmail(user.email);
                  }
                }}
              >
                <SelectTrigger className="w-full h-8 text-sm border-gray-300 bg-gray-50">
                  <SelectValue placeholder="Choose from existing users..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleSendMail}
                disabled={sendingMail || !recipientEmail}
                className="flex items-center gap-1 h-7 text-xs px-3"
                size="sm"
              >
                <Send className="w-3 h-3" />
                {sendingMail ? "Sending..." : "Send"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMailForm(false);
                  setRecipientEmail("");
                  setSelectedUser(null);
                }}
                className="h-7 text-xs px-3"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t flex-shrink-0">
          <div className="flex gap-2">
            {!showMailForm ? (
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
            ) : (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Work Order Created Successfully
              </div>
            )}
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
