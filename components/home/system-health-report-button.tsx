"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SystemHealthReportButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function SystemHealthReportButton({
  variant = "default",
  size = "default",
  showIcon = true,
  className = "",
}: SystemHealthReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setProgress(10);

      toast.info("Generating system health report...", {
        description: "This may take a moment. Collecting data from all controllers.",
      });

      setProgress(30);

      // Call API endpoint
      const response = await fetch("/api/home/system-health-report", {
        method: "GET",
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      setProgress(90);

      // Get the PDF blob with explicit type
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "system_health_report.pdf";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Ensure .pdf extension
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName = fileName.replace(/\.[^.]*$/, '.pdf');
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setProgress(100);

      toast.success("Report downloaded successfully!", {
        description: `${fileName} has been saved to your downloads folder.`,
      });
    } catch (error: any) {
      console.error("Error downloading report:", error);
      toast.error("Failed to generate report", {
        description: error.message || "An error occurred while generating the report.",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating {progress}%
        </>
      ) : (
        <>
          {showIcon && <Download className="mr-2 h-4 w-4" />}
          System Health Report
        </>
      )}
    </Button>
  );
}

/**
 * Compact button variant for toolbar/header
 */
export function SystemHealthReportIconButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);

      toast.info("Generating report...");

      const response = await fetch("/api/home/system-health-report");

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "system_health_report.pdf";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Ensure .pdf extension
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName = fileName.replace(/\.[^.]*$/, '.pdf');
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant="ghost"
      size="icon"
      title="Download System Health Report"
    >
      {isGenerating ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <FileText className="h-5 w-5" />
      )}
    </Button>
  );
}

