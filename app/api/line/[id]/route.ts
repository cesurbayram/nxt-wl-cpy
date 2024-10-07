import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dbRes = await dbPool.query(
            `SELECT 
                l.line_id as id,
                l.name,
                l.status,
                array_agg(c.id) AS "cellIds" 
            FROM 
                line l
                LEFT JOIN 
                cell c ON l.cell_id = c.id            
            WHERE line_id = $1 GROUP BY l.line_id, l.name, l.status`, 
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
