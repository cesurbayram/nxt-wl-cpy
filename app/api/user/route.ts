import { User } from "@/types/user.types";
import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const saltRounds = 10;

export async function GET(request: NextRequest) {
  try {
    const userDbResp = await dbPool.query(`
            SELECT 
            u.id, 
            u.name, 
            u.last_name AS "lastName", 
            u.user_name AS "userName", 
            u.email, 
            u.role,
            u.code,
            u.position,
            u.location
        FROM 
            "users" u
        ORDER BY u.created_at DESC`);

    const users: User[] = userDbResp.rows.map((row) => ({
      id: row.id,
      name: row.name,
      lastName: row.lastName,
      userName: row.userName,
      email: row.email,
      role: row.role,
      code: row.code,
      position: row.position,
      location: row.location,
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const {
    name,
    lastName,
    userName,
    email,
    role,
    password,
    code,
    position,
    location,
  }: User = await request.json();
  const client = await dbPool.connect();
  const newUserId = uuidv4();
  try {
    const checkUser = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (checkUser.rowCount && checkUser.rowCount > 0) {
      return NextResponse.json(
        { message: "User already exist!" },
        { status: 409 }
      );
    }

    await client.query("BEGIN");
    const bcryptPassword =
      password && (await bcrypt.hash(password, saltRounds));

    await client.query(
      `INSERT INTO "users" (id, name, last_name, user_name, email, role, code, position, location, bcrypt_password) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newUserId,
        name,
        lastName,
        userName,
        email,
        role,
        code,
        position,
        location,
        bcryptPassword,
      ]
    );
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const {
    id,
    name,
    lastName,
    userName,
    email,
    role,
    code,
    position,
    location,
  }: User = await request.json();
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE "users" 
            SET name = $1, last_name = $2, email = $3, role = $4, user_name = $5, code = $6, position = $7, location = $8, updated_at = now() 
            WHERE id = $9`,
      [name, lastName, email, role, userName, code, position, location, id]
    );
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
