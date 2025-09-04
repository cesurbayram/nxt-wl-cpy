import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const client = await dbPool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const offset = (page - 1) * pageSize;

    const workOrdersResult = await client.query(
      `SELECT 
        wo.*,
        c.name as controller_name,
        c.ip_address as controller_ip
       FROM work_orders wo
       LEFT JOIN controller c ON wo.controller_id = c.id
       ORDER BY wo.created_date DESC
       LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );

    const countResult = await client.query(
      `SELECT COUNT(*) as total FROM work_orders`
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      {
        workOrders: workOrdersResult.rows,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Work orders fetch error:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const client = await dbPool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const workOrderId = searchParams.get("id");

    if (!workOrderId) {
      return NextResponse.json(
        { message: "Work Order ID is required" },
        { status: 400 }
      );
    }

    const checkResult = await client.query(
      `SELECT id FROM work_orders WHERE id = $1`,
      [workOrderId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Work order not found" },
        { status: 404 }
      );
    }

    await client.query(`DELETE FROM work_orders WHERE id = $1`, [workOrderId]);

    return NextResponse.json(
      { message: "Work order deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Work order delete error:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
