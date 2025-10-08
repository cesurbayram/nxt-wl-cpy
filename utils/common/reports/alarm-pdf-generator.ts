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
        const criticalStatus = summary.critical_count > 0 ? '!!' : 'OK';

        return [
            `${index + 1}`,
            cleanTableText(controller.name, 28),
            `${summary.total_count}`,
            `${criticalStatus} ${summary.critical_count}`,
            cleanTableText(summary.most_frequent_code, 12),
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
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 55, halign: 'left', fontStyle: 'bold' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 22, halign: 'center' },
            5: { cellWidth: 28, halign: 'center', fontSize: 8 }
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


    doc.setFillColor(...COLORS.primaryDark);
    doc.rect(0, 0, 210, 40, "F");


    doc.setFillColor(...COLORS.primaryLight);
    doc.circle(25, 20, 7, "F");

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text(`${controller.name}`, 36, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.primaryLight);
    doc.text(`Detailed Alarm Analysis`, 36, 25);


    doc.setFontSize(8);
    doc.text(`Model: ${controller.model}`, 36, 32);
    doc.text(`IP: ${controller.ip_address}`, 110, 32);

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
                fontSize: 8.5,
                textColor: COLORS.text,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: COLORS.grayLight
            },
            columnStyles: {
                0: {
                    cellWidth: 35,
                    fontStyle: 'bold',
                    fillColor: COLORS.primaryLight,
                    textColor: COLORS.primaryDark,
                    halign: 'left'
                },
                1: {
                    cellWidth: 145,
                    halign: 'left'
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
