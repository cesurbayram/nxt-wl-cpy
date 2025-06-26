import { ReportData } from "@/types/report-data.types";
import * as XLSX from "xlsx";
import fs from "fs";

export async function generateExcel(
  reportData: ReportData,
  filePath: string
): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new();

    addSummarySheet(workbook, reportData);

    reportData.data.forEach((dataset, index) => {
      addDataSheet(workbook, dataset, index);
    });

    XLSX.writeFile(workbook, filePath);
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
}

function addSummarySheet(workbook: XLSX.WorkBook, reportData: ReportData) {
  const summaryData = [
    ["Report Summary"],
    [""],
    ["Report Name", reportData.metadata.report_name],
    [
      "Generated At",
      new Date(reportData.metadata.generated_at).toLocaleString(),
    ],
    ["Total Records", reportData.metadata.total_records],
    ["Data Sources", reportData.metadata.data_sources.join(", ")],
  ];

  if (reportData.metadata.date_range) {
    summaryData.push([
      "Date Range",
      `${new Date(
        reportData.metadata.date_range.start_date
      ).toLocaleDateString()} - ${new Date(
        reportData.metadata.date_range.end_date
      ).toLocaleDateString()}`,
    ]);
  }

  if (reportData.metadata.description) {
    summaryData.push(["Description", reportData.metadata.description]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  summarySheet["!cols"] = [{ wch: 20 }, { wch: 50 }];

  if (summarySheet["A1"]) {
    summarySheet["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "ffffff" } },
      fill: { fgColor: { rgb: "2563eb" } },
    };
  }

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
}

function addDataSheet(workbook: XLSX.WorkBook, dataset: any, index: number) {
  const sheetData = [
    [dataset.source],
    [`Total Count: ${dataset.total_count}`],
    [""],
    dataset.headers,
    ...dataset.rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  const colWidths = dataset.headers.map((header: string) => ({
    wch: Math.max(header.length + 2, 12),
  }));
  worksheet["!cols"] = colWidths;

  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      font: { bold: true, sz: 12, color: { rgb: "ffffff" } },
      fill: { fgColor: { rgb: "2563eb" } },
    };
  }

  dataset.headers.forEach((_: any, colIndex: number) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 3, c: colIndex });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "eff6ff" } },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }
  });

  const sheetName = dataset.source
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}
