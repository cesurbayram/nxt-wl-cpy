import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dbRes = await dbPool.query(
            `SELECT * FROM factory WHERE id = $1`, 
            [params.id]
        );
        
        if (dbRes?.rowCount && dbRes.rowCount > 0) {
            const factory = dbRes.rows[0];
            return NextResponse.json({ ...factory });
        }

        return NextResponse.json({ message: 'Factory not found' }, { status: 404 });
    } catch (error) {
        console.log('DB Error: ', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}