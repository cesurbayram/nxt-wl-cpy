import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  const { id, type } = params;

  const typeMap: { [key: string]: string } = {
    extInput: "External Input",
    extOutput: "External Output",
    univInput: "Universal Input",
    univOutput: "Universal Output",
    spesInput: "Specific Input",
    spesOutput: "Specific Output",
    interPanel: "Interface Panel",
    auxRel: "Auxiliary Relay",
    contStat: "Control Status",
    pseInput: "Pseudo Input",
    netInput: "Network Input",
    netOutput: "Network Output",
    register: "Registers",
  };

  const mappedType = typeMap[type];
  if (!mappedType) {
    return NextResponse.json(
      { message: "Invalid type parameter" },
      { status: 400 }
    );
  }

  try {
    const url = new URL(request.url);
    const selectedByte = url.searchParams.get("byte");
    const groupRes = await dbPool.query(
      `SELECT * FROM io_group WHERE controller_id = $1 AND name = $2`,
      [id, mappedType]
    );

    if (groupRes.rowCount === 0) {
      return NextResponse.json(
        { message: "No groups found for the given type" },
        { status: 404 }
      );
    }

    const group = groupRes.rows[0];

    const queryParams = selectedByte ? [group.id, selectedByte] : [group.id];

    const signalRes = await dbPool.query(
      `
      SELECT 
        s.id AS "signalId",
        s.byte_number AS "signalBitNumber",
        s.description AS "name",
        b.bit_number AS "bitNumber",
        b.name AS "bitName",
        b.is_active AS "isActive"
      FROM io_signal AS s
      LEFT JOIN io_bit AS b ON s.id = b.signal_id
      WHERE s.group_id = $1
      ${selectedByte ? `AND s.byte_number = $2` : ""}
      ORDER BY s.byte_number, b.bit_number
      `,
      queryParams
    );
    const signals = signalRes.rows.reduce((acc: any[], row) => {
      let signal = acc.find((s) => s.signalBitNumber === row.signalBitNumber);
      if (!signal) {
        signal = {
          signalBitNumber: row.signalBitNumber,
          name: row.name,
          bits: [],
        };
        acc.push(signal);
      }

      if (row.bitNumber !== null) {
        signal.bits.push({
          bitNumber: row.bitNumber,
          name: row.bitName,
          isActive: row.isActive,
        });
      }

      return acc;
    }, []);

    return NextResponse.json(signals, { status: 200 });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
