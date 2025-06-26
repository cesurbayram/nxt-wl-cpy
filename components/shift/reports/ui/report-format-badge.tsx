import { Badge } from "@/components/ui/badge";
import { FileText, FileSpreadsheet, File } from "lucide-react";

interface ReportFormatBadgeProps {
  format: "pdf" | "excel" | "csv";
  className?: string;
}

export function ReportFormatBadge({
  format,
  className,
}: ReportFormatBadgeProps) {
  const getFormatConfig = () => {
    switch (format) {
      case "pdf":
        return {
          icon: FileText,
          text: "PDF",
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      case "excel":
        return {
          icon: FileSpreadsheet,
          text: "Excel",
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case "csv":
        return {
          icon: File,
          text: "CSV",
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };
      default:
        return {
          icon: File,
          text: String(format).toUpperCase(),
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
    }
  };

  const config = getFormatConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 ${config.className} ${
        className || ""
      }`}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
