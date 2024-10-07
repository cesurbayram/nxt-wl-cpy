import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

export interface Line {
    id: string;
    name: string;
    status: string;
    cellIds?: string
}

export async function GET(request: NextRequest) {
    try {
        const lineDbResp = await dbPool.query(`
            SELECT * FROM line
        `);

        const lines: Line[] = lineDbResp.rows;
        console.log('lines', lines);        
        return NextResponse.json(lines, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, status, cellIds }: Line = await request.json();
    const client = await dbPool.connect();
    
    try {
        if(!cellIds || cellIds.length === 0){
            return NextResponse.json({ message: 'Cells are required' }, { status: 500});
        }

        await client.query('BEGIN');
        const newLineId = uuidv4();
        await client.query(`
            INSERT INTO line (id, name, status) VALUES ($1, $2, $3)
        `, [newLineId, name, status])
        
        for(const item of cellIds){
            const factoryLineCellId = uuidv4();
            await client.query(`INSERT INTO factory_line_cell (id, factory_id, line_id, cell_id) VALUES ($1, $2, $3, $4)`, [factoryLineCellId, null, newLineId, item])
        }

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
    const { id, name, status, cellIds }: Line = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        // await client.query(
        //     `UPDATE "line" 
        //     SET name = $1, status = $2, cell_id = $3, updated_at = NOW()
        //     WHERE id = $4`,
        //     [name, status, cell_id, id]
        // );
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
