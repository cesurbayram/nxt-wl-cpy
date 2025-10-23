import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UtilizationReportData } from "@/types/utilization-report.types";
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


export async function generateUtilizationPDF(
    data: UtilizationReportData
): Promise<jsPDF> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });


    addReportContent(doc, data);

    return doc;
}


function addReportContent(doc: jsPDF, data: UtilizationReportData) {
    let yPos = 20;


    doc.setFillColor(...COLORS.success);
    doc.rect(0, 0, 210, 45, "F");


    doc.setFillColor(...COLORS.successLight);
    doc.rect(0, 42, 210, 3, "F");


    doc.setTextColor(...COLORS.white);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Robot Utilization Report", 38, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("7-Day Performance & Efficiency Analysis", 38, 28);


    const now = new Date();
    const dateStr = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.successLight);
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

        doc.setFillColor(254, 243, 199);
        doc.rect(15, yPos, 180, 80, "F");

        yPos += 15;
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("No Utilization Data Available", 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`• Found ${data.metadata.total_controllers} robot(s) in system`, 25, yPos);
        yPos += 6;
        doc.text("• No utilization data recorded for the last 7 days", 25, yPos);
        yPos += 6;
        doc.text("• Make sure robots are connected and utilization data is being collected", 25, yPos);
        yPos += 6;
        doc.text("• Data collection may take some time after initial setup", 25, yPos);


        if (data.metadata.total_controllers > 0) {
            yPos += 15;
            doc.setTextColor(17, 24, 39);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Detected Robots:", 20, yPos);
            yPos += 8;

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text("• Robot systems are configured but no utilization data is available yet", 25, yPos);
        }

        return;
    }


    const totalHours = data.summary.total_operating_hours;
    const avgHours = data.summary.average_daily_hours;
    const efficiency = data.summary.total_efficiency_percentage;


    const drawMetricCard = (x: number, y: number, title: string, value: string, percentage: number, color: [number, number, number], icon: string) => {
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
        doc.setTextColor(...color);
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


    const maxHours = 168;
    const hoursPercentage = (totalHours / maxHours) * 100;
    const dailyPercentage = (avgHours / 24) * 100;

    drawMetricCard(20, yPos, "Total Hours", `${totalHours.toFixed(0)}h`, hoursPercentage, COLORS.primary, "");
    drawMetricCard(78, yPos, "Daily Avg", `${avgHours.toFixed(1)}h`, dailyPercentage, COLORS.success, "");
    drawMetricCard(136, yPos, "Efficiency", `${efficiency.toFixed(0)}%`, efficiency, efficiency > 75 ? COLORS.success : efficiency > 50 ? COLORS.warning : COLORS.danger, "");

    yPos += 48;


    doc.setTextColor(...COLORS.text);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Robot Performance Details", 20, yPos);
    yPos += 8;

    const tableData = data.controllers.map((controller, index) => {
        const trend = controller.totals.efficiency_trend;
        const trendText = trend > 0 ? `+${formatNumberForPDF(trend)}%` : `${formatNumberForPDF(trend)}%`;
        const trendIcon = trend > 5 ? "↗" : trend < -5 ? "↘" : "→";
        const efficiency = controller.totals.average_daily_hours / 24 * 100;
        const statusIcon = efficiency > 75 ? "OK" : efficiency > 50 ? "!" : "!!";
        
        // Use name if available, otherwise use IP address or Robot # as fallback
        const robotName = controller.name || controller.ip_address || `Robot #${index + 1}`;

        return [
            `${index + 1}`,
            cleanTableText(robotName, 25),
            `${formatNumberForPDF(controller.totals.total_operating_hours)}h`,
            `${formatNumberForPDF(controller.totals.average_daily_hours)}h`,
            `${efficiency.toFixed(0)}%`,
            `${trendIcon} ${trendText}`,
            statusIcon
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['#', 'Robot Name', 'Total', 'Daily Avg', 'Efficiency', 'Trend', '']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.success,
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
            2: { cellWidth: 22 },
            3: { cellWidth: 22 },
            4: { cellWidth: 22 },
            5: { cellWidth: 25 },
            6: { cellWidth: 10 }
        },
        margin: { left: 20, right: 20 }
    });


    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos < 220 && data.controllers.length > 0) {
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Daily Breakdown (Last 7 Days)", 20, yPos);
        yPos += 10;


        const firstRobot = data.controllers[0];
        if (firstRobot.daily_data.length > 0) {
            const dailyData = firstRobot.daily_data.slice(-7).map(day => [
                formatDateForPDF(day.date),
                `${formatNumberForPDF(day.operating_hours)}h`,
                `${formatNumberForPDF(day.efficiency_percentage)}%`,
                day.day_over_day_change > 0 ? `+${formatNumberForPDF(day.day_over_day_change)}h` : `${formatNumberForPDF(day.day_over_day_change)}h`
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Operating Hours', 'Efficiency', 'Change']],
                body: dailyData,
                theme: 'striped',
                headStyles: {
                    fillColor: [107, 114, 128],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [17, 24, 39],
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 }
                },
                margin: { left: 20, right: 20 }
            });


            yPos = (doc as any).lastAutoTable.finalY + 8;
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.text(`* Daily breakdown shown for ${cleanTextForPDF(firstRobot.name)} (Robot 1)`, 20, yPos);
        }
    }


    doc.setFillColor(...COLORS.grayLight);
    doc.rect(0, 280, 210, 17, "F");
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.2);
    doc.line(20, 281, 190, 281);

    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("WatchLog - Robot Utilization Monitoring", 20, 288);
    doc.setFont("helvetica", "bold");
    doc.text("Page 1 of 1", 185, 288);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text(`Report ID: UTIL-${Date.now().toString().slice(-8)}`, 105, 292, { align: 'center' });
}
