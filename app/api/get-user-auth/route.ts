import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest){
    try {
        const token = await request.cookies.get("token")?.value || "";
        const user = await jwt.verify(token, process.env.SECRET ? process.env.SECRET : '')
        console.log('user', user);
        

        // const userDbRes = await dbPool.query(`
        //     SELECT * FROM users WHERE id = $1   
        // `, [userId])
        return NextResponse.json(user, {status: 200})
    } catch (error: any) {
        return NextResponse.json({error: error?.message}, {status: 500})
    }
}