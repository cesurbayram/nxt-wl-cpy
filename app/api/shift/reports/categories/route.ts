import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const existingCategories = await dbPool.query(
      "SELECT COUNT(*) as count FROM report_categories"
    );

    if (existingCategories.rows[0].count == 0) {
      const robotCategories = [
        {
          id: "system-report",
          name: "System Report",
          description: "System status and technical data",
          icon: "settings",
        },
        {
          id: "maintenance-report",
          name: "Maintenance Report",
          description: "Planned and completed maintenance operations",
          icon: "wrench",
        },
        {
          id: "production-report",
          name: "Production Report",
          description: "Shift and production performance data",
          icon: "factory",
        },
        {
          id: "general-report",
          name: "General Report",
          description: "Summary of all categories",
          icon: "file-text",
        },
      ];

      for (const category of robotCategories) {
        await dbPool.query(
          `INSERT INTO report_categories (id, name, description, icon) 
             VALUES ($1, $2, $3, $4)`,
          [category.id, category.name, category.description, category.icon]
        );
      }
    }

    const result = await dbPool.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.created_at,
        COUNT(rt.id) as report_types_count
      FROM report_categories c
      LEFT JOIN report_types rt ON c.id = rt.category_id
      GROUP BY c.id, c.name, c.description, c.icon, c.created_at
      ORDER BY c.name ASC
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching report categories:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, icon } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const result = await dbPool.query(
      `INSERT INTO report_categories (id, name, description, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [crypto.randomUUID(), name, description || null, icon || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating report category:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
