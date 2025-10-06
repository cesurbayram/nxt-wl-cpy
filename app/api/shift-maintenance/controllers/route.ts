import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs";
import path from "path";
import { parseSystemFile } from "@/utils/common/parse-system-file";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await dbPool.query(`
      SELECT 
        c.id,
        c.name,
        c.model,
        c.ip_address,
        u.servo_power_time
      FROM controller c
      LEFT JOIN (
        SELECT 
          controller_id,
          servo_power_time,
          ROW_NUMBER() OVER (PARTITION BY controller_id ORDER BY created_at DESC) as rn
        FROM utilization_data
      ) u ON c.id = u.controller_id AND u.rn = 1
      ORDER BY c.name
    `);

    // Add robot_model from system.sys files
    const controllersWithRobotModel = result.rows.map((controller) => {
      let robot_model = null;

      try {
        const systemInfoDir = path.join(
          "C:",
          "Watchlog",
          "UI",
          `${controller.ip_address}_SYSTEM`
        );

        if (fs.existsSync(systemInfoDir)) {
          const files = fs.readdirSync(systemInfoDir);
          const systemFiles = files.filter(
            (file) =>
              file.toUpperCase().includes("SYSTEM") &&
              (file.endsWith(".SYS") || file.endsWith(".sys"))
          );

          if (systemFiles.length > 0) {
            const latestFile = systemFiles
              .map((fileName) => {
                const filePath = path.join(systemInfoDir, fileName);
                const stats = fs.statSync(filePath);
                return { fileName, filePath, mtime: stats.mtime };
              })
              .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];

            const content = fs.readFileSync(latestFile.filePath, "utf8");
            const parsedInfo = parseSystemFile(content);
            robot_model = parsedInfo.robotModel || null;
          }
        }
      } catch (error) {
        console.error(
          `Error reading system.sys for controller ${controller.id}:`,
          error
        );
      }

      return {
        id: controller.id,
        name: controller.name,
        model: controller.model,
        robot_model,
        servo_power_time: controller.servo_power_time,
      };
    });

    return NextResponse.json(controllersWithRobotModel);
  } catch (error) {
    console.error("Error fetching controllers for maintenance:", error);
    return NextResponse.json(
      { error: "Failed to fetch controllers" },
      { status: 500 }
    );
  }
}
