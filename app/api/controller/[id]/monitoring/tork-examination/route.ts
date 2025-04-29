import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { TorkExaminationData } from "@/types/tork-examination.types";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const controllerId = params.id;
    const body = await request.json();

    const { duration, jobId, manualSignals } = body;

    const sessionId = uuidv4();

    const insertSessionQuery = `
      INSERT INTO tork_examination_sessions (
        id, 
        start_date, 
        start_time, 
        duration, 
        end_date, 
        end_time, 
        job_id, 
        controller_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0].substring(0, 5);

    await client.query(insertSessionQuery, [
      sessionId,
      today,
      currentTime,
      duration || 5,
      today,
      currentTime,
      jobId || null,
      controllerId,
    ]);

    const fullQuery = `
      SELECT 
        ted.id,
        ted.timestamp,
        ted.session_id,
        ted."S",
        ted."L",
        ted."U",
        ted."R",
        ted."B", 
        ted."T",
        ted."B1",
        ted."S1",
        ted."S2",
        tes.id as signal_id,
        tes.signal_number,
        tes.signal_state,
        ted.controller_id,
        j.job_name
      FROM 
        tork_examination_data ted
      LEFT JOIN 
        tork_examination_signals tes ON ted.signal_id = tes.id
      LEFT JOIN
        tork_examination_sessions sess ON ted.session_id = sess.id
      LEFT JOIN
        job_list j ON sess.job_id = j.id
      WHERE 
        ted.controller_id = $1
      ORDER BY 
        ted.timestamp DESC
    `;

    const fullResult = await client.query(fullQuery, [controllerId]);

    const torkData: TorkExaminationData[] = fullResult.rows.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      value: row.S || row.s || 0,
      signalId: row.signal_id,
      signalNumber: row.signal_number,
      signalState: row.signal_state,
      controllerId: controllerId,
      sessionId: row.session_id,
      S: row.S || row.s || 0,
      L: row.L || row.l || 0,
      U: row.U || row.u || 0,
      R: row.R || row.r || 0,
      B: row.B || row.b || 0,
      T: row.T || row.t || 0,
      B1: row.B1 || row.b1 || 0,
      S1: row.S1 || row.s1 || 0,
      S2: row.S2 || row.s2 || 0,
      jobId: row.job_id,
      jobName: row.job_name,
    }));

    return NextResponse.json(torkData);
  } catch (error) {
    console.error("Error fetching tork examination data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
