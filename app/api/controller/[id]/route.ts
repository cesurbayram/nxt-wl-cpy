import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dbRes = await dbPool.query(`SELECT
            id,
            name,
            model,
            ip_address AS "ipAddress",
            status,
            serial_number AS "serialNumber",
            interval_ms AS "intervalMs",
            max_connection AS "maxConnection",
            location            
            FROM controller WHERE id = $1`, [params.id]);

        if (dbRes?.rowCount && dbRes.rowCount > 0) {
            const controller = dbRes.rows[0];
            return NextResponse.json({ ...controller });
        }
        return NextResponse.json({ message: 'Controller not found' }, { status: 404 });
    } catch (error: any) {
        console.log('DB Error: ', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
