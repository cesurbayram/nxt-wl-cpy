"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Wrench,
  Trash2,
  AlertTriangle,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface WorkOrder {
  id: string;
  controller_id: string;
  alarm_code: string;
  description: string;
  priority: string;
  status: string;
  created_date: string;
  controller_name?: string;
  controller_ip?: string;
  mail_recipient?: string;
}

interface WorkOrderListProps {
  controllerId: string;
}

const WorkOrderList = ({ controllerId }: WorkOrderListProps) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, [currentPage]);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/system-expectations/alarm-error-logs/work-orders?page=${currentPage}&pageSize=${pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.workOrders);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        toast.error("Failed to fetch work orders");
      }
    } catch (error) {
      console.error("Failed to fetch work orders:", error);
      toast.error("Failed to fetch work orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    setDeletingId(workOrderId);
    try {
      const response = await fetch(
        `/api/system-expectations/alarm-error-logs/work-order?id=${workOrderId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Work order deleted successfully");
        fetchWorkOrders();
      } else {
        toast.error("Failed to delete work order");
      }
    } catch (error) {
      console.error("Failed to delete work order:", error);
      toast.error("Failed to delete work order");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Work Orders</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Wrench className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {workOrders.filter((wo) => wo.status === "COMPLETED").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </Card>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alarm Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Controller</TableHead>
                <TableHead>Mail Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                      Loading work orders...
                    </div>
                  </TableCell>
                </TableRow>
              ) : workOrders.length > 0 ? (
                workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {workOrder.alarm_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={workOrder.description}>
                        {(() => {
                          const desc = workOrder.description;
                          if (desc.includes("COMMUNICATION ERROR"))
                            return "Communication Error";
                          if (desc.includes("SYSTEM ERROR"))
                            return "System Error";
                          if (desc.includes("F-SAFE BOARD"))
                            return "F-Safe Board Error";
                          if (desc.includes("M-SAFETY COMMUNICATE"))
                            return "Safety Communication Error";
                          if (desc.includes("ENCODER")) return "Encoder Error";
                          if (desc.includes("SERVO")) return "Servo Error";
                          if (desc.includes("EMERGENCY"))
                            return "Emergency Stop";
                          if (desc.includes("TEMPERATURE"))
                            return "Temperature Error";
                          if (desc.includes("PRESSURE"))
                            return "Pressure Error";
                          if (desc.includes("MOTOR")) return "Motor Error";

                          return desc.length > 25
                            ? desc.substring(0, 25) + "..."
                            : desc;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {workOrder.controller_name || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {workOrder.controller_ip || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-blue-600">
                          {workOrder.mail_recipient || "Not sent"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(workOrder.status)}
                      >
                        {workOrder.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(() => {
                        const date = new Date(workOrder.created_date);
                        return new Intl.DateTimeFormat("tr-TR", {
                          timeZone: "Europe/Istanbul",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        }).format(date);
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                            disabled={deletingId === workOrder.id}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {deletingId === workOrder.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Work Order
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this work order?
                              This action cannot be undone.
                              <br />
                              <br />
                              <strong>Work Order:</strong>{" "}
                              {workOrder.alarm_code} - {workOrder.description}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteWorkOrder(workOrder.id)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Wrench className="w-8 h-8 text-gray-400" />
                      <div>No work orders found</div>
                      <div className="text-sm">
                        Work orders will appear here when you create them from
                        alarms
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total}{" "}
              work orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderList;
