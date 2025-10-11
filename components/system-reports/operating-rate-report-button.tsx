"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OperatingRateReportButtonProps {
    className?: string;
}

export function OperatingRateReportButton({
    className = "",
}: OperatingRateReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            setProgress(10);

            toast.info("Generating operating rate report...", {
                description: "Analyzing 7-day log data from all robots.",
            });

            setProgress(30);


            const response = await fetch("/api/system-reports/operating-rate-report", {
                method: "GET",
            });

            setProgress(70);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate operating rate report");
            }

            setProgress(90);


            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });


            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;


            const contentDisposition = response.headers.get("Content-Disposition");
            let fileName = "operating_rate_report.pdf";

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

            toast.success("Operating rate report downloaded successfully!", {
                description: "7-day log data analysis is ready.",
            });

        } catch (error: any) {
            console.error("Error downloading operating rate report:", error);

            toast.error("Failed to generate operating rate report", {
                description: error.message || "Please try again later.",
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

