import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/utils/dbUtil';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id:string;
    name: string;
    lastName: string;
    userName: string;
    email: string;
    role: string;
    bcryptPassword: string;
    createdAt?: string;
    updateAt?: string;
}

export async function GET(request: NextRequest) {
    try {
        const userDbResp = await dbPool.query('SELECT * FROM "users"');        
        const users: User[] = userDbResp.rows;
        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { name, lastName, userName, email, role, bcryptPassword }: User = await request.json();
    const client = await dbPool.connect();
    const newUserId=uuidv4();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO "users" (id, name, last_name, user_name, email, role, bcrypt_password) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [newUserId, name, lastName, userName, email, role, bcryptPassword]
        );
        await client.query('COMMIT')
        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK')
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request: NextRequest) {
    const {id, name, lastName, userName, email, role, bcryptPassword }: User = await request.json();
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE "users" 
            SET name = $1, last_name = $2, email = $3, role = $4, bcrypt_password = $5, user_name= $6, update_at = now() 
            WHERE id = $7`,
            [name, lastName, email, role, bcryptPassword, userName, id]
        );
        await client.query('COMMIT')
        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    } catch (error: any) {        
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK')
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(request: NextRequest) {
    const { id }: User = await request.json();
    console.log('id', id);
    
    const client = await dbPool.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query(
            `DELETE FROM users WHERE id = $1`,
            [id]
        );
        console.log('res', res);        
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('DB ERROR:', error.message);
        await client.query('ROLLBACK')
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}