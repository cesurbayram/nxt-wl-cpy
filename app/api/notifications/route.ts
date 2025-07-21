import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import {
  CreateNotificationRequest,
  NotificationResponse,
  Notification,
} from "@/types/notification.types";

export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "system";
    const unreadOnly = searchParams.get("unread_only") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    client = await dbPool.connect();

    let query = `
      SELECT id, type, title, message, data, user_id, is_read, created_at, updated_at
      FROM notifications
      WHERE (user_id = $1 OR user_id IS NULL)
    `;

    const params = [userId];

    if (unreadOnly) {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit.toString(), offset.toString());

    const result = await client.query(query, params);

    const countQuery = `
      SELECT COUNT(*) as total, COUNT(CASE WHEN is_read = false THEN 1 END) as unread
      FROM notifications
      WHERE (user_id = $1 OR user_id IS NULL)
    `;

    const countResult = await client.query(countQuery, [userId]);
    const { total, unread } = countResult.rows[0];

    const response: NotificationResponse = {
      notifications: result.rows,
      unread_count: parseInt(unread),
      total_count: parseInt(total),
      has_more: offset + limit < parseInt(total),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();

    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 }
      );
    }

    client = await dbPool.connect();
    const notificationId = uuidv4();

    const result = await client.query(
      `INSERT INTO notifications (id, type, title, message, data, user_id, is_read) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        notificationId,
        body.type,
        body.title,
        body.message,
        body.data || null,
        body.user_id || null,
        false,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const { action, notification_ids, user_id } = body;

    if (action !== "mark_read") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    client = await dbPool.connect();

    let query = `UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE `;
    let params = [];

    if (notification_ids && notification_ids.length > 0) {
      query += `id = ANY($1)`;
      params.push(notification_ids);
    } else if (user_id) {
      query += `(user_id = $1 OR user_id IS NULL) AND is_read = false`;
      params.push(user_id);
    } else {
      return NextResponse.json(
        { error: "Either notification_ids or user_id is required" },
        { status: 400 }
      );
    }

    const result = await client.query(query, params);

    return NextResponse.json({
      message: "Notifications marked as read",
      updated_count: result.rowCount,
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
