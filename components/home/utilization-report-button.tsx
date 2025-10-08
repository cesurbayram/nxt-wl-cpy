"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileBarChart, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UtilizationReportButtonProps {
    className?: string;
}

export function UtilizationReportButton({
    className = "",
}: UtilizationReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            setProgress(10);

            toast.info("Generating utilization report...", {
                description: "Collecting 7-day utilization data from all robots.",
            });

            setProgress(30);


            const response = await fetch("/api/home/utilization-report", {
                method: "GET",
            });

            setProgress(70);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate utilization report");
            }

            setProgress(90);


            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });


            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;


            const contentDisposition = response.headers.get("Content-Disposition");
            let fileName = "utilization_report.pdf";

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

            toast.success("Utilization report downloaded successfully!", {
                description: "7-day robot performance analysis is ready.",
            });

        } catch (error: any) {
            console.error("Error downloading utilization report:", error);

            toast.error("Failed to generate utilization report", {
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
                size="lg"
                className="h-14 px-3 flex flex-col items-center justify-center gap-1 border-2 hover:border-[#6950e8] hover:bg-[#6950e8]/5 transition-all duration-200 group min-w-[140px] max-w-[160px]"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin text-[#6950e8]" />
                        <span className="text-sm font-medium">Generating {progress}%</span>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <FileBarChart className="h-5 w-5 text-[#6950e8] group-hover:scale-110 transition-transform" />
                            <Download className="h-4 w-4 text-gray-500 group-hover:text-[#6950e8] transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-[#6950e8] transition-colors">
                            Utilization Report
                        </span>
                    </>
                )}
            </Button>
        </div>
    );
}
