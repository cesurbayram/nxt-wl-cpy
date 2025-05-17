import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(request: NextRequest) {
  try {
    const jobDbResp = await dbPool.query(`
      SELECT 
        id, 
        name
      FROM job_select
      ORDER BY created_at DESC
    `);

    // Doğrudan veritabanında bulunan job'ları döndür
    return NextResponse.json(jobDbResp.rows, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);

    // Hata durumunda boş array döndür
    return NextResponse.json([], { status: 200 });
  }
}
