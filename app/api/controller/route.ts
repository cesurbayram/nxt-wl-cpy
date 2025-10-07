import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "@/utils/service/notification";

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

async function bulkInsert(
  client: any,
  tableName: string,
  columns: string[],
  dataRows: any[][],
  batchSize: number = 1000
) {
  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch = dataRows.slice(i, i + batchSize);
    const values = [];
    const params = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const paramIndexes = row.map(
        (_, colIndex) => `$${j * row.length + colIndex + 1}`
      );
      values.push(`(${paramIndexes.join(", ")})`);
      params.push(...row);
    }

    const query = `INSERT INTO ${tableName} (${columns.join(
      ", "
    )}) VALUES ${values.join(", ")}`;
    await client.query(query, params);
  }
}

export async function GET(request: NextRequest) {
  try {
    const controllerDbResp = await dbPool.query(`
            SELECT
    c.id,
    c.ip_address AS "ipAddress",
    c.name,
    c.model,
    c.application,
    c.location,
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
        'teach', ct.teach,
        'cBackup', ct.c_backup,
        'connection', ct.connection
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
      `INSERT INTO controller_status (id, ip_address, controller_id, teach, servo, operating, cycle,  hold, alarm, error, stop, door_opened, c_backup, connection )
       VALUES ($1, $2, $3, 'TEACH', false, false, 'CYCLE', false, false, false, false, false, false, false)`,
      [newRobotStatusId, ipAddress, newRobotId]
    );

    await client.query("COMMIT");

    (async () => {
      const bgClient = await dbPool.connect();
      try {
        await bgClient.query("BEGIN");

        const readTables = [
          "b_read",
          "d_read",
          "s_read",
          "i_read",
          "r_read",
        ] as const;
        for (const tbl of readTables) {
          await bgClient.query(
            `INSERT INTO ${tbl} (id, ip_address, no, name, value, controller_id)
             SELECT gen_random_uuid()::text, $1, gs::text, NULL, '0', $2
             FROM generate_series(0, 99) AS gs`,
            [ipAddress, newRobotId]
          );
        }

        await bgClient.query(
          `INSERT INTO register (id, controller_id, register_no, register_value, ip_address)
           SELECT gen_random_uuid()::text, $1, gs, 0, $2
           FROM generate_series(0, 999) AS gs`,
          [newRobotId, ipAddress]
        );

        await bgClient.query(
          `WITH gdef(name, start_byte, end_byte, short_name, bit_type) AS (
              VALUES
                ('External Input', 2001, 2512, 'EI', 'I'),
                ('External Output', 3001, 3512, 'EO', 'O'),
                ('Universal Input', 1, 512, 'IN', '#'),
                ('Universal Output', 1001, 1512, 'OUT', '#'),
                ('Specific Input', 4001, 4160, 'SIN', '#'),
                ('Specific Output', 5001, 5300, 'SOUT', '#'),
                ('Auxiliary Relay', 7001, 7999, 'AR', 'R'),
                ('Control Status', 8001, 8064, 'CS', 'S'),
                ('Pseudo Input', 8201, 8220, 'PI', 'I'),
                ('Network Input', 2701, 2956, 'NI', 'I'),
                ('Network Output', 3701, 3956, 'NO', 'O')
            ),
            ins_groups AS (
              INSERT INTO io_group (id, name, start_byte, end_byte, controller_id)
              SELECT gen_random_uuid()::text, g.name, g.start_byte, g.end_byte, $1
              FROM gdef g
              RETURNING id, name, start_byte, end_byte
            ),
            groups_meta AS (
              SELECT ig.*, g.short_name, g.bit_type
              FROM ins_groups ig
              JOIN gdef g USING (name, start_byte, end_byte)
            ),
            ins_signals AS (
              INSERT INTO io_signal (id, group_id, byte_number, description)
              SELECT gen_random_uuid()::text, gm.id, b, gm.name || ' #' || b
              FROM groups_meta gm
              CROSS JOIN LATERAL generate_series(gm.start_byte, gm.end_byte) AS b
              RETURNING id, group_id, byte_number
            )
            INSERT INTO io_bit (id, signal_id, bit_number, name, is_active)
            SELECT 
              gen_random_uuid()::text,
              s.id,
              '#' || s.byte_number::text || bit_index::text || ' (' || gm.short_name || ' ' || gm.bit_type || (bit_index + 1)::text || ')',
              NULL,
              false
            FROM ins_signals s
            JOIN groups_meta gm ON gm.id = s.group_id
            CROSS JOIN generate_series(0, 7) AS bit_index;`,
          [newRobotId]
        );

        await bgClient.query("COMMIT");

        try {
          await NotificationService.notifyControllerAdded(newRobotId, name);
        } catch (notificationError) {
          console.error("Failed to send notification:", notificationError);
        }
      } catch (bgErr: any) {
        console.error("BG CREATE ERROR:", bgErr?.message || bgErr);
        console.error("BG ERROR DETAILS:", bgErr);
        await bgClient.query("ROLLBACK");
      } finally {
        bgClient.release();
      }
    })();

    return NextResponse.json(
      { message: "Controller creation scheduled", controllerId: newRobotId },
      { status: 202 }
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

    // ✅ ÖNCE: Bağımlı tabloları temizle (foreign key constraint hatası olmasın)
    const dependentTables = [
      "general_byte_data",
      "general_int_data",
      "general_double_data",
      "general_real_data",
      "general_string_data",
      "general_register_data",
      "general_signal_data",
      "controller_status",
      "alarm",
      "almhist",
      "utilization_data",
      "backup_sessions",
      "backup_files",
      "production_value",
      "maintenance_plan",
      "maintenance_log",
      "tork_data",
      "teaching_comparisons",
      "job",
      "job_select",
      "b_read", "d_read", "s_read", "i_read", "r_read",
      "b_write", "d_write", "s_write", "i_write", "r_write",
    ];

   
    for (const table of dependentTables) {
      try {
        await client.query(`SAVEPOINT sp_${table}`);
        await client.query(
          `DELETE FROM ${table} WHERE controller_id = $1`,
          [id]
        );
        await client.query(`RELEASE SAVEPOINT sp_${table}`);
      } catch (err: any) {
       
        await client.query(`ROLLBACK TO SAVEPOINT sp_${table}`);
      }
    }

    
    const result = await client.query(
      `DELETE FROM "controller" WHERE id = $1`,
      [id]
    );
    
    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Controller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Controller deleted successfully", id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Failed to delete controller" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
