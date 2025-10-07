import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SystemHealthReportData } from "@/types/system-health-report.types";

const COLORS = {
  primary: "#6950e8",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f97316",
  info: "#3b82f6",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  darkGray: "#1f2937",
};

// Suppress autoTable warnings about table width
const originalWarn = console.warn;
console.warn = function(...args: any[]) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Of the table content')) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};

/**
 * Generate complete system health PDF report (WITHOUT CHARTS)
 */
export async function generateSystemHealthPDF(
  data: SystemHealthReportData
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page 1: Executive Summary
  addPage1_ExecutiveSummary(doc, data);

  // Page 2: Controller Status Table
  doc.addPage();
  addPage2_ControllerStatus(doc, data);

  // Page 3: Performance Analysis
  doc.addPage();
  addPage3_PerformanceAnalysis(doc, data);

  // Page 4: Alarm Analysis
  doc.addPage();
  addPage4_AlarmAnalysis(doc, data);

  // Page 5: Backup Status
  doc.addPage();
  addPage5_BackupStatus(doc, data);

  // Page 6: Production Summary
  doc.addPage();
  addPage6_ProductionSummary(doc, data);

  // Page 7: Maintenance Timeline
  doc.addPage();
  addPage7_MaintenanceTimeline(doc, data);

  // Page 8: Log Analysis
  doc.addPage();
  addPage8_LogAnalysis(doc, data);

  // Add page numbers to all pages
  addPageNumbers(doc);

  return doc;
}

/**
 * Add header to page
 */
function addPageHeader(doc: jsPDF, title: string) {
  // Header background
  doc.setFillColor(105, 80, 232); // primary color
  doc.rect(0, 0, 210, 25, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, 15);

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(dateStr, 210 - 15, 15, { align: "right" });

  // Reset color
  doc.setTextColor(0, 0, 0);
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: "center" });
  }
}

/**
 * PAGE 1: Executive Summary
 */
function addPage1_ExecutiveSummary(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "System Health Overview");

  let yPos = 35;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Executive Summary", 105, yPos, { align: "center" });

  yPos += 15;

  // KPI Cards - 2 rows of 2
  const cardWidth = 85;
  const cardHeight = 30;
  const gap = 10;
  const startX = 15;

  // Row 1
  drawKPICard(
    doc,
    startX,
    yPos,
    cardWidth,
    cardHeight,
    "Total Robots",
    data.summary.totalRobots.toString(),
    COLORS.primary
  );

  drawKPICard(
    doc,
    startX + cardWidth + gap,
    yPos,
    cardWidth,
    cardHeight,
    "Online Status",
    `${data.summary.onlineCount} / ${data.summary.totalRobots}`,
    COLORS.success
  );

  yPos += cardHeight + gap;

  // Row 2
  drawKPICard(
    doc,
    startX,
    yPos,
    cardWidth,
    cardHeight,
    "Avg Servo Time",
    `${data.summary.avgServoTime.toFixed(1)} hrs`,
    COLORS.info
  );

  drawKPICard(
    doc,
    startX + cardWidth + gap,
    yPos,
    cardWidth,
    cardHeight,
    "Alarms (24h)",
    data.summary.totalAlarmsLast24h.toString(),
    COLORS.danger
  );

  yPos += cardHeight + 15;

  // Key Insights
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Key Insights", 15, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const insights = [
    `• Top Performing Robot: ${data.summary.topPerformingRobot}`,
    `• Most Alarms: ${data.summary.mostAlarmsRobot}`,
    `• Offline Robots: ${data.summary.offlineCount}`,
    `• Production Today: ${data.production.totalProductionToday} units`,
    `• Backup Coverage: ${data.backups.controllersWithBackup}/${data.metadata.totalControllers} controllers`,
    `• Active Alarms: ${data.alarms.activeAlarms}`,
  ];

  insights.forEach((insight) => {
    doc.text(insight, 20, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Status Summary Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("System Status Summary", 15, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value", "Status"]],
    body: [
      [
        "Controllers Online",
        `${data.summary.onlineCount}/${data.summary.totalRobots}`,
        data.summary.onlineCount >= data.summary.totalRobots * 0.9 ? "✓ Good" : "⚠ Warning",
      ],
      [
        "Active Alarms",
        data.alarms.activeAlarms.toString(),
        data.alarms.activeAlarms === 0 ? "✓ Good" : "⚠ Action Needed",
      ],
      [
        "Backup Coverage",
        `${((data.backups.controllersWithBackup / data.metadata.totalControllers) * 100).toFixed(0)}%`,
        data.backups.controllersWithBackup === data.metadata.totalControllers ? "✓ Complete" : "⚠ Incomplete",
      ],
      [
        "Production Trend",
        data.production.productionDiff >= 0 ? `+${data.production.productionDiff}` : data.production.productionDiff.toString(),
        data.production.productionDiff >= 0 ? "✓ Increasing" : "⚠ Decreasing",
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [105, 80, 232],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
    },
  });
}

/**
 * Draw KPI Card
 */
function drawKPICard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  color: string
) {
  // Card background
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(x, y, width, height, 2, 2, "F");

  // Color accent bar
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(x, y, 4, height, 2, 2, "F");

  // Label
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(label, x + 10, y + 12);

  // Value
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(value, x + 10, y + 23);
}

/**
 * PAGE 2: Controller Status Table
 */
function addPage2_ControllerStatus(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Controller Status Details");

  let yPos = 35;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Robot/Controller Status", 15, yPos);

  yPos += 5;

  const tableData = data.controllers.map((c) => [
    c.name,
    c.model,
    c.location,
    c.isOnline ? "✓ Online" : "✗ Offline",
    c.servo ? "ON" : "OFF",
    c.operating ? "Yes" : "No",
    c.alarm ? "YES" : "No",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Name", "Model", "Location", "Status", "Servo", "Operating", "Alarm"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [105, 80, 232],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total: ${data.controllers.length} | Online: ${data.summary.onlineCount} | Offline: ${data.summary.offlineCount}`,
    15,
    finalY
  );
}

/**
 * PAGE 3: Performance Analysis
 */
function addPage3_PerformanceAnalysis(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Performance & Efficiency Analysis");

  let yPos = 35;

  // Today vs Yesterday Comparison
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Comparison (Today vs Yesterday)", 15, yPos);

  yPos += 8;

  const comparisonData = [
    [
      "Servo Time",
      `${data.performance.currentPeriod.avgServoTime.toFixed(2)} hrs`,
      `${data.performance.previousPeriod.avgServoTime.toFixed(2)} hrs`,
      `${data.performance.comparison.servoTimeDiffPercent > 0 ? "+" : ""}${data.performance.comparison.servoTimeDiffPercent.toFixed(1)}%`,
    ],
    [
      "Operating Time",
      `${data.performance.currentPeriod.avgOperatingTime.toFixed(2)} hrs`,
      `${data.performance.previousPeriod.avgOperatingTime.toFixed(2)} hrs`,
      `${data.performance.comparison.operatingTimeDiffPercent > 0 ? "+" : ""}${data.performance.comparison.operatingTimeDiffPercent.toFixed(1)}%`,
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Today", "Yesterday", "Change"]],
    body: comparisonData,
    theme: "grid",
    headStyles: {
      fillColor: [105, 80, 232],
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Weekly Trend Data (Table format)
  if (data.performance.weeklyTrend.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Weekly Performance Trend", 15, yPos);
    yPos += 5;

    const trendData = data.performance.weeklyTrend.map((t) => [
      new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      `${t.avgServoTime.toFixed(2)} hrs`,
      `${t.avgOperatingTime.toFixed(2)} hrs`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Avg Servo Time", "Avg Operating Time"]],
      body: trendData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // All Robots Performance (NO LIMIT)
  if (data.performance.robotPerformances.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      addPageHeader(doc, "Performance & Efficiency Analysis (Continued)");
      yPos = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`All Robots Performance (${data.performance.robotPerformances.length} robots)`, 15, yPos);
    yPos += 5;

    const performerData = data.performance.robotPerformances.map((p) => [
      p.controllerName,
      `${p.servoTime.toFixed(2)} hrs`,
      `${p.efficiency.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Servo Time", "Efficiency"]],
      body: performerData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
      },
    });
  }
}

/**
 * PAGE 4: Alarm Analysis
 */
function addPage4_AlarmAnalysis(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Alarm Analysis & Trends");

  let yPos = 35;

  // Summary stats
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Alarm Summary (Last 24 Hours)", 15, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Alarms: ${data.alarms.totalLast24h}`, 20, yPos);
  yPos += 6;
  doc.text(`Active Alarms: ${data.alarms.activeAlarms}`, 20, yPos);
  yPos += 6;
  doc.text(
    `Major: ${data.alarms.severityDistribution.major} | Minor: ${data.alarms.severityDistribution.minor}`,
    20,
    yPos
  );

  yPos += 12;

  // Severity Distribution (as table)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Alarm Severity Distribution", 15, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Type", "Count", "Percentage"]],
    body: [
      [
        "MAJOR",
        data.alarms.severityDistribution.major.toString(),
        `${data.alarms.totalLast24h > 0 ? ((data.alarms.severityDistribution.major / data.alarms.totalLast24h) * 100).toFixed(1) : 0}%`,
      ],
      [
        "MINOR",
        data.alarms.severityDistribution.minor.toString(),
        `${data.alarms.totalLast24h > 0 ? ((data.alarms.severityDistribution.minor / data.alarms.totalLast24h) * 100).toFixed(1) : 0}%`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [105, 80, 232],
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // All Alarm Codes (NO LIMIT)
  if (data.alarms.topAlarmCodes.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`All Alarm Codes (${data.alarms.topAlarmCodes.length} types)`, 15, yPos);
    yPos += 5;

    const topAlarmsData = data.alarms.topAlarmCodes.map((a) => [
      a.code,
      a.text.substring(0, 50),
      a.count.toString(),
      a.severity,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Code", "Description", "Count", "Severity"]],
      body: topAlarmsData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 90 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ALL Recent Alarms (NO LIMIT - will create multiple pages if needed)
  if (data.alarms.recentAlarms.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      addPageHeader(doc, "Alarm Analysis & Trends (Continued)");
      yPos = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`All Recent Alarms (${data.alarms.recentAlarms.length} total)`, 15, yPos);
    yPos += 5;

    const recentData = data.alarms.recentAlarms.map((a) => [
      a.controllerName,
      a.code,
      a.text.substring(0, 40),
      new Date(a.detected).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      a.severity,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Code", "Description", "Detected", "Severity"]],
      body: recentData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 8,
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 18 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35 },
        4: { cellWidth: 22 },
      },
    });
  }
}

/**
 * PAGE 5: Backup Status
 */
function addPage5_BackupStatus(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Backup Status & Coverage");

  let yPos = 35;

  // Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Backup Coverage Summary", 15, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Controllers with Backup: ${data.backups.controllersWithBackup}/${data.metadata.totalControllers}`,
    20,
    yPos
  );
  yPos += 6;
  doc.text(`Success Rate: ${data.backups.successRate.toFixed(1)}%`, 20, yPos);
  yPos += 6;
  doc.text(`Missing Backups: ${data.backups.controllersWithoutBackup}`, 20, yPos);

  yPos += 12;

  // Backup Details Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Backup Details by Robot", 15, yPos);
  yPos += 5;

  const backupData = data.backups.backupDetails.map((b) => [
    b.controllerName,
    b.lastBackupDate
      ? new Date(b.lastBackupDate).toLocaleDateString("en-US")
      : "Never",
    b.daysSinceLastBackup !== null ? `${b.daysSinceLastBackup} days` : "N/A",
    `${b.successfulFiles}/${b.totalFiles}`,
    b.status,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Robot", "Last Backup", "Days Ago", "Files", "Status"]],
    body: backupData,
    theme: "striped",
    headStyles: {
      fillColor: [105, 80, 232],
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Missing Backups Warning
  if (data.backups.missingBackups.length > 0) {
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(15, yPos, 180, 20 + data.backups.missingBackups.length * 5, 2, 2, "F");

    yPos += 6;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(185, 28, 28);
    doc.text("⚠️ Controllers Needing Backup:", 20, yPos);

    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    data.backups.missingBackups.forEach((name) => {
      doc.text(`• ${name}`, 25, yPos);
      yPos += 5;
    });

    doc.setTextColor(0, 0, 0);
  }
}

/**
 * PAGE 6: Production Summary
 */
function addPage6_ProductionSummary(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Production Summary & Metrics");

  let yPos = 35;

  // Production Overview
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Daily Production Overview", 15, yPos);

  yPos += 8;

  const prodDiffSymbol = data.production.productionDiff >= 0 ? "+" : "";
  const prodDiffColor = data.production.productionDiff >= 0 ? COLORS.success : COLORS.danger;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Today: ${data.production.totalProductionToday} units`, 20, yPos);
  yPos += 6;
  doc.text(`Yesterday: ${data.production.totalProductionYesterday} units`, 20, yPos);
  yPos += 6;

  const rgb = hexToRgb(prodDiffColor);
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text(
    `Change: ${prodDiffSymbol}${data.production.productionDiff} units (${prodDiffSymbol}${data.production.productionDiffPercent.toFixed(1)}%)`,
    20,
    yPos
  );
  doc.setTextColor(0, 0, 0);

  yPos += 10;

  if (data.production.topJob) {
    doc.text(
      `Top Job: ${data.production.topJob} (${data.production.topJobCount} entries)`,
      20,
      yPos
    );
    yPos += 8;
  }

  yPos += 5;

  // Shift Production
  if (data.production.shiftProduction.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Production by Shift", 15, yPos);
    yPos += 5;

    const shiftData = data.production.shiftProduction.map((s) => [
      s.shiftName,
      s.totalProduction.toString(),
      s.controllerCount.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Shift", "Total Production", "Controllers"]],
      body: shiftData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Production by ALL Controllers (NO LIMIT)
  if (data.production.productionByController.length > 0) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      addPageHeader(doc, "Production Summary & Metrics (Continued)");
      yPos = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Production by All Robots (${data.production.productionByController.length} robots)`, 15, yPos);
    yPos += 5;

    const controllerData = data.production.productionByController
      .map((c) => [
        c.controllerName,
        c.totalProduction.toString(),
        c.jobCount.toString(),
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Total Production", "Jobs"]],
      body: controllerData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
      },
    });
  }
}

/**
 * PAGE 7: Maintenance Timeline
 */
function addPage7_MaintenanceTimeline(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Maintenance History & Schedule");

  let yPos = 35;

  // Recent Maintenance
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Maintenance Activities", 15, yPos);

  yPos += 5;

  if (data.maintenance.recentMaintenance.length > 0) {
    const recentData = data.maintenance.recentMaintenance.map((m) => [
      m.controllerName,
      m.maintenanceType,
      new Date(m.maintenanceDate).toLocaleDateString("en-US"),
      `${m.servoHours.toFixed(0)} hrs`,
      m.technician,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Type", "Date", "Servo Hours", "Technician"]],
      body: recentData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No recent maintenance records", 20, yPos + 5);
    yPos += 15;
  }

  // Upcoming Maintenance
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Upcoming Maintenance (Next 30 Days)", 15, yPos);

  yPos += 5;

  if (data.maintenance.upcomingMaintenance.length > 0) {
    const upcomingData = data.maintenance.upcomingMaintenance.map((m) => [
      m.controllerName,
      new Date(m.estimatedDate).toLocaleDateString("en-US"),
      `${m.daysUntilMaintenance} days`,
      `${m.currentServoHours.toFixed(0)} hrs`,
      `${m.maintenanceThreshold} hrs`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Est. Date", "In Days", "Current Hours", "Threshold"]],
      body: upcomingData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
      },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No upcoming maintenance scheduled", 20, yPos + 5);
  }
}

/**
 * PAGE 8: Log Analysis
 */
function addPage8_LogAnalysis(doc: jsPDF, data: SystemHealthReportData) {
  addPageHeader(doc, "Log Activity Analysis");

  let yPos = 35;

  // Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Log Data Summary", 15, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Log Entries: ${data.logs.totalLogEntries}`, 20, yPos);
  yPos += 6;
  doc.text(`Critical Events: ${data.logs.criticalEvents.length}`, 20, yPos);

  yPos += 12;

  // Logs by Controller
  if (data.logs.logsByController.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Log Entries by Robot", 15, yPos);
    yPos += 5;

    const logData = data.logs.logsByController.map((l) => [
      l.controllerName,
      l.totalEntries.toString(),
      l.lastLogDate || "N/A",
      l.criticalCount.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Total Entries", "Last Log", "Critical"]],
      body: logData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ALL Common Operations (NO LIMIT)
  if (data.logs.topEvents.length > 0) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      addPageHeader(doc, "Log Activity Analysis (Continued)");
      yPos = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`All Common Operations (${data.logs.topEvents.length} types)`, 15, yPos);
    yPos += 5;

    const topEventsData = data.logs.topEvents.map((e) => [
      e.eventType,
      e.count.toString(),
      `${e.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Event Type", "Count", "Percentage"]],
      body: topEventsData,
      theme: "striped",
      headStyles: {
        fillColor: [105, 80, 232],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ALL Critical Events (NO LIMIT)
  if (data.logs.criticalEvents.length > 0) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      addPageHeader(doc, "Log Activity Analysis (Continued)");
      yPos = 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`All Critical Events (${data.logs.criticalEvents.length} events)`, 15, yPos);
    yPos += 5;

    const criticalData = data.logs.criticalEvents.map((e) => [
      e.controllerName,
      e.event.substring(0, 50),
      e.date,
      e.loginName,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Robot", "Event", "Date", "User"]],
      body: criticalData,
      theme: "striped",
      headStyles: {
        fillColor: [239, 68, 68],
        fontSize: 9,
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
      },
    });
  }
}

/**
 * Helper: Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

