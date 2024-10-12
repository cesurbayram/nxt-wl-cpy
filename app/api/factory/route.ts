import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

export interface Factory {
    id: string;
    name: string;
    status: string;
    lineIds?: string[]
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
    const { name, status, lineIds}: Factory = await request.json();
    const client = await dbPool.connect();
    
    try {
        if(!lineIds || lineIds.length === 0){
            return NextResponse.json({ message: 'At least one line required' }, { status: 500});
        }
        const newFactoryId = uuidv4();
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO factory (id, name, status) 
            VALUES ($1, $2, $3)`,
            [newFactoryId, name, status]
        );
        await client.query(`
            UPDATE line SET factory_id = $1 WHERE id = ANY ($2)
        `, [newFactoryId, lineIds])
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
    const { id, name, status, lineIds }: Factory = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');        
        await client.query(`
            UPDATE factory SET name = $1, status = $2 WHERE id = $3
        `, [name, status, id])

        await client.query(`
            UPDATE line SET factory_id = $1 WHERE factory_id = $2 
        `, [null, id])

        await client.query(`
            UPDATE line SET factory_id = $1 WHERE id = ANY($2)
        `, [id, lineIds])

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