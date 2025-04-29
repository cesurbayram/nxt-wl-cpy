import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { TorkExaminationData } from "@/types/tork-examination.types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const controllerId = params.id;
    const { searchParams } = new URL(request.url);

    const sessionId = searchParams.get("sessionId");

    let query = `
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
        ted.controller_id
      FROM 
        tork_examination_data ted
      LEFT JOIN 
        tork_examination_signals tes ON ted.signal_id = tes.id
      WHERE 
        ted.controller_id = $1
    `;

    const queryParams = [controllerId];

    if (sessionId) {
      query += ` AND ted.session_id = $2`;
      queryParams.push(sessionId);
    } else {
      query += ` ORDER BY ted.timestamp DESC`;
    }

    const dataResult = await client.query(query, queryParams);

    const torkData: TorkExaminationData[] = dataResult.rows.map((row: any) => ({
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
      jobId: undefined,
      jobName: undefined,
    }));

    return NextResponse.json(torkData);
  } catch (error) {
    console.error("Error in GET tork examination data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
