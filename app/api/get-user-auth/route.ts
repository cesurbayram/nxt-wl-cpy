import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest){
    try {
        const token = await request.cookies.get("token")?.value || "";
        const user = await jwt.verify(token, process.env.SECRET ? process.env.SECRET : '')
        
        return NextResponse.json(user, {status: 200})
    } catch (error: any) {
        return NextResponse.json({error: error?.message}, {status: 500})
    }
}