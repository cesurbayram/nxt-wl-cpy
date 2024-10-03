import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

export interface Cell {
    id: string;
    name: string;
    status: string;
}

export async function GET(request: NextRequest) {
    try {
        const cellDbResp = await dbPool.query(`
            SELECT 
                r.id, 
                r.name, 
                r.status
            FROM 
                "cell" r
            `);
        const cells: Cell[] = cellDbResp.rows;
        return NextResponse.json(cells, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, status }: Cell = await request.json();
    const client = await dbPool.connect();
    const newCellId = uuidv4();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO "cell" (id, name, status) 
            VALUES ($1, $2, $3)`,
            [newCellId, name, status]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Cell created successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request: NextRequest) {
    const { id, name, status }: Cell = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE "cell" 
            SET name = $1, status = $2
            WHERE id = $3`,
            [name, status, id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Cell updated successfully' }, { status: 200 });
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
            `DELETE FROM cell WHERE id = $1`,
            [id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Cell deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
