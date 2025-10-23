import { dbPool } from "@/utils/dbUtil";
import {
    UtilizationReportData,
    ControllerUtilizationData,
    DailyUtilizationData
} from "@/types/utilization-report.types";


export async function collectUtilizationReportData(): Promise<UtilizationReportData> {
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


        const controllerData: ControllerUtilizationData[] = [];

        for (const controller of controllers) {
            // Create proper display name
            const displayName = controller.name || 
                               `Robot (${controller.ip_address || controller.id})`;
            
            const dailyData = await collectControllerDailyData(client, controller.id);

            if (dailyData.length > 0) {
                const totals = calculateControllerTotals(dailyData);

                controllerData.push({
                    id: controller.id,
                    name: displayName,
                    ip_address: controller.ip_address,
                    daily_data: dailyData,
                    totals
                });
            } else {
            }
        }
        


        const summary = calculateSummaryStatistics(controllerData);


        return {
            metadata: {
                title: "7-Day Robot Utilization Report",
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
                    title: "7-Day Robot Utilization Report",
                    generated_at: new Date().toISOString(),
                    period: "Last 7 Days",
                    total_controllers: fallbackResult.rows.length || 0
                },
                controllers: [],
                summary: {
                    total_operating_hours: 0,
                    average_daily_hours: 0,
                    most_efficient_controller: "N/A - No Data Available",
                    least_efficient_controller: "N/A - No Data Available",
                    total_efficiency_percentage: 0
                }
            };
        } catch (fallbackError) {

            // Return empty but valid structure
            return {
                metadata: {
                    title: "7-Day Robot Utilization Report",
                    generated_at: new Date().toISOString(),
                    period: "Last 7 Days",
                    total_controllers: 0
                },
                controllers: [],
                summary: {
                    total_operating_hours: 0,
                    average_daily_hours: 0,
                    most_efficient_controller: "N/A - No Data Available",
                    least_efficient_controller: "N/A - No Data Available",
                    total_efficiency_percentage: 0
                }
            };
        }
    } finally {
        client.release();
    }
}


async function collectControllerDailyData(
    client: any,
    controllerId: string
): Promise<DailyUtilizationData[]> {
    try {
        // Check if utilization_data table exists
        const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'utilization_data'
      );
    `;

        const tableExists = await client.query(tableCheckQuery);

        if (!tableExists.rows[0]?.exists) {
            return [];
        }

        const query = `
      SELECT 
        DATE(timestamp) as date,
        AVG(operating_time) as avg_operating_time,
        AVG(servo_power_time) as avg_servo_power_time,
        AVG(playback_time) as avg_playback_time,
        AVG(moving_time) as avg_moving_time,
        COUNT(*) as data_points
      FROM utilization_data 
      WHERE controller_id = $1 
        AND timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;

        const result = await client.query(query, [controllerId]);
        const dailyData: DailyUtilizationData[] = [];

        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows[i];
            const operatingHours = parseFloat(row.avg_operating_time) / 3600;
            const servoHours = parseFloat(row.avg_servo_power_time) / 3600;
            const playbackHours = parseFloat(row.avg_playback_time) / 3600;
            const movingHours = parseFloat(row.avg_moving_time) / 3600;


            const efficiencyPercentage = Math.min((operatingHours / 24) * 100, 100);


            let dayOverDayChange = 0;
            let dayOverDayPercentage = 0;

            if (i < result.rows.length - 1) {
                const previousDayHours = parseFloat(result.rows[i + 1].avg_operating_time) / 3600;
                dayOverDayChange = operatingHours - previousDayHours;
                dayOverDayPercentage = previousDayHours > 0
                    ? ((operatingHours - previousDayHours) / previousDayHours) * 100
                    : 0;
            }

            dailyData.push({
                date: row.date,
                operating_hours: Math.round(operatingHours * 100) / 100,
                servo_power_hours: Math.round(servoHours * 100) / 100,
                playback_hours: Math.round(playbackHours * 100) / 100,
                moving_hours: Math.round(movingHours * 100) / 100,
                efficiency_percentage: Math.round(efficiencyPercentage * 100) / 100,
                day_over_day_change: Math.round(dayOverDayChange * 100) / 100,
                day_over_day_percentage: Math.round(dayOverDayPercentage * 100) / 100
            });
        }

        return dailyData.reverse();
    } catch (error) {
        return [];
    }
}


function calculateControllerTotals(dailyData: DailyUtilizationData[]) {
    if (dailyData.length === 0) {
        return {
            total_operating_hours: 0,
            average_daily_hours: 0,
            efficiency_trend: 0,
            best_day: {} as DailyUtilizationData,
            worst_day: {} as DailyUtilizationData
        };
    }

    const totalHours = dailyData.reduce((sum, day) => sum + day.operating_hours, 0);
    const averageHours = totalHours / dailyData.length;


    const firstDay = dailyData[0];
    const lastDay = dailyData[dailyData.length - 1];
    const efficiencyTrend = firstDay.operating_hours > 0
        ? ((lastDay.operating_hours - firstDay.operating_hours) / firstDay.operating_hours) * 100
        : 0;


    const bestDay = dailyData.reduce((best, day) =>
        day.operating_hours > best.operating_hours ? day : best
    );

    const worstDay = dailyData.reduce((worst, day) =>
        day.operating_hours < worst.operating_hours ? day : worst
    );

    return {
        total_operating_hours: Math.round(totalHours * 100) / 100,
        average_daily_hours: Math.round(averageHours * 100) / 100,
        efficiency_trend: Math.round(efficiencyTrend * 100) / 100,
        best_day: bestDay,
        worst_day: worstDay
    };
}


function calculateSummaryStatistics(controllerData: ControllerUtilizationData[]) {
    if (controllerData.length === 0) {
        return {
            total_operating_hours: 0,
            average_daily_hours: 0,
            most_efficient_controller: "N/A",
            least_efficient_controller: "N/A",
            total_efficiency_percentage: 0
        };
    }

    const totalOperatingHours = controllerData.reduce(
        (sum, controller) => sum + controller.totals.total_operating_hours, 0
    );

    const averageDailyHours = controllerData.reduce(
        (sum, controller) => sum + controller.totals.average_daily_hours, 0
    ) / controllerData.length;


    const mostEfficient = controllerData.reduce((best, controller) =>
        controller.totals.average_daily_hours > best.totals.average_daily_hours ? controller : best
    );

    const leastEfficient = controllerData.reduce((worst, controller) =>
        controller.totals.average_daily_hours < worst.totals.average_daily_hours ? controller : worst
    );


    const totalPossibleHours = controllerData.length * 7 * 24;
    const totalEfficiencyPercentage = (totalOperatingHours / totalPossibleHours) * 100;

    return {
        total_operating_hours: Math.round(totalOperatingHours * 100) / 100,
        average_daily_hours: Math.round(averageDailyHours * 100) / 100,
        most_efficient_controller: mostEfficient.name,
        least_efficient_controller: leastEfficient.name,
        total_efficiency_percentage: Math.round(totalEfficiencyPercentage * 100) / 100
    };
}
