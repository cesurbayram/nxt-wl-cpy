import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';
//import { Robot } from '@/types/robot.types';
//import { Controller } from '@/types/controller.types';

export interface Controller {
    id: string;
    name: string;
    model: string;
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
        const controllerDbResp = await dbPool.query(`
            SELECT 
                r.id,
                r.name,
                r.model,
                r.ip_address AS "ipAddress",
                r.status,
                r.serial_number AS "serialNumber",
                r.interval_ms AS "intervalMs",
                r.max_connection AS "maxConnection",
                r.location,
                r.created_at AS "createdAt",
                r.updated_at AS "updatedAt"
            FROM 
                "controller" r
        `); 

        const controllers: Controller[] = controllerDbResp.rows;
        return NextResponse.json(controllers, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, model, ipAddress, status, serialNumber, intervalMs, maxConnection, location }: Controller = await request.json();
    const client = await dbPool.connect();
    const newRobotId = uuidv4();
    const newRobotStatusId = uuidv4();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO "controller" (id, name, model, ip_address, status, serial_number, interval_ms, max_connection, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [newRobotId, name, model, ipAddress, status, serialNumber, intervalMs, maxConnection, location]
        );

        // await client.query(`INSERT INTO controller_status (id, ip_address, teach, servo, operating, cycle, hold, alarm, error, stop) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
        //     newRobotStatusId, ipAddress, 'TEACH', false, false, 'CYCLE', false, false, false, false
        // ]);

        // await client.query(
        //     `INSERT INTO d_read (id, ip_address, no, name, value)
        //      SELECT uuid_generate_v4(), $1, gs, null, '0'
        //      FROM generate_series(0, 3000) as gs;`,
        //     [ipAddress]
        // );

        // await client.query(
        //     `INSERT INTO s_read (id, ip_address, no, name, value)
        //      SELECT uuid_generate_v4(), $1, gs, null, '0'
        //      FROM generate_series(0, 3000) as gs;`,
        //     [ipAddress]
        // );

        // await client.query(
        //     `INSERT INTO ı_read (id, ip_address, no, name, value)
        //      SELECT uuid_generate_v4(), $1, gs, null, '0'
        //      FROM generate_series(0, 3000) as gs;`,
        //     [ipAddress]
        // );

        // await client.query(
        //     `INSERT INTO r_read (id, ip_address, no, name, value)
        //      SELECT uuid_generate_v4(), $1, gs, null, '0'
        //      FROM generate_series(0, 3000) as gs;`,
        //     [ipAddress]
        // );
        
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Controller created successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request: NextRequest) {
    const { id, name, model, ipAddress, status, serialNumber, intervalMs, maxConnection, location }: Controller = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE "controller" 
            SET name = $1, model = $2, ip_address = $3, status = $4, serial_number = $5, interval_ms = $6, max_connection = $7, location = $8 
            WHERE id = $9`,
            [name, model, ipAddress, status, serialNumber, intervalMs, maxConnection, location, id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Controller updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM "controller" WHERE id = $1`, [id]);
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Controller deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
