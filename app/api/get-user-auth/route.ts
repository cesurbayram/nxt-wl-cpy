import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || "";

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const secret = process.env.SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, secret) as any;

    const user = {
      id: decoded.id,
      name: decoded.name,
      lastName: decoded.lastName,
      userName: decoded.userName,
      email: decoded.email,
      role: decoded.role,
    };

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
