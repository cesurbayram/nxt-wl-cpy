import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    const countResult = await dbPool.query(
      "SELECT COUNT(*) as count FROM report_types"
    );

    if (parseInt(countResult.rows[0].count) === 0) {
      const robotReportTypes = [
        {
          id: "system-all-data",
          category_id: "system-report",
          name: "All System Data",
          description:
            "Controller, alarm, backup, utilization and teaching data",
          data_sources: JSON.stringify([
            {
              id: "controller",
              name: "Controller Info",
              table: "controller",
              required: true,
              fields: [
                "id",
                "name",
                "model",
                "location",
                "ip_address",
                "application",
                "status",
              ],
            },
            {
              id: "alarm",
              name: "Alarms",
              table: "alarm",
              required: false,
              fields: [
                "id",
                "controller_id",
                "code",
                "text",
                "detected",
                "removed",
                "origin_date",
              ],
            },
            {
              id: "backup_files",
              name: "Backup Files",
              table: "backup_files",
              required: false,
              fields: [
                "id",
                "controller_id",
                "file_name",
                "file_type",
                "created_at",
              ],
            },
            {
              id: "utilization",
              name: "Utilization",
              table: "utilization",
              required: false,
              fields: [
                "id",
                "controller_id",
                "servo_power_time",
                "controller_power_time",
                "idle_time",
                "running_time",
                "recorded_at",
              ],
            },
            {
              id: "job",
              name: "Jobs/Teaching",
              table: "job",
              required: false,
              fields: [
                "id",
                "controller_id",
                "job_name",
                "last_modified",
                "created_at",
              ],
            },
          ]),
          filters: JSON.stringify([
            {
              id: "date_range",
              name: "Date Range",
              type: "date_range",
              required: false,
            },
            {
              id: "controller_select",
              name: "Controllers",
              type: "controller_select",
              required: true,
            },
            {
              id: "data_sections",
              name: "Included Sections",
              type: "checkbox_group",
              required: false,
              options: [
                "controller_info",
                "alarm_data",
                "backup_data",
                "utilization_data",
                "job_data",
              ],
            },
          ]),
        },

        // MAINTENANCE REPORTS
        {
          id: "maintenance-all-data",
          category_id: "maintenance-report",
          name: "All Maintenance Data",
          description:
            "Controller, completed maintenance and planned maintenance data",
          data_sources: JSON.stringify([
            {
              id: "controller",
              name: "Controller Info",
              table: "controller",
              required: true,
              fields: ["id", "name", "model", "location", "status"],
            },
            {
              id: "maintenance_log",
              name: "Completed Maintenance",
              table: "maintenance_log",
              required: false,
              fields: [
                "id",
                "controller_id",
                "plan_id",
                "completed_date",
                "notes",
              ],
            },
            {
              id: "maintenance_plan",
              name: "Maintenance Plans",
              table: "maintenance_plan",
              required: false,
              fields: [
                "id",
                "controller_id",
                "plan_name",
                "description",
                "interval_hours",
              ],
            },
          ]),
          filters: JSON.stringify([
            {
              id: "date_range",
              name: "Date Range",
              type: "date_range",
              required: false,
            },
            {
              id: "controller_select",
              name: "Controllers",
              type: "controller_select",
              required: true,
            },
            {
              id: "data_sections",
              name: "Included Sections",
              type: "checkbox_group",
              required: false,
              options: [
                "controller_info",
                "completed_maintenance",
                "planned_maintenance",
              ],
            },
          ]),
        },

        {
          id: "production-all-data",
          category_id: "production-report",
          name: "All Production Data",
          description:
            "Controller, production values, shift and job performance data",
          data_sources: JSON.stringify([
            {
              id: "controller",
              name: "Controller Info",
              table: "controller",
              required: true,
              fields: ["id", "name", "model", "location", "status"],
            },
            {
              id: "production_value",
              name: "Production Values",
              table: "production_value",
              required: false,
              fields: [
                "id",
                "controller_id",
                "shift_id",
                "job_id",
                "manual_count",
                "system_count",
                "status",
                "date",
                "note",
              ],
            },
            {
              id: "shift",
              name: "Shifts",
              table: "shift",
              required: false,
              fields: ["id", "shift_name", "start_time", "end_time"],
            },
            {
              id: "job_select",
              name: "Jobs",
              table: "job_select",
              required: false,
              fields: ["id", "controller_id", "job_name"],
            },
          ]),
          filters: JSON.stringify([
            {
              id: "date_range",
              name: "Date Range",
              type: "date_range",
              required: false,
            },
            {
              id: "controller_select",
              name: "Controllers",
              type: "controller_select",
              required: true,
            },
            {
              id: "data_sections",
              name: "Included Sections",
              type: "checkbox_group",
              required: false,
              options: [
                "controller_info",
                "production_values",
                "shift_data",
                "job_data",
              ],
            },
          ]),
        },

        {
          id: "general-all-data",
          category_id: "general-report",
          name: "General System Summary",
          description: "Summary of all categories",
          data_sources: JSON.stringify([
            {
              id: "summary",
              name: "System Summary",
              table: "multiple",
              required: true,
              fields: [
                "controller_count",
                "alarm_count",
                "backup_count",
                "production_count",
              ],
            },
          ]),
          filters: JSON.stringify([
            {
              id: "date_range",
              name: "Date Range",
              type: "date_range",
              required: false,
            },
            {
              id: "controller_select",
              name: "Controller",
              type: "controller_select",
              required: false,
            },
          ]),
        },
      ];

      for (const type of robotReportTypes) {
        await dbPool.query(
          `INSERT INTO report_types (id, category_id, name, description, data_sources, filters)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            type.id,
            type.category_id,
            type.name,
            type.description,
            type.data_sources,
            type.filters,
          ]
        );
      }
    }

    let query = `
      SELECT 
        rt.id,
        rt.category_id,
        rt.name,
        rt.description,
        rt.data_sources,
        rt.filters,
        rt.created_at,
        c.name as category_name,
        c.description as category_description
      FROM report_types rt
      LEFT JOIN report_categories c ON rt.category_id = c.id
    `;

    const queryParams = [];
    if (categoryId) {
      query += " WHERE rt.category_id = $1";
      queryParams.push(categoryId);
    }

    query += " ORDER BY rt.name ASC";

    const result = await dbPool.query(query, queryParams);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching report types:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category_id, name, description, data_sources, filters } =
      await request.json();

    if (!category_id || !name) {
      return NextResponse.json(
        { message: "Category ID and name are required" },
        { status: 400 }
      );
    }

    const result = await dbPool.query(
      `INSERT INTO report_types (id, category_id, name, description, data_sources, filters)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        crypto.randomUUID(),
        category_id,
        name,
        description || null,
        JSON.stringify(data_sources || []),
        JSON.stringify(filters || []),
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating report type:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
