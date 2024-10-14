import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {id: string}}) {    
    try {
        const dbRes = await dbPool.query(`SELECT
                id,
                name,
                last_name AS "lastName",
                user_name AS "userName",
                email,
                role                
            FROM users WHERE id=$1`, [params.id])
        if(dbRes?.rowCount && dbRes.rowCount > 0) {
            const user = dbRes.rows[0]
            return NextResponse.json({...user})
        }
        return NextResponse.json({message: 'User not found'}, {status: 404})
    } catch (error) {
        console.log('DB Error: ', error)
        return NextResponse.json({message: 'Internal server error'}, {status: 500})
    }
}