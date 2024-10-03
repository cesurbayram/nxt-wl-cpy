import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

export interface Line {
    id: string;
    name: string;
    status: string;
    cell_id?: string
}

export async function GET(request: NextRequest) {
    try {
        const lineDbResp = await dbPool.query(`
            SELECT 
              *
            FROM
                line
        `);
        
        const cells: Line[] = lineDbResp.rows;
        return NextResponse.json(cells, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, status, cell_id }: Line = await request.json();
    const client = await dbPool.connect();
    const newLineId = uuidv4();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO "line" (id, name, status, cell_id) 
            VALUES ($1, $2, $3, $4)`,
            [newLineId, name, status, cell_id]
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
    const { id, name, status, cell_id }: Line = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE "line" 
            SET name = $1, status = $2, cell_id = $3, updated_at = NOW()
            WHERE id = $4`,
            [name, status, cell_id, id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Line updated successfully' }, { status: 200 });
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
        await client.query(
            `DELETE FROM "line" WHERE id = $1`,
            [id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Line deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
