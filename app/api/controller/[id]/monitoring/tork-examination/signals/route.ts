import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: controllerId } = params;

  try {
    const result = await dbPool.query(
      `SELECT id, signal_number, signal_state 
       FROM tork_examination_signals 
       WHERE controller_id = $1 
       ORDER BY signal_number`,
      [controllerId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: controllerId } = params;

  try {
    const { signalNumber } = await request.json();

    if (!signalNumber || !/^\d+$/.test(signalNumber)) {
      return NextResponse.json(
        { error: "Invalid signal number format" },
        { status: 400 }
      );
    }

    const existingSignal = await dbPool.query(
      "SELECT id FROM tork_examination_signals WHERE controller_id = $1 AND signal_number = $2",
      [controllerId, signalNumber]
    );

    if (existingSignal?.rowCount && existingSignal.rowCount > 0) {
      return NextResponse.json(
        { error: "Signal number already exists" },
        { status: 409 }
      );
    }

    const result = await dbPool.query(
      `INSERT INTO tork_examination_signals (id, signal_number, signal_state, controller_id)
       VALUES (gen_random_uuid(), $1, false, $2)
       RETURNING id, signal_number, signal_state`,
      [signalNumber, controllerId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add signal" },
      { status: 500 }
    );
  }
}
