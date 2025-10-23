import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlarmReportData } from "@/types/alarm-report.types";
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


export async function generateAlarmReportPDF(
    data: AlarmReportData
): Promise<jsPDF> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });


    addPage1_Summary(doc, data);


    data.controllers.forEach((controller, index) => {
        doc.addPage();
        addControllerAlarmPage(doc, controller, index + 2);
    });

    return doc;
}


function addPage1_Summary(doc: jsPDF, data: AlarmReportData) {
    let yPos = 20;


    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 210, 45, "F");


    doc.setFillColor(...COLORS.danger);
    doc.rect(0, 42, 210, 3, "F");


    doc.setTextColor(...COLORS.white);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Robot Alarm Analysis Report", 38, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive Alarm History & Diagnostics", 38, 28);


    const now = new Date();
    const dateStr = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
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

        doc.setFillColor(254, 243, 199);
        doc.rect(15, yPos, 180, 60, "F");

        yPos += 15;
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("No Alarm Data Available", 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`• Found ${data.metadata.total_controllers} robot(s) in system`, 25, yPos);
        yPos += 6;
        doc.text("• No recent alarm history available", 25, yPos);
        yPos += 6;
        doc.text("• This could indicate excellent system health", 25, yPos);

        return;
    }


    const totalAlarms = data.summary.total_alarms;
    const criticalAlarms = data.summary.critical_alarms;
    const avgAlarms = data.summary.average_alarms_per_controller;


    // Add explanatory info box first
    doc.setFillColor(240, 248, 255);  // Light blue background
    doc.setDrawColor(59, 130, 246);   // Blue border
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, 170, 28, 3, 3, "FD");
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Report Explanation", 25, yPos);
    
    yPos += 6;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text("- Total: Total number of alarms", 25, yPos);
    yPos += 4.5;
    doc.text("- Critical: Number of critical alarms", 25, yPos);
    yPos += 4.5;
    doc.text("- Top Code: Most frequent alarm code", 25, yPos);
    yPos += 4.5;
    doc.text("- Last Alarm: Last alarm date", 25, yPos);
    
    yPos += 12;

    const cardWidth = 53;
    const cardHeight = 32;
    const cardGap = 5;


    const drawMetricCard = (x: number, y: number, title: string, value: string, color: [number, number, number], icon: string) => {

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


        doc.setFontSize(14);
        doc.text(icon, x + 5, y + 18);


        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.gray);
        doc.text(title, x + 16, y + 14);


        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...color);
        doc.text(value, x + 16, y + 25);
    };


    drawMetricCard(20, yPos, "Total Alarms", `${totalAlarms}`, COLORS.primary, "");
    drawMetricCard(20 + cardWidth + cardGap, yPos, "Critical", `${criticalAlarms}`, criticalAlarms > 0 ? COLORS.danger : COLORS.success, "");
    drawMetricCard(20 + (cardWidth + cardGap) * 2, yPos, "Avg/Robot", `${avgAlarms.toFixed(1)}`, COLORS.warning, "");

    yPos += cardHeight + 12;


    doc.setTextColor(...COLORS.text);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Robot Performance Details", 20, yPos);
    yPos += 8;

    const summaryTableData = data.controllers.map((controller, index) => {
        const summary = controller.alarm_summary;
        const lastAlarmDate = formatDateForPDF(summary.last_alarm_date);
        // If critical, show "!! X", otherwise just "OK" without number
        const criticalStatus = summary.critical_count > 0 ? `!! ${summary.critical_count}` : 'OK';
        
        // Use name if available, otherwise use IP address or Robot # as fallback
        const robotName = controller.name || controller.ip_address || `Robot #${index + 1}`;

        return [
            `${index + 1}`,
            robotName, // Use robotName directly instead of cleanTableText
            `${summary.total_count}`,
            criticalStatus,  // No extra number added, already included in criticalStatus
            cleanTableText(summary.most_frequent_code, 12) || summary.most_frequent_code || 'N/A',
            lastAlarmDate
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['#', 'Robot Name', 'Total', 'Critical', 'Top Code', 'Last Alarm']],
        body: summaryTableData,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 6
        },
        bodyStyles: {
            fontSize: 10,
            textColor: COLORS.text,
            halign: 'center',
            cellPadding: 5,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]  // Soft gray
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },           // # - bold
            1: { cellWidth: 52, halign: 'left', fontStyle: 'bold' },             // Robot Name - left aligned, bold
            2: { cellWidth: 20, halign: 'center' },                               // Total - centered
            3: { cellWidth: 26, halign: 'center' },                               // Critical - centered
            4: { cellWidth: 26, halign: 'center' },                               // Top Code - centered
            5: { cellWidth: 34, halign: 'center', fontSize: 9 }                   // Last Alarm - centered
        },
        margin: { left: 20, right: 20 }
    });


    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos < 245) {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Key Insights & Recommendations", 20, yPos);
        yPos += 10;


        const insightBoxWidth = 170;
        const insightBoxHeight = 10;


        doc.setFillColor(...COLORS.warningLight);
        doc.setDrawColor(...COLORS.warning);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.grayDark);
        doc.text(`Most Problematic Robot: ${cleanTextForPDF(data.summary.most_problematic_controller)} - needs attention`, 25, yPos + 6.5);
        yPos += insightBoxHeight + 4;


        doc.setFillColor(...COLORS.primaryLight);
        doc.setDrawColor(...COLORS.primary);
        doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
        doc.text(`Most Common Alarm Code: ${cleanTextForPDF(data.summary.most_common_alarm_code)} - check pattern`, 25, yPos + 6.5);
        yPos += insightBoxHeight + 4;


        if (data.summary.critical_alarms > 0) {
            doc.setFillColor(...COLORS.dangerLight);
            doc.setDrawColor(...COLORS.danger);
            doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
            doc.setTextColor(...COLORS.danger);
            doc.text(`${data.summary.critical_alarms} critical alarms detected - immediate action required!`, 25, yPos + 6.5);
        } else {
            doc.setFillColor(...COLORS.successLight);
            doc.setDrawColor(...COLORS.success);
            doc.roundedRect(20, yPos, insightBoxWidth, insightBoxHeight, 2, 2, "FD");
            doc.setTextColor(...COLORS.success);
            doc.text(`No critical alarms - all systems operating normally`, 25, yPos + 6.5);
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
    doc.text("WatchLog - Robot Alarm Analysis System", 20, 288);
    doc.setFont("helvetica", "bold");
    doc.text(`Page 1 of ${data.controllers.length + 1}`, 185, 288);


    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text(`Report ID: ALM-${Date.now().toString().slice(-8)}`, 105, 292, { align: 'center' });
}


function addControllerAlarmPage(doc: jsPDF, controller: any, pageNumber: number) {
    let yPos = 20;
    
    // Use name if available, otherwise use IP address as fallback
    const robotDisplayName = controller.name || controller.ip_address || `Robot ${controller.id}`;

    doc.setFillColor(...COLORS.primaryDark);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text(`${robotDisplayName}`, 20, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.primaryLight);
    doc.text(`Detailed Alarm Analysis`, 20, 25);


    doc.setFontSize(8);
    doc.text(`Model: ${controller.model}`, 20, 32);
    doc.text(`IP: ${controller.ip_address}`, 100, 32);

    yPos = 52;


    doc.setTextColor(...COLORS.text);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Recent Alarm History (Last 5)", 20, yPos);
    yPos += 10;

    if (controller.recent_alarms.length === 0) {

        doc.setFillColor(...COLORS.successLight);
        doc.setDrawColor(...COLORS.success);
        doc.setLineWidth(1);
        doc.roundedRect(15, yPos, 180, 40, 3, 3, "FD");

        yPos += 15;
        doc.setTextColor(...COLORS.success);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Excellent System Health!", 105, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.grayDark);
        doc.text("This robot has no recent alarm history and is operating normally.", 105, yPos, { align: 'center' });


        addModernFooter(doc, pageNumber);
        return;
    }


    controller.recent_alarms.forEach((alarm: any, index: number) => {
        if (yPos > 240) {
            doc.addPage();
            yPos = 30;
        }


        const isCritical = alarm.type === 'MAJOR' || alarm.type === 'SEVERE';
        const severityColor = isCritical ? COLORS.danger : COLORS.warning;
        const severityBg = isCritical ? COLORS.dangerLight : COLORS.warningLight;
        const severityIcon = isCritical ? '!!' : '!';


        doc.setFillColor(...severityBg);
        doc.setDrawColor(...severityColor);
        doc.setLineWidth(0.8);
        doc.roundedRect(15, yPos, 180, 14, 2, 2, "FD");


        doc.setTextColor(...severityColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`[${severityIcon}] Alarm #${index + 1}: Code ${alarm.code}`, 20, yPos + 6);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.grayDark);
        const alarmDate = new Date(alarm.origin_date).toLocaleString('tr-TR');
        doc.text(`${alarmDate} | Type: ${alarm.type} | Mode: ${alarm.mode}`, 20, yPos + 11);

        yPos += 18;


        const details = alarm.details;
        const detailsData = [
            ['Alarm Name', cleanTableText(details.alarm_name || 'N/A', 75)],
            ['Description', cleanTableText(details.contents || 'N/A', 75)],
            ['Sub Code', cleanTableText(details.sub_code || '-', 15)],
            ['Meaning', cleanTableText(details.meaning || 'N/A', 75)],
            ['Probable Cause', cleanTableText(details.cause || 'N/A', 75)],
            ['Recommended Action', cleanTableText(details.remedy || 'N/A', 75)]
        ];

        autoTable(doc, {
            startY: yPos,
            body: detailsData,
            theme: 'striped',
            bodyStyles: {
                fontSize: 9,
                textColor: COLORS.text,
                cellPadding: 5,
                lineColor: [230, 230, 230],
                lineWidth: 0.1,
                valign: 'top'
            },
            alternateRowStyles: {
                fillColor: [252, 252, 253]  // Very light gray
            },
            columnStyles: {
                0: {
                    cellWidth: 48,
                    fontStyle: 'bold',
                    fillColor: [240, 243, 248],  // Soft blue-gray
                    textColor: [40, 50, 70],     // Darker text
                    halign: 'left'
                },
                1: {
                    cellWidth: 122,
                    halign: 'left',
                    cellPadding: 6
                }
            },
            margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 8;
    });


    addModernFooter(doc, pageNumber);
}


function addModernFooter(doc: jsPDF, pageNumber: number) {
    doc.setFillColor(...COLORS.grayLight);
    doc.rect(0, 280, 210, 17, "F");
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.2);
    doc.line(20, 281, 190, 281);

    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("WatchLog - Robot Alarm Analysis System", 20, 288);
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber}`, 185, 288);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("Confidential - For Internal Use Only", 105, 292, { align: 'center' });
}
