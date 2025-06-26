import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ReportStatusBadgeProps {
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  className?: string;
}

export function ReportStatusBadge({
  status,
  className,
}: ReportStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          variant: "secondary" as const,
          icon: Clock,
          text: "Pending",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
      case "processing":
        return {
          variant: "outline" as const,
          icon: Loader2,
          text: "Processing",
          className:
            "bg-blue-100 text-blue-800 hover:bg-blue-200 animate-pulse",
          iconClassName: "animate-spin",
        };
      case "completed":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          text: "Completed",
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case "failed":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          text: "Failed",
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      case "cancelled":
        return {
          variant: "secondary" as const,
          icon: AlertCircle,
          text: "Cancelled",
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
      default:
        return {
          variant: "secondary" as const,
          icon: AlertCircle,
          text: status,
          className: "",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${
        className || ""
      }`}
    >
      <Icon className={`h-3 w-3 ${config.iconClassName || ""}`} />
      {config.text}
    </Badge>
  );
}
