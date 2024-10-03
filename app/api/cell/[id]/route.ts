import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dbRes = await dbPool.query(
            `SELECT * FROM cell WHERE id = $1`, 
            [params.id]
        );
        
        if (dbRes?.rowCount && dbRes.rowCount > 0) {
            const cell = dbRes.rows[0];
            return NextResponse.json({ ...cell });
        }

        return NextResponse.json({ message: 'Cell not found' }, { status: 404 });
    } catch (error) {
        console.log('DB Error: ', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
