import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dbRes = await dbPool.query(
            `SELECT * FROM line WHERE id = $1`, 
            [params.id]
        );
        
        if (dbRes?.rowCount && dbRes.rowCount > 0) {
            const line = dbRes.rows[0];
            return NextResponse.json({ ...line });
        }

        return NextResponse.json({ message: 'Line not found' }, { status: 404 });
    } catch (error) {
        console.log('DB Error: ', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
