import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

export interface Factory {
    id: string;
    name: string;
    status: string;
    line_id?: string
}

export async function GET(request: NextRequest) {
    try {
        const factoryDbResp = await dbPool.query(`
            SELECT 
              *
            FROM
                factory
        `);
        
        const cells: Factory[] = factoryDbResp.rows;
        return NextResponse.json(cells, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, status, line_id}: Factory = await request.json();
    const client = await dbPool.connect();
    const newLineId = uuidv4();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO "factory" (id, name, status, line_id) 
            VALUES ($1, $2, $3, $4)`,
            [newLineId, name, status, line_id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Line created successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request: NextRequest) {
    const { id, name, status, line_id }: Factory = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE "factory" 
            SET name = $1, status = $2, line_id = $3, updated_at = NOW()
            WHERE id = $4`,
            [name, status, line_id, id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Factory updated successfully' }, { status: 200 });
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
        await client.query(
            `DELETE FROM "factory" WHERE id = $1`,
            [id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Factory deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}