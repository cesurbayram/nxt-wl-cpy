import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; signalId: string } }
) {
  const client = await dbPool.connect();

  try {
    const { id: controllerId, signalId } = params;

    const fetchSignalQuery = `
      SELECT id, signal_number, signal_state, controller_id, created_at, updated_at
      FROM tork_examination_signals
      WHERE controller_id = $1 AND id = $2
    `;

    const result = await client.query(fetchSignalQuery, [
      controllerId,
      signalId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching signal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; signalId: string } }
) {
  const client = await dbPool.connect();

  try {
    const { id: controllerId, signalId } = params;
    const { signalState } = await request.json();

    const checkQuery = `
      SELECT id FROM tork_examination_signals
      WHERE controller_id = $1 AND id = $2
    `;

    const checkResult = await client.query(checkQuery, [
      controllerId,
      signalId,
    ]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const updateQuery = `
      UPDATE tork_examination_signals
      SET signal_state = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND controller_id = $3
      RETURNING id, signal_number, signal_state, controller_id, created_at, updated_at
    `;

    const result = await client.query(updateQuery, [
      signalState,
      signalId,
      controllerId,
    ]);

    const updatedSignal = result.rows[0];
    return NextResponse.json(updatedSignal);
  } catch (error) {
    console.error("Error updating signal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; signalId: string } }
) {
  const client = await dbPool.connect();

  try {
    const { id: controllerId, signalId } = params;

    const checkQuery = `
      SELECT id FROM tork_examination_signals
      WHERE controller_id = $1 AND id = $2
    `;

    const checkResult = await client.query(checkQuery, [
      controllerId,
      signalId,
    ]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const updateDataQuery = `
      UPDATE tork_examination_data
      SET signal_id = NULL
      WHERE signal_id = $1
    `;

    await client.query(updateDataQuery, [signalId]);

    const deleteQuery = `
      DELETE FROM tork_examination_signals
      WHERE id = $1 AND controller_id = $2
      RETURNING id
    `;

    const result = await client.query(deleteQuery, [signalId, controllerId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete signal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: signalId });
  } catch (error) {
    console.error("Error deleting signal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
