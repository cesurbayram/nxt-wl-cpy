"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Activity, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface SystemHealthReportButtonProps {
  className?: string;
}

export function SystemHealthReportButton({
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


      const response = await fetch("/api/system-reports/system-health-report", {
        method: "GET",
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      setProgress(90);


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


      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName = fileName.replace(/\.[^.]*$/, '.pdf');
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();


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
    <div className={`relative ${className}`}>
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        variant="outline"
        size="default"
        className="w-full h-10 border-2 hover:border-[#6950e8] hover:bg-[#6950e8] hover:text-white transition-all duration-200 font-medium"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {progress}%
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download
          </>
        )}
      </Button>
    </div>
  );
}

