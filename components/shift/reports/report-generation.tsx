"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReportConfig } from "@/types/report.types";
import { generateReport } from "@/utils/service/reports";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { ReportCategorySelector } from "./ui/report-category-selector";
import { ReportTypeSelector } from "./ui/report-type-selector";
import { ReportConfigForm } from "./ui/report-config-form";
import ReportControllerSelector from "./ui/report-controller-selector";
import { ReportDateRangeSelector } from "./ui/report-date-range-selector";

export function ReportGeneration() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedControllerIds, setSelectedControllerIds] = useState<string[]>(
    []
  );

  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    categoryId: "",
    typeId: "",
    name: "",
    description: "",
    filters: {},
    exportFormat: "pdf",
  });

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedCategory || !selectedType || !reportConfig.name) {
      return;
    }

    const finalConfig: ReportConfig = {
      ...reportConfig,
      categoryId: selectedCategory,
      typeId: selectedType,
      filters: {
        ...reportConfig.filters,
        ...(selectedControllerIds.length > 0 && {
          controller_ids: selectedControllerIds,
        }),
        ...(dateRange.startDate && {
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
        }),
        ...(dateRange.endDate && {
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        }),
      },
    };

    setIsGenerating(true);
    try {
      const result = await generateReport(finalConfig);
      console.log("Report generated:", result);

      setReportConfig({
        categoryId: "",
        typeId: "",
        name: "",
        description: "",
        filters: {},
        exportFormat: "pdf",
      });
      setSelectedCategory("");
      setSelectedType("");
      setSelectedControllerIds([]);
      setDateRange({ startDate: null, endDate: null });
    } catch (error) {
      console.error("Report generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCategorySelector
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ReportTypeSelector
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      <Separator className="bg-gray-200" />

      <ReportConfigForm
        config={reportConfig}
        onConfigChange={setReportConfig}
      />

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <ReportControllerSelector
          selectedControllerIds={selectedControllerIds}
          onControllerSelectionChange={setSelectedControllerIds}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <ReportDateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <Separator className="bg-gray-200" />

      <div className="flex justify-end">
        <Button
          onClick={handleGenerateReport}
          disabled={
            !selectedCategory ||
            !selectedType ||
            !reportConfig.name ||
            isGenerating
          }
          className="flex items-center gap-2 bg-[#6950e8] hover:bg-[#5a47d1] px-6 py-2 text-white font-medium rounded-lg transition-colors duration-200"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </div>
  );
}
