import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
//import { Robot } from '@/types/robot.types';
//import { Controller } from '@/types/controller.types';

export interface Controller {
  id: string;
  name: string;
  model: string;
  application: string;
  ipAddress: string;
  status: string;
  serialNumber: string;
  intervalMs: number;
  maxConnection: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // const controllerDbResp = await dbPool.query(`
    //     SELECT
    //         r.id,
    //         r.name,
    //         r.model,
    //         r.application,
    //         r.ip_address AS "ipAddress",
    //         r.status,
    //         r.serial_number AS "serialNumber",
    //         r.interval_ms AS "intervalMs",
    //         r.max_connection AS "maxConnection",
    //         r.location,
    //         r.created_at AS "createdAt",
    //         r.updated_at AS "updatedAt"
    //     FROM
    //         "controller" r
    // `);

    const controllerDbResp = await dbPool.query(`
            SELECT
    c.id,
    c.ip_address AS "ipAddress",
    c.name,
    c.model,
    c.application,
    c.status,
    json_build_object(
        'alarm', ct.alarm,
        'cycle', ct.cycle,
        'doorOpen', ct.door_opened,
        'error', ct.error,
        'hold', ct.hold,
        'operating', ct.operating,
        'servo', ct.servo,
        'stop', ct.stop,
        'teach', ct.teach
    ) AS "controllerStatus"
    FROM
    controller c
        INNER JOIN controller_status ct
            ON c.id = ct.controller_id
            ORDER BY c.created_at ASC
        `);

    const controllers: Controller[] = controllerDbResp.rows;
    return NextResponse.json(controllers, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const {
    name,
    model,
    application,
    ipAddress,
    status,
    serialNumber,
    intervalMs,
    maxConnection,
    location,
  }: Controller = await request.json();
  const client = await dbPool.connect();
  const newRobotId = uuidv4();
  const newRobotStatusId = uuidv4();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO "controller" (id, name, model, application, ip_address, status, serial_number, interval_ms, max_connection, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newRobotId,
        name,
        model,
        application,
        ipAddress,
        status,
        serialNumber,
        intervalMs,
        maxConnection,
        location,
      ]
    );

    await client.query(
      `INSERT INTO controller_status (id, ip_address, controller_id, teach, servo, operating, cycle,  hold, alarm, error, stop, door_opened ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        newRobotStatusId,
        ipAddress,
        newRobotId,
        "TEACH",
        false,
        false,
        "CYCLE",
        false,
        false,
        false,
        false,
        false,
      ]
    );

    const tables = ["b_read", "d_read", "s_read", "i_read", "r_read"];
    for (const table of tables) {
      for (let i = 0; i < 100; i++) {
        await client.query(
          `INSERT INTO ${table} (id, ip_address, no, name, value, controller_id) VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), ipAddress, i, null, "0", newRobotId]
        );
      }
    }

    const ioGroups = [
      {
        name: "External Input",
        start_byte: 2001,
        end_byte: 2512,
        shortName: "EI",
        bitType: "I",
      },
      {
        name: "External Output",
        start_byte: 3001,
        end_byte: 3512,
        shortName: "EO",
        bitType: "O",
      },
      {
        name: "Universal Input",
        start_byte: 10,
        end_byte: 5127,
        shortName: "UI",
        bitType: "I",
      },
      {
        name: "Universal Output",
        start_byte: 1001,
        end_byte: 1512,
        shortName: "UO",
        bitType: "O",
      },
      {
        name: "Specific Input",
        start_byte: 4001,
        end_byte: 4160,
        shortName: "SI",
        bitType: "I",
      },
      {
        name: "Specific Output",
        start_byte: 5001,
        end_byte: 5300,
        shortName: "SO",
        bitType: "O",
      },
      {
        name: "Interface Panel",
        start_byte: 6001,
        end_byte: 6064,
        shortName: "IP",
        bitType: "P",
      },
      {
        name: "Auxiliary Relay",
        start_byte: 7001,
        end_byte: 7999,
        shortName: "AR",
        bitType: "R",
      },
      {
        name: "Control Status",
        start_byte: 8001,
        end_byte: 8064,
        shortName: "CS",
        bitType: "S",
      },
      {
        name: "Pseudo Input",
        start_byte: 8201,
        end_byte: 8220,
        shortName: "PI",
        bitType: "I",
      },
      {
        name: "Network Input",
        start_byte: 2701,
        end_byte: 2956,
        shortName: "NI",
        bitType: "I",
      },
      {
        name: "Network Output",
        start_byte: 3701,
        end_byte: 3956,
        shortName: "NO",
        bitType: "O",
      },
      {
        name: "Registers",
        start_byte: 100000,
        end_byte: 100559,
        shortName: "R",
        bitType: "R",
      },
    ];

    for (const group of ioGroups) {
      const groupId = uuidv4();

      await client.query(
        `INSERT INTO io_group (id, name, start_byte, end_byte, controller_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [groupId, group.name, group.start_byte, group.end_byte, newRobotId]
      );

      for (let byte = group.start_byte; byte <= group.end_byte; byte++) {
        const signalId = uuidv4();

        await client.query(
          `INSERT INTO io_signal (id, group_id, byte_number, description)
           VALUES ($1, $2, $3, $4)`,
          [signalId, groupId, byte, `${group.name} #${byte}`]
        );

        for (let bit = 0; bit < 8; bit++) {
          const formattedBitNumber = `#${byte}${bit} (${group.shortName} ${
            group.bitType
          }${bit + 1})`;

          await client.query(
            `INSERT INTO io_bit (id, signal_id, bit_number, name, is_active)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), signalId, formattedBitNumber, null, false]
          );
        }
      }
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Controller created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const {
    id,
    name,
    model,
    application,
    ipAddress,
    status,
    serialNumber,
    intervalMs,
    maxConnection,
    location,
  }: Controller = await request.json();
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE "controller" 
            SET name = $1, model = $2, application = $3, ip_address = $4, status = $5, serial_number = $6, interval_ms = $7, max_connection = $8, location = $9 
            WHERE id = $10`,
      [
        name,
        model,
        application,
        ipAddress,
        status,
        serialNumber,
        intervalMs,
        maxConnection,
        location,
        id,
      ]
    );
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Controller updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM "controller" WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Controller deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
