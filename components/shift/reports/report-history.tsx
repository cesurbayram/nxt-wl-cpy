"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { DataTable } from "@/components/shared/data-table";
import { GeneratedReport } from "@/types/report.types";
import {
  getReportHistory,
  downloadReport,
  deleteReport,
  getReportStatus,
} from "@/utils/service/reports";
import { format } from "date-fns";

import {
  Download,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export function ReportHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await getReportHistory({
        page,
        pageSize,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as "pending" | "completed" | "failed")
            : undefined,
        format:
          formatFilter !== "all"
            ? (formatFilter as "pdf" | "excel" | "csv")
            : undefined,
      });
      setReportsData(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, pageSize, searchTerm, statusFilter, formatFilter]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [searchTerm, statusFilter, formatFilter]);

  const handleDownload = async (reportId: string) => {
    setIsDownloading(reportId);
    try {
      const response = await fetch(`/api/shift/reports/download/${reportId}`);
      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `report-${reportId}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    setIsDeleting(reportId);
    try {
      await deleteReport(reportId);

      await fetchReports();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-xs px-1.5 py-0.5"
          >
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-xs px-1.5 py-0.5"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-500 text-xs px-1.5 py-0.5"
          >
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 text-xs px-1.5 py-0.5"
          >
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {status}
          </Badge>
        );
    }
  };

  const getFormatBadge = (format: string) => {
    const formatLower = format?.toLowerCase() || "";
    const colors = {
      pdf: "bg-red-100 text-red-800",
      excel: "bg-green-100 text-green-800",
      csv: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge
        variant="secondary"
        className={colors[formatLower as keyof typeof colors] || ""}
      >
        {format?.toUpperCase() || "N/A"}
      </Badge>
    );
  };

  const columns: ColumnDef<GeneratedReport>[] = [
    {
      accessorKey: "name",
      header: "Report Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.report_name}</p>
          {row.original.type_description && (
            <p className="text-sm text-muted-foreground">
              {row.original.type_description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category_name || "N/A"}</Badge>
      ),
    },
    {
      accessorKey: "exportFormat",
      header: "Export Format",
      cell: ({ row }) => getFormatBadge(row.original.format),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {getStatusBadge(row.original.status)}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm">
          <p>
            {format(
              new Date(row.original.created_at || new Date()),
              "dd MMM yyyy"
            )}
          </p>
          <p className="text-muted-foreground">
            {format(new Date(row.original.created_at || new Date()), "HH:mm")}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(row.original.id)}
              disabled={isDownloading === row.original.id}
              className="flex items-center gap-1"
            >
              {isDownloading === row.original.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting === row.original.id}
              >
                {isDeleting === row.original.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Report</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{row.original.report_name}"?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search report name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setFormatFilter("all");
              }}
              size="sm"
            >
              Clear Filters
            </Button>

            <Button
              variant="outline"
              onClick={() => fetchReports()}
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            {reportsData
              ? `Total ${reportsData.total} report found`
              : "Loading reports..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading reports...</span>
              </div>
            </div>
          ) : reportsData && reportsData.reports.length > 0 ? (
            <>
              <DataTable columns={columns} data={reportsData.reports} />

              {reportsData.pagination &&
                reportsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * pageSize + 1} to{" "}
                      {Math.min(page * pageSize, reportsData.total)} of{" "}
                      {reportsData.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={!reportsData.pagination.hasPrev}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        <span className="text-sm">Page</span>
                        <span className="text-sm font-medium">{page}</span>
                        <span className="text-sm">of</span>
                        <span className="text-sm font-medium">
                          {reportsData.pagination.totalPages}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={!reportsData.pagination.hasNext}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground">No report found</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
