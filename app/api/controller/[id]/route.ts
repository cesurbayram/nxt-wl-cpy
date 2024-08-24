import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { ipAddress: string } }) {
    try {
        const dbRes = await dbPool.query(`SELECT * FROM robot WHERE ip_address = $1`, [params.ipAddress]);
        if (dbRes?.rowCount && dbRes.rowCount > 0) {
            const robot = dbRes.rows[0];
            return NextResponse.json({ ...robot });
        }
        return NextResponse.json({ message: 'Robot not found' }, { status: 404 });
    } catch (error: any) {
        console.log('DB Error: ', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
