import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export interface LineHierarchy {
  id: string;
  name: string;
  status: string;
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
  controllerStatus?: {
    alarm: boolean;
    cycle: string;
    doorOpen: boolean;
    error: boolean;
    hold: boolean;
    operating: boolean;
    servo: boolean;
    stop: boolean;
    teach: string;
    cBackup: boolean;
    connection: boolean;
  };
}

/**
 * GET /api/home/hierarchy
 * Returns complete hierarchy: Lines -> Cells -> Controllers
 */
export async function GET(request: NextRequest) {
  try {
    // Get all lines
    const linesResult = await dbPool.query(
      `SELECT id, name, status FROM line ORDER BY name`
    );

    const lines: LineHierarchy[] = [];

    // For each line, get its cells and controllers
    for (const line of linesResult.rows) {
      const cellsResult = await dbPool.query(
        `SELECT id, name, status, line_id FROM cell WHERE line_id = $1 ORDER BY name`,
        [line.id]
      );

      const cells: CellWithControllers[] = [];

      // For each cell, get its controllers by matching location pattern
      for (const cell of cellsResult.rows) {
        const controllersResult = await dbPool.query(
          `SELECT
            c.id,
            c.name,
            c.model,
            c.application,
            c.ip_address AS "ipAddress",
            c.status,
            c.location,
            json_build_object(
              'alarm', ct.alarm,
              'cycle', ct.cycle,
              'doorOpen', ct.door_opened,
              'error', ct.error,
              'hold', ct.hold,
              'operating', ct.operating,
              'servo', ct.servo,
              'stop', ct.stop,
              'teach', ct.teach,
              'cBackup', ct.c_backup,
              'connection', ct.connection
            ) AS "controllerStatus"
          FROM controller c
          INNER JOIN controller_status ct ON c.id = ct.controller_id
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

