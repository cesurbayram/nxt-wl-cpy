import { dbPool } from "@/utils/dbUtil";
import {
    AlarmReportData,
    ControllerAlarmData,
    AlarmEntry,
    AlarmDetails,
    AlarmCodeMapping
} from "@/types/alarm-report.types";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";


export async function collectAlarmReportData(): Promise<AlarmReportData> {
    const client = await dbPool.connect();

    try {

        const controllersQuery = `
      SELECT 
        c.id, 
        c.name, 
        c.ip_address,
        c.model
      FROM controller c
      INNER JOIN controller_status ct ON c.id = ct.controller_id
      ORDER BY c.name
    `;

        const controllersResult = await client.query(controllersQuery);
        const controllers = controllersResult.rows;

        if (controllers.length === 0) {
            throw new Error("No controllers found with status");
        }


        const alarmMappings = await loadAlarmDetailMappings();


        const controllerData: ControllerAlarmData[] = [];

        for (const controller of controllers) {
            const alarmData = await collectControllerAlarmData(client, controller, alarmMappings);

            if (alarmData) {
                controllerData.push(alarmData);
            }
        }


        const summary = calculateAlarmSummary(controllerData);

        return {
            metadata: {
                title: "Robot Alarm Analysis Report",
                generated_at: new Date().toISOString(),
                period: "Recent Alarms (Last 5 per Robot)",
                total_controllers: controllers.length
            },
            controllers: controllerData,
            summary
        };

    } catch (error) {
        console.error("Error collecting alarm report data:", error);


        try {
            const fallbackQuery = `
        SELECT 
          c.id, 
          c.name, 
          c.ip_address,
          c.model
        FROM controller c
        ORDER BY c.name
      `;

            const fallbackResult = await client.query(fallbackQuery);

            if (fallbackResult.rows.length > 0) {
                return {
                    metadata: {
                        title: "Robot Alarm Analysis Report",
                        generated_at: new Date().toISOString(),
                        period: "Recent Alarms (Last 5 per Robot)",
                        total_controllers: fallbackResult.rows.length
                    },
                    controllers: [],
                    summary: {
                        total_alarms: 0,
                        critical_alarms: 0,
                        most_problematic_controller: "N/A",
                        most_common_alarm_code: "N/A",
                        average_alarms_per_controller: 0
                    }
                };
            }
        } catch (fallbackError) {
            console.error("Fallback query also failed:", fallbackError);
        }

        throw error;
    } finally {
        client.release();
    }
}


async function collectControllerAlarmData(
    client: any,
    controller: any,
    alarmMappings: { [model: string]: AlarmCodeMapping }
): Promise<ControllerAlarmData | null> {
    try {

        const alarmsQuery = `
      SELECT 
        code, 
        name, 
        origin_date,
        mode, 
        type
      FROM almhist 
      WHERE controller_id = $1 
      ORDER BY origin_date DESC 
      LIMIT 5
    `;

        const alarmsResult = await client.query(alarmsQuery, [controller.id]);
        const alarms = alarmsResult.rows;


        const controllerModel = controller.model || 'YRC1000';
        const modelMappings = alarmMappings[controllerModel] || alarmMappings['YRC1000'] || {};


        const enrichedAlarms: AlarmEntry[] = alarms.map((alarm: any) => ({
            code: alarm.code,
            name: alarm.name,
            origin_date: alarm.origin_date,
            mode: alarm.mode,
            type: alarm.type,
            details: getAlarmDetails(alarm.code, modelMappings)
        }));


        const alarmSummary = {
            total_count: alarms.length,
            critical_count: alarms.filter((a: any) => a.type === 'MAJOR').length,
            most_frequent_code: getMostFrequentAlarmCode(alarms),
            last_alarm_date: alarms.length > 0 ? alarms[0].origin_date : 'N/A'
        };

        return {
            id: controller.id,
            name: controller.name,
            ip_address: controller.ip_address,
            model: controllerModel,
            recent_alarms: enrichedAlarms,
            alarm_summary: alarmSummary
        };

    } catch (error) {
        console.error(`Error collecting alarm data for controller ${controller.name}:`, error);
        return null;
    }
}


async function loadAlarmDetailMappings(): Promise<{ [model: string]: AlarmCodeMapping }> {
    const mappings: { [model: string]: AlarmCodeMapping } = {};

    try {
        const alarmDetailsPath = path.join(process.cwd(), 'data', 'alarm-details');

        if (!fs.existsSync(alarmDetailsPath)) {
            console.warn('Alarm details directory not found:', alarmDetailsPath);
            return mappings;
        }

        const modelDirs = fs.readdirSync(alarmDetailsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const modelDir of modelDirs) {
            const modelPath = path.join(alarmDetailsPath, modelDir);
            const modelMapping: AlarmCodeMapping = {};

            try {
                const csvFiles = fs.readdirSync(modelPath)
                    .filter(file => file.endsWith('.csv'));

                for (const csvFile of csvFiles) {
                    const csvPath = path.join(modelPath, csvFile);
                    const csvContent = fs.readFileSync(csvPath, 'utf-8');


                    const records = parse(csvContent, {
                        columns: true,
                        skip_empty_lines: true,
                        trim: true,
                        from_line: 4
                    });

                    records.forEach((record: any) => {
                        const alarmNumber = record['Alarm Number'];
                        if (alarmNumber && alarmNumber !== '') {
                            modelMapping[alarmNumber] = {
                                alarm_number: alarmNumber,
                                alarm_name: record['Alarm Name'] || record['Alarm Name/Message'] || '',
                                contents: record['Contents'] || '',
                                sub_code: record['Sub Code'] || '',
                                meaning: record['Meaning'] || '',
                                cause: record['Cause'] || '',
                                remedy: record['Remedy'] || '',
                                notes: record['Notes'] || ''
                            };
                        }
                    });
                }

                mappings[modelDir] = modelMapping;
                console.log(`Loaded ${Object.keys(modelMapping).length} alarm definitions for ${modelDir}`);
            } catch (error) {
                console.error(`Error loading alarm details for ${modelDir}:`, error);
            }
        }

    } catch (error) {
        console.error('Error loading alarm detail mappings:', error);
    }

    return mappings;
}


function getAlarmDetails(code: string, mappings: AlarmCodeMapping): AlarmDetails {
    const details = mappings[code];

    if (details) {
        return details;
    }


    return {
        alarm_number: code,
        alarm_name: 'Unknown Alarm',
        contents: 'Alarm details not available in database',
        sub_code: '',
        meaning: 'Please refer to robot manual',
        cause: 'Unknown cause',
        remedy: 'Contact technical support',
        notes: ''
    };
}


function getMostFrequentAlarmCode(alarms: any[]): string {
    if (alarms.length === 0) return 'N/A';

    const codeCounts: { [code: string]: number } = {};

    alarms.forEach((alarm: any) => {
        const code = alarm.code;
        codeCounts[code] = (codeCounts[code] || 0) + 1;
    });

    const mostFrequent = Object.entries(codeCounts)
        .sort((a, b) => b[1] - a[1])[0];

    return mostFrequent ? mostFrequent[0] : 'N/A';
}


function calculateAlarmSummary(controllerData: ControllerAlarmData[]) {
    if (controllerData.length === 0) {
        return {
            total_alarms: 0,
            critical_alarms: 0,
            most_problematic_controller: "N/A",
            most_common_alarm_code: "N/A",
            average_alarms_per_controller: 0
        };
    }

    const totalAlarms = controllerData.reduce(
        (sum, controller) => sum + controller.alarm_summary.total_count, 0
    );

    const criticalAlarms = controllerData.reduce(
        (sum, controller) => sum + controller.alarm_summary.critical_count, 0
    );


    const mostProblematic = controllerData.reduce((worst, controller) =>
        controller.alarm_summary.total_count > worst.alarm_summary.total_count
            ? controller : worst
    );


    const allCodes: { [code: string]: number } = {};
    controllerData.forEach(controller => {
        controller.recent_alarms.forEach(alarm => {
            allCodes[alarm.code] = (allCodes[alarm.code] || 0) + 1;
        });
    });

    const mostCommonCode = Object.entries(allCodes)
        .sort((a, b) => b[1] - a[1])[0];

    return {
        total_alarms: totalAlarms,
        critical_alarms: criticalAlarms,
        most_problematic_controller: mostProblematic.name,
        most_common_alarm_code: mostCommonCode ? mostCommonCode[0] : "N/A",
        average_alarms_per_controller: Math.round((totalAlarms / controllerData.length) * 100) / 100
    };
}

