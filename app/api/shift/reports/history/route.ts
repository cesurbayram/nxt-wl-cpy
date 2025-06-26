import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "system_user";
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const format = searchParams.get("format");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT 
        gr.id,
        gr.user_id,
        gr.report_type_id,
        gr.report_name,
        gr.parameters,
        gr.file_path,
        gr.format,
        gr.status,
        gr.created_at,
        rt.name as report_type_name,
        rt.description as report_type_description,
        c.name as category_name,
        c.icon as category_icon
      FROM generated_reports gr
      LEFT JOIN report_types rt ON gr.report_type_id = rt.id
      LEFT JOIN report_categories c ON rt.category_id = c.id
      WHERE gr.user_id = $1
    `;

    const queryParams = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND gr.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (gr.report_name ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (format) {
      query += ` AND gr.format = $${paramIndex}`;
      queryParams.push(format.toLowerCase());
      paramIndex++;
    }

    query += ` ORDER BY 
      CASE gr.status 
        WHEN 'processing' THEN 1
        WHEN 'pending' THEN 2  
        WHEN 'completed' THEN 3
        WHEN 'failed' THEN 4
        ELSE 5
      END,
      gr.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit.toString(), offset.toString());

    const result = await dbPool.query(query, queryParams);

    const filteredReports = result.rows.filter((report) => {
      if (report.file_path && !fs.existsSync(report.file_path)) {
        dbPool
          .query("DELETE FROM generated_reports WHERE id = $1", [report.id])
          .catch((err) =>
            console.error("Error deleting orphaned report:", err)
          );
        return false;
      }
      return true;
    });

    let countQuery = `
      SELECT COUNT(*) as total
      FROM generated_reports gr
      LEFT JOIN report_types rt ON gr.report_type_id = rt.id
      LEFT JOIN report_categories c ON rt.category_id = c.id
      WHERE gr.user_id = $1
    `;
    const countParams = [userId];
    let countParamIndex = 2;

    if (status) {
      countQuery += ` AND gr.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (gr.report_name ILIKE $${countParamIndex} OR c.name ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (format) {
      countQuery += ` AND gr.format = $${countParamIndex}`;
      countParams.push(format.toLowerCase());
      countParamIndex++;
    }

    const countResult = await dbPool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json(
      {
        reports: filteredReports,
        total: total,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: page * pageSize < total,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching report history:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { report_id } = await request.json();

    if (!report_id) {
      return NextResponse.json(
        { message: "Report ID is required" },
        { status: 400 }
      );
    }

    const reportResult = await dbPool.query(
      `SELECT file_path FROM generated_reports WHERE id = $1`,
      [report_id]
    );

    if (reportResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    await dbPool.query(`DELETE FROM generated_reports WHERE id = $1`, [
      report_id,
    ]);

    const filePath = reportResult.rows[0].file_path;
    if (filePath) {
    }

    return NextResponse.json(
      {
        message: "Report deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting report:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
