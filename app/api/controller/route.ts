import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

interface Robot {
    id: string;
    name: string;
    model: string;
    ipAddress: string;
    status: string;
    serialNumber: string;
    intervalMs: number;
    maxxConnection: number;
    location: string;
    createdAt?: string;
    updateAt?: string;
    deletedAt?: string;
}

export async function GET(request: NextRequest) {
    try {
        const robotDbResp = await dbPool.query('SELECT * FROM "robot"');
        const robots: Robot[] = robotDbResp.rows;
        return NextResponse.json(robots, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, model, ipAddress, status, serialNumber, intervalMs, maxxConnection, location }: Robot = await request.json();
    const client = await dbPool.connect();
    const newRobotId = uuidv4();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO "robot" (id, name, model, ip_address, status, serial_number, interval_ms, maxx_connection, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [newRobotId, name, model, ipAddress, status, serialNumber, intervalMs, maxxConnection, location]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Robot created successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request: NextRequest) {
    const { id, name, model, ipAddress, status, serialNumber, intervalMs, maxxConnection, location }: Robot = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE "robot" 
            SET name = $1, model = $2, ip_address = $3, status = $4, serial_number = $5, interval_ms = $6, maxx_connection = $7, location = $8, update_at = now() 
            WHERE id = $9`,
            [name, model, ipAddress, status, serialNumber, intervalMs, maxxConnection, location, id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Robot updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(request: NextRequest) {
    const { id }: { id: string } = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM "robot" WHERE id = $1`, [id]);
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Robot deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
