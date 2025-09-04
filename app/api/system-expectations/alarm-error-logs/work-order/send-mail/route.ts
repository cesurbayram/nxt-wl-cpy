import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { sendMail } from "@/utils/service/mail";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const client = await dbPool.connect();

  try {
    const { workOrderId, recipientEmail } = await request.json();

    if (!workOrderId || !recipientEmail) {
      return NextResponse.json(
        { message: "Work Order ID and recipient email are required" },
        { status: 400 }
      );
    }

    const workOrderResult = await client.query(
      `SELECT wo.*, c.name as controller_name, c.ip_address as controller_ip 
       FROM work_orders wo
       LEFT JOIN controller c ON wo.controller_id = c.id
       WHERE wo.id = $1`,
      [workOrderId]
    );

    if (workOrderResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Work order not found" },
        { status: 404 }
      );
    }

    const workOrder = workOrderResult.rows[0];

    const subject = `Work Order Bildirimi - Alarm ${workOrder.alarm_code}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">WORK ORDER BİLDİRİMİ</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Toyota Boshoku Watchlog Sistemi</p>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #721c24; margin: 0 0 15px 0; font-size: 20px;"> ALARM BİLGİLERİ</h2>
            <div style="display: grid; gap: 10px;">
              <div><strong>Alarm Kodu:</strong> <span style="color: #dc3545; font-weight: bold;">${
                workOrder.alarm_code
              }</span></div>
              <div><strong>Açıklama:</strong> ${workOrder.description}</div>
              <div><strong>Öncelik:</strong> 
                <span style="background-color: ${getPriorityColor(
                  workOrder.priority
                )}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${workOrder.priority}
                </span>
              </div>
            </div>
          </div>

          <div style="background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #004085; margin: 0 0 15px 0; font-size: 18px;">CONTROLLER BİLGİLERİ</h2>
            <div style="display: grid; gap: 10px;">
              <div><strong>Controller Adı:</strong> ${
                workOrder.controller_name || "Bilinmiyor"
              }</div>
              <div><strong>IP Adresi:</strong> ${
                workOrder.controller_ip || "Bilinmiyor"
              }</div>
            </div>
          </div>

          <div style="background-color: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">WORK ORDER DETAYLARI</h2>
            <div style="display: grid; gap: 10px;">
              <div><strong>Work Order ID:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${
                workOrder.id
              }</code></div>
              <div><strong>Durum:</strong> <span style="background-color: ${getStatusColor(
                workOrder.status
              )}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${
      workOrder.status
    }</span></div>
              <div><strong>Oluşturulma Tarihi:</strong> ${new Date(
                workOrder.created_date
              ).toLocaleString("tr-TR")}</div>
            </div>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">🔧 YAPILMASI GEREKENLER</h3>
            <ul style="color: #78350f; margin: 0; padding-left: 20px;">
              <li>Alarm nedenini analiz edin</li>
              <li>Gerekli bakım işlemlerini gerçekleştirin</li>
              <li>Work order durumunu güncelleyin</li>
              <li>Sonuçları sisteme kaydedin</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px 0;">
            <div style="background-color: #1f2937; color: white; padding: 15px; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px;">
                Bu mail Toyota Boshoku Watchlog sistemi tarafından gönderilmiştir.<br>
                Acil durumlar için maintenance ekibiyle iletişime geçiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const textContent = `
WORK ORDER BİLDİRİMİ

Alarm Kodu: ${workOrder.alarm_code}
Açıklama: ${workOrder.description}
Öncelik: ${workOrder.priority}
Controller: ${workOrder.controller_name || "Bilinmiyor"} (${
      workOrder.controller_ip || "Bilinmiyor"
    })
Work Order ID: ${workOrder.id}
Durum: ${workOrder.status}
Oluşturulma Tarihi: ${new Date(workOrder.created_date).toLocaleString("tr-TR")}

Bu mail Toyota Boshoku Watchlog sistemi tarafından gönderilmiştir.
    `;

    const success = await sendMail({
      to: recipientEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    if (success) {
      await client.query(
        `UPDATE work_orders SET mail_recipient = $1 WHERE id = $2`,
        [recipientEmail, workOrderId]
      );

      return NextResponse.json(
        {
          message: "Work order notification sent successfully",
          recipient: recipientEmail,
          workOrderId: workOrder.id,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to send work order notification" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Work order mail send error:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "#dc3545";
    case "MEDIUM":
      return "#ffc107";
    case "LOW":
      return "#28a745";
    default:
      return "#6c757d";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "#17a2b8";
    case "IN_PROGRESS":
      return "#ffc107";
    case "COMPLETED":
      return "#28a745";
    case "CLOSED":
      return "#6c757d";
    default:
      return "#6c757d";
  }
};
