import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OperatingRateReportData } from "@/types/operating-rate-report.types";
import { cleanTextForPDF, cleanTableText, formatDateForPDF, formatNumberForPDF } from "@/utils/common/pdf-text-utils";

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],
  primaryDark: [29, 78, 216] as [number, number, number],
  primaryLight: [191, 219, 254] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  successLight: [209, 250, 229] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  warningLight: [254, 243, 199] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  dangerLight: [254, 226, 226] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  grayDark: [55, 65, 81] as [number, number, number],
  grayLight: [243, 244, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  text: [17, 24, 39] as [number, number, number]
};

/**
 * Generate operating rate analysis PDF report
 */
export async function generateOperatingRatePDF(
  data: OperatingRateReportData
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm", 
    format: "a4",
  });

  addReportContent(doc, data);
  return doc;
}

function addReportContent(doc: jsPDF, data: OperatingRateReportData) {
  let yPos = 20;

  // Modern Header
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, 210, 45, "F");
  
  doc.setFillColor(...COLORS.primaryLight);
  doc.rect(0, 42, 210, 3, "F");
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Operating Rate Analysis", 38, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("7-Day Log Data & System States Analysis", 38, 28);
  
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}`;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.primaryLight);
  doc.text(`Generated: ${dateStr}`, 38, 35);

  yPos = 58;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 20, yPos);
  yPos += 8;

  doc.setFillColor(...COLORS.grayLight);
  doc.setDrawColor(...COLORS.gray);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, yPos, 170, 12, 2, 2, "FD");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.grayDark);
  doc.text(`Analysis Period: ${data.metadata.period}`, 25, yPos + 7);
  doc.text(`Total Robots: ${data.metadata.total_controllers}`, 125, yPos + 7);
  yPos += 18;

  if (data.controllers.length === 0) {
    doc.setFillColor(...COLORS.warningLight);
    doc.setDrawColor(...COLORS.warning);
    doc.setLineWidth(1);
    doc.roundedRect(15, yPos, 180, 40, 3, 3, "FD");
    
    yPos += 15;
    doc.setTextColor(...COLORS.warning);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("No Log Data Available", 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.grayDark);
    doc.text("Make sure robots are connected and log data is being collected.", 105, yPos, { align: 'center' });
    
    addModernFooter(doc);
    return;
  }

  // Modern metrics cards
  const overallRate = data.summary.overall_operating_rate;
  const totalLogs = data.summary.total_log_entries;
  const criticalEvents = data.summary.total_critical_events;

  const drawMetricCard = (x: number, y: number, title: string, value: string, percentage: number, color: [number, number, number], icon: string, showWarning: boolean = false) => {
    const cardWidth = 53;
    const cardHeight = 38;
    
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(x + 0.5, y + 0.5, cardWidth, cardHeight, 3, 3, "F");
    
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "FD");
    
    doc.setFillColor(...color);
    doc.roundedRect(x, y, cardWidth, 6, 3, 3, "F");
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(x, y + 3, cardWidth, 3, 0, 0, "F");
    
    doc.setFontSize(12);
    doc.text(icon, x + 5, y + 16);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.gray);
    doc.text(title, x + 15, y + 13);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(showWarning ? COLORS.danger : color));
    doc.text(value, x + 15, y + 23);
    
    const barWidth = cardWidth - 10;
    const barHeight = 4;
    const barX = x + 5;
    const barY = y + cardHeight - 9;
    
    doc.setFillColor(...COLORS.grayLight);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, "F");
    
    const fillWidth = (barWidth * Math.min(percentage, 100)) / 100;
    doc.setFillColor(...color);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, "F");
  };
  
  drawMetricCard(20, yPos, "Operating Rate", `${overallRate.toFixed(0)}%`, overallRate, overallRate > 75 ? COLORS.success : overallRate > 50 ? COLORS.warning : COLORS.danger, "", false);
  drawMetricCard(78, yPos, "Log Entries", `${totalLogs}`, 100, COLORS.primary, "", false);
  drawMetricCard(136, yPos, "Critical", `${criticalEvents}`, criticalEvents > 0 ? 100 : 0, criticalEvents > 0 ? COLORS.danger : COLORS.success, "", criticalEvents > 10);

  yPos += 48;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Robot Performance Details", 20, yPos);
  yPos += 8;

  const tableData = data.controllers.map((controller, index) => {
    const analysis = controller.operating_analysis;
    const trend = analysis.performance_trend;
    const trendText = trend > 0 ? `+${trend.toFixed(0)}%` : `${trend.toFixed(0)}%`;
    const trendIcon = trend > 5 ? "↗" : trend < -5 ? "↘" : "→";
    const rate = analysis.operating_rate_percentage;
    const statusIcon = rate > 75 ? "OK" : rate > 50 ? "!" : "!!";
    
    return [
      `${index + 1}`,
      cleanTableText(controller.name, 22),
      `${rate.toFixed(0)}%`,
      `${analysis.total_log_entries}`,
      `${analysis.critical_events.total_count}`,
      `${trendIcon} ${trendText}`,
      statusIcon
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Robot Name', 'Rate', 'Logs', 'Critical', 'Trend', '']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primaryDark,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text,
      halign: 'center',
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: COLORS.grayLight
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20 },
      5: { cellWidth: 24 },
      6: { cellWidth: 10 }
    },
    margin: { left: 20, right: 20 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos < 245 && data.controllers.length > 0) {
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Key Insights", 20, yPos);
    yPos += 10;

    const insightBoxWidth = 170;
    const insightBoxHeight = 10;
    
    doc.setFillColor(...COLORS.primaryLight);
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.grayDark);
    doc.text(`Best Performer: ${cleanTextForPDF(data.summary.most_efficient_controller)}`, 25, yPos + 6.5);
    yPos += insightBoxHeight + 4;
    
    doc.setFillColor(...COLORS.warningLight);
    doc.setDrawColor(...COLORS.warning);
    doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
    doc.text(`Needs Attention: ${cleanTextForPDF(data.summary.least_efficient_controller)}`, 25, yPos + 6.5);
    yPos += insightBoxHeight + 4;
    
    if (data.summary.total_critical_events > 0) {
      doc.setFillColor(...COLORS.dangerLight);
      doc.setDrawColor(...COLORS.danger);
      doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
      doc.setTextColor(...COLORS.danger);
      doc.text(`${data.summary.total_critical_events} critical events detected - review required`, 25, yPos + 6.5);
    } else {
      doc.setFillColor(...COLORS.successLight);
      doc.setDrawColor(...COLORS.success);
      doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
      doc.setTextColor(...COLORS.success);
      doc.text(`No critical events - excellent system health`, 25, yPos + 6.5);
    }
  }

  addModernFooter(doc);
}

function addModernFooter(doc: jsPDF) {
  doc.setFillColor(...COLORS.grayLight);
  doc.rect(0, 280, 210, 17, "F");
  doc.setDrawColor(...COLORS.gray);
  doc.setLineWidth(0.2);
  doc.line(20, 281, 190, 281);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("WatchLog - Robot Operating Rate Analysis", 20, 288);
  doc.setFont("helvetica", "bold");
  doc.text("Page 1 of 1", 185, 288);
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text(`Report ID: OPR-${Date.now().toString().slice(-8)}`, 105, 292, { align: 'center' });
}

