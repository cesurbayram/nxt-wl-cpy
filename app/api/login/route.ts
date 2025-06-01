import { Login } from "@/types/login.types";
import { User } from "@/types/user.types";
import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const { email, password }: Login = await request.json();

  try {
    const userDbRes = await dbPool.query(
      `
            SELECT
                u.id,
                u.name,
                u.last_name AS "lastName", 
                u.user_name AS "userName", 
                u.email, 
                u.role,
                u.bcrypt_password as "bcryptPassword"
            FROM users u WHERE u.email = $1
        `,
      [email]
    );

    if (userDbRes.rowCount === 0) {
      return NextResponse.json(
        { message: "User does not exist!" },
        { status: 400 }
      );
    }

    const userData: User = userDbRes.rows[0];
    const isPasswordMatch = await bcrypt.compare(
      password,
      userData.bcryptPassword ? userData.bcryptPassword : ""
    );

    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Wrong password!" }, { status: 400 });
    }

    const tokenData = {
      id: userData.id,
      name: userData.name,
      lastName: userData.lastName,
      userName: userData.userName,
      email: userData.email,
      role: userData.role,
    };

    const secret = process.env.SECRET;
    if (!secret) {
      throw new Error("SECRET environment variable is not defined");
    }

    const token = jwt.sign(tokenData, secret, {
      expiresIn: 24 * 60 * 60,
    });

    const response = NextResponse.json(
      {
        message: "Successfully logged in",
        success: true,
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
