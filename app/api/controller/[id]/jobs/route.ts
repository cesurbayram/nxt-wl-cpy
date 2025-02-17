// app/api/controller/[id]/jobs/route.ts
import { NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();
  try {
    const result = await client.query(
      `
        SELECT 
          id,
          controller_id,
          job_name,
          current_line,
          job_content,
          created_at
        FROM jobs 
        WHERE controller_id = $1 
        ORDER BY created_at DESC
      `,
      [params.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return NextResponse.json({ error: "Jobs getirilemedi" }, { status: 500 });
  } finally {
    client.release();
  }
}
