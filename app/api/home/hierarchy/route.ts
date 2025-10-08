import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export interface LineHierarchy {
  id: string;
  name: string;
  status: string;
  factoryName: string;
  cells: CellWithControllers[];
}

export interface CellWithControllers {
  id: string;
  name: string;
  status: string;
  lineId: string;
  controllers: ControllerDetail[];
}

export interface ControllerDetail {
  id: string;
  name: string;
  model?: string;
  application?: string;
  ipAddress: string;
  status: string;
  location?: string;
  cellId?: string;
}

export async function GET(request: NextRequest) {
  try {

    const linesResult = await dbPool.query(
      `SELECT 
        l.id, 
        l.name, 
        l.status,
        COALESCE(f.name, 'Unknown Factory') as factory_name
      FROM line l
      LEFT JOIN factory f ON l.factory_id = f.id
      ORDER BY l.name`
    );

    const lines: LineHierarchy[] = [];


    for (const line of linesResult.rows) {
      const cellsResult = await dbPool.query(
        `SELECT id, name, status, line_id FROM cell WHERE line_id = $1 ORDER BY name`,
        [line.id]
      );

      const cells: CellWithControllers[] = [];


      for (const cell of cellsResult.rows) {
        const controllersResult = await dbPool.query(
          `SELECT
            c.id,
            c.name,
            c.model,
            c.application,
            c.ip_address AS "ipAddress",
            c.status,
            c.location
          FROM controller c
          WHERE c.location LIKE $1
          ORDER BY c.name`,
          [`%/${line.name}/${cell.name}`]
        );

        cells.push({
          id: cell.id,
          name: cell.name,
          status: cell.status,
          lineId: cell.line_id,
          controllers: controllersResult.rows,
        });
      }

      lines.push({
        id: line.id,
        name: line.name,
        status: line.status,
        factoryName: line.factory_name,
        cells,
      });
    }

    return NextResponse.json(lines, { status: 200 });
  } catch (error: any) {
    console.error("DB Error:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

