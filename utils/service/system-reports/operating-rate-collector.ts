import { dbPool } from "@/utils/dbUtil";
import {
    OperatingRateReportData,
    ControllerOperatingData,
    DailyOperatingData,
    SystemStateAnalysis,
    CriticalEventSummary
} from "@/types/operating-rate-report.types";
import { LogEntry } from "@/types/log-content.types";
import fs from "fs";
import path from "path";


export async function collectOperatingRateReportData(): Promise<OperatingRateReportData> {
    const client = await dbPool.connect();

    try {

        const controllersQuery = `
      SELECT 
        c.id, 
        c.name, 
        c.ip_address 
      FROM controller c
      LEFT JOIN controller_status ct ON c.id = ct.controller_id
      ORDER BY c.name
    `;

        const controllersResult = await client.query(controllersQuery);
        const controllers = controllersResult.rows;


        if (controllers.length === 0) {
            throw new Error("No controllers found");
        }


        const controllerData: ControllerOperatingData[] = [];

        for (const controller of controllers) {
            
            const displayName = controller.name || 
                               `Robot (${controller.ip_address || controller.id})`;
            
            const operatingAnalysis = await analyzeControllerOperatingRate(controller);

            if (operatingAnalysis) {
                controllerData.push({
                    id: controller.id,
                    name: displayName,
                    ip_address: controller.ip_address,
                    operating_analysis: operatingAnalysis
                });
            } else {
            }
        }
        


        const summary = calculateOperatingRateSummary(controllerData);

        return {
            metadata: {
                title: "7-Day Operating Rate Analysis Report",
                generated_at: new Date().toISOString(),
                period: "Last 7 Days",
                total_controllers: controllers.length
            },
            controllers: controllerData,
            summary
        };

    } catch (error) {


        try {
            const fallbackQuery = `
        SELECT 
          c.id, 
          c.name, 
          c.ip_address 
        FROM controller c
        ORDER BY c.name
      `;

            const fallbackResult = await client.query(fallbackQuery);


            return {
                metadata: {
                    title: "7-Day Operating Rate Analysis Report",
                    generated_at: new Date().toISOString(),
                    period: "Last 7 Days",
                    total_controllers: fallbackResult.rows.length || 0
                },
                controllers: [],
                summary: {
                    overall_operating_rate: 0,
                    total_log_entries: 0,
                    total_critical_events: 0,
                    most_efficient_controller: "N/A - No Data Available",
                    least_efficient_controller: "N/A - No Data Available",
                    average_daily_operating_rate: 0
                }
            };
        } catch (fallbackError) {

            // Return empty but valid structure
            return {
                metadata: {
                    title: "7-Day Operating Rate Analysis Report",
                    generated_at: new Date().toISOString(),
                    period: "Last 7 Days",
                    total_controllers: 0
                },
                controllers: [],
                summary: {
                    overall_operating_rate: 0,
                    total_log_entries: 0,
                    total_critical_events: 0,
                    most_efficient_controller: "N/A - No Data Available",
                    least_efficient_controller: "N/A - No Data Available",
                    average_daily_operating_rate: 0
                }
            };
        }
    } finally {
        client.release();
    }
}


async function analyzeControllerOperatingRate(controller: any) {
    try {
        const logEntries = await readLogDataFile(controller.ip_address);

        if (logEntries.length === 0) {
            return null;
        }


        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEntries = logEntries.filter(entry => {
            if (!entry.date) return false;
            const entryDate = parseLogDate(entry.date);
            return entryDate && entryDate >= sevenDaysAgo;
        });

        if (recentEntries.length === 0) {
            return null;
        }


        const dailyBreakdown = calculateDailyOperatingData(recentEntries);


        const systemStates = analyzeSystemStates(recentEntries);


        const criticalEvents = analyzeCriticalEvents(recentEntries);


        const operatingEntries = recentEntries.filter(entry =>
            isOperatingState(entry)
        ).length;

        const operatingRate = (operatingEntries / recentEntries.length) * 100;


        const performanceTrend = calculatePerformanceTrend(dailyBreakdown);

        return {
            total_log_entries: recentEntries.length,
            operating_rate_percentage: Math.round(operatingRate * 100) / 100,
            daily_breakdown: dailyBreakdown,
            system_states: systemStates,
            critical_events: criticalEvents,
            performance_trend: performanceTrend
        };

    } catch (error) {
        return null;
    }
}


async function readLogDataFile(ipAddress: string): Promise<LogEntry[]> {
    try {
        const fileName = "LOGDATA.DAT";
        const folderName = `${ipAddress}_LOGDATA`;

        // Try multiple possible paths
        const possiblePaths = [
            // Windows paths
            path.join("C:", "Watchlog", "UI", folderName, fileName),
            path.join("C:", "WatchLog", folderName, fileName),
            // Mac/Linux paths
            path.join(process.env.HOME || "/tmp", "Watchlog", "UI", folderName, fileName),
            path.join(process.env.HOME || "/tmp", "WatchLog", folderName, fileName),
            path.join("/tmp", "Watchlog", "UI", folderName, fileName),
            // Current directory paths
            path.join(process.cwd(), "Watchlog", "UI", folderName, fileName),
            path.join(process.cwd(), "watchlog", folderName, fileName),
        ];

        // Try each path
        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, "utf-8");
                return parseLogContent(fileContent);
            }
        }

        return [];
    } catch (error) {
        return [];
    }
}


function parseLogContent(content: string): LogEntry[] {
    const entries: LogEntry[] = [];
    const lines = content.split("\n");

    let currentEntry: Partial<LogEntry> = {};
    let entryLines: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("///INDEX")) {
            if (currentEntry.index !== undefined) {
                entries.push({
                    index: currentEntry.index,
                    date: currentEntry.date,
                    event: currentEntry.event,
                    loginName: currentEntry.loginName,
                    fields: currentEntry.fields || {},
                    rawData: entryLines.join("\n"),
                });

                if (entries.length >= 1000) {
                    break;
                }
            }

            currentEntry = { fields: {} };
            entryLines = [line];

            const indexMatch = trimmedLine.match(/\/\/\/INDEX\s+(\d+)/);
            if (indexMatch) {
                currentEntry.index = parseInt(indexMatch[1]);
            }
        } else if (trimmedLine.includes(":")) {
            const colonIndex = trimmedLine.indexOf(":");
            const key = trimmedLine.substring(0, colonIndex).trim();
            const value = trimmedLine.substring(colonIndex + 1).trim();

            if (key === "DATE") {
                currentEntry.date = value;
            } else if (key === "EVENT") {
                currentEntry.event = value;
            } else if (key === "LOGIN NAME") {
                currentEntry.loginName = value;
            } else {
                if (!currentEntry.fields) currentEntry.fields = {};
                currentEntry.fields[key] = value;
            }
        }

        entryLines.push(line);
    }

    return entries;
}


function parseLogDate(dateStr: string): Date | null {
    try {

        const cleanDate = dateStr.replace(/[^\d\-\s:]/g, '').trim();
        return new Date(cleanDate);
    } catch {
        return null;
    }
}


function isOperatingState(entry: LogEntry): boolean {
    const event = entry.event?.toLowerCase() || '';
    const fields = entry.fields || {};



    const errorKeywords = ['error', 'alarm', 'fault', 'emergency'];
    const operatingKeywords = ['play', 'run', 'cycle', 'production', 'auto'];

    const hasError = errorKeywords.some(keyword => event.includes(keyword));
    const hasOperating = operatingKeywords.some(keyword => event.includes(keyword));


    const mode = fields['MODE'] || fields['ROBOT MODE'] || '';
    const isTeachMode = mode.toLowerCase().includes('teach');

    return !hasError && (hasOperating || (!isTeachMode && event.length > 0));
}


function calculateDailyOperatingData(entries: LogEntry[]): DailyOperatingData[] {
    const dailyData: { [date: string]: LogEntry[] } = {};


    entries.forEach(entry => {
        if (!entry.date) return;

        const entryDate = parseLogDate(entry.date);
        if (!entryDate) return;

        const dateKey = entryDate.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = [];
        }
        dailyData[dateKey].push(entry);
    });


    return Object.entries(dailyData)
        .map(([date, dayEntries]) => {
            const operatingEntries = dayEntries.filter(isOperatingState);
            const teachEntries = dayEntries.filter(entry =>
                entry.event?.toLowerCase().includes('teach') ||
                entry.fields?.['MODE']?.toLowerCase().includes('teach')
            );
            const errorEntries = dayEntries.filter(entry =>
                entry.event?.toLowerCase().includes('error') ||
                entry.event?.toLowerCase().includes('alarm')
            );
            const criticalEntries = dayEntries.filter(entry =>
                isCriticalEvent(entry)
            );

            const total = dayEntries.length;
            const operating = operatingEntries.length;
            const teach = teachEntries.length;
            const error = errorEntries.length;
            const idle = total - operating - teach - error;

            return {
                date,
                total_entries: total,
                operating_entries: operating,
                operating_rate: total > 0 ? (operating / total) * 100 : 0,
                teach_time_percentage: total > 0 ? (teach / total) * 100 : 0,
                play_time_percentage: total > 0 ? (operating / total) * 100 : 0,
                error_time_percentage: total > 0 ? (error / total) * 100 : 0,
                idle_time_percentage: total > 0 ? (idle / total) * 100 : 0,
                critical_events_count: criticalEntries.length
            };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
}


function analyzeSystemStates(entries: LogEntry[]): SystemStateAnalysis {
    const teachEntries = entries.filter(entry =>
        entry.event?.toLowerCase().includes('teach') ||
        entry.fields?.['MODE']?.toLowerCase().includes('teach')
    );

    const playEntries = entries.filter(entry =>
        entry.event?.toLowerCase().includes('play') ||
        entry.event?.toLowerCase().includes('run') ||
        isOperatingState(entry)
    );

    const errorEntries = entries.filter(entry =>
        entry.event?.toLowerCase().includes('error') ||
        entry.event?.toLowerCase().includes('alarm') ||
        entry.event?.toLowerCase().includes('fault')
    );

    const idleEntries = entries.filter(entry =>
        !teachEntries.includes(entry) &&
        !playEntries.includes(entry) &&
        !errorEntries.includes(entry)
    );

    const total = entries.length;


    const errorCounts: { [error: string]: number } = {};
    errorEntries.forEach(entry => {
        const error = entry.event || 'Unknown Error';
        errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

    const topErrors = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([error]) => error);

    return {
        teach_mode: {
            count: teachEntries.length,
            percentage: total > 0 ? (teachEntries.length / total) * 100 : 0,
            average_duration_minutes: 5
        },
        play_mode: {
            count: playEntries.length,
            percentage: total > 0 ? (playEntries.length / total) * 100 : 0,
            average_duration_minutes: 10
        },
        error_state: {
            count: errorEntries.length,
            percentage: total > 0 ? (errorEntries.length / total) * 100 : 0,
            most_common_errors: topErrors
        },
        idle_state: {
            count: idleEntries.length,
            percentage: total > 0 ? (idleEntries.length / total) * 100 : 0
        }
    };
}


function isCriticalEvent(entry: LogEntry): boolean {
    const event = entry.event?.toLowerCase() || '';
    const criticalKeywords = [
        'emergency', 'fault', 'critical', 'severe', 'fatal',
        'collision', 'overload', 'temperature', 'pressure'
    ];

    return criticalKeywords.some(keyword => event.includes(keyword));
}


function analyzeCriticalEvents(entries: LogEntry[]): CriticalEventSummary {
    const criticalEntries = entries.filter(isCriticalEvent);


    const eventCounts: { [event: string]: number } = {};
    criticalEntries.forEach(entry => {
        const event = entry.event || 'Unknown';
        eventCounts[event] = (eventCounts[event] || 0) + 1;
    });

    const topCriticalEvents = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([event, count]) => ({
            event_type: event,
            count,
            impact_on_operating_rate: Math.min(count * 2, 15) // Simplified impact calculation
        }));


    const recentCritical = criticalEntries
        .slice(0, 10)
        .map(entry => ({
            date: entry.date || 'Unknown',
            event: entry.event || 'Unknown',
            impact: (entry.event?.toLowerCase().includes('emergency') ||
                entry.event?.toLowerCase().includes('critical')) ? 'High' as const :
                entry.event?.toLowerCase().includes('fault') ? 'Medium' as const : 'Low' as const
        }));

    return {
        total_count: criticalEntries.length,
        events_per_day: criticalEntries.length / 7,
        top_critical_events: topCriticalEvents,
        recent_critical_events: recentCritical
    };
}


function calculatePerformanceTrend(dailyData: DailyOperatingData[]): number {
    if (dailyData.length < 2) return 0;

    const firstDay = dailyData[0];
    const lastDay = dailyData[dailyData.length - 1];

    if (firstDay.operating_rate === 0) return 0;

    return ((lastDay.operating_rate - firstDay.operating_rate) / firstDay.operating_rate) * 100;
}


function calculateOperatingRateSummary(controllerData: ControllerOperatingData[]) {
    if (controllerData.length === 0) {
        return {
            overall_operating_rate: 0,
            total_log_entries: 0,
            total_critical_events: 0,
            most_efficient_controller: "N/A",
            least_efficient_controller: "N/A",
            average_daily_operating_rate: 0
        };
    }

    const totalLogEntries = controllerData.reduce(
        (sum, controller) => sum + controller.operating_analysis.total_log_entries, 0
    );

    const totalCriticalEvents = controllerData.reduce(
        (sum, controller) => sum + controller.operating_analysis.critical_events.total_count, 0
    );

    const averageOperatingRate = controllerData.reduce(
        (sum, controller) => sum + controller.operating_analysis.operating_rate_percentage, 0
    ) / controllerData.length;


    const mostEfficient = controllerData.reduce((best, controller) =>
        controller.operating_analysis.operating_rate_percentage > best.operating_analysis.operating_rate_percentage
            ? controller : best
    );

    const leastEfficient = controllerData.reduce((worst, controller) =>
        controller.operating_analysis.operating_rate_percentage < worst.operating_analysis.operating_rate_percentage
            ? controller : worst
    );

    return {
        overall_operating_rate: Math.round(averageOperatingRate * 100) / 100,
        total_log_entries: totalLogEntries,
        total_critical_events: totalCriticalEvents,
        most_efficient_controller: mostEfficient.name,
        least_efficient_controller: leastEfficient.name,
        average_daily_operating_rate: Math.round(averageOperatingRate * 100) / 100
    };
}
