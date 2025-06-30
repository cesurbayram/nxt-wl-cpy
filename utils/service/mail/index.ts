const Mailjet = require("node-mailjet");
import { ScheduledMailJob } from "@/types/scheduled-mail.types";

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY || "9a40282bf33c0ba2e5db2f15774f88e6",
  process.env.MAILJET_SECRET_KEY || "6321d47267b1172095dd1233ee7dd4be"
);

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export const sendMail = async (options: MailOptions): Promise<boolean> => {
  try {
    const fromEmail =
      process.env.MAILJET_FROM_EMAIL || "demofabrica.test@gmail.com";
    const fromName = process.env.MAILJET_FROM_NAME || "Fabrica Demo";

    if (!options.to) {
      throw new Error("Recipient email is required");
    }
    if (!options.subject) {
      throw new Error("Email subject is required");
    }

    const attachments =
      options.attachments?.map((att) => ({
        ContentType: att.contentType || "application/octet-stream",
        Filename: att.filename,
        Base64Content: att.content?.toString("base64") || "",
      })) || [];

    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: [
            {
              Email: options.to,
            },
          ],
          Subject: options.subject,
          TextPart: options.text || "",
          HTMLPart: options.html || options.text || "",
          Attachments: attachments,
        },
      ],
    };

    const request = mailjet
      .post("send", { version: "v3.1" })
      .request(mailjetPayload);

    const result = await request;

    if (result.body?.Messages?.[0]?.Status === "success") {
      return true;
    } else {
      console.error("Mailjet email send failure:", result.body);
      return false;
    }
  } catch (error: any) {
    console.error("Mail send error:", error.message);
    return false;
  }
};

export const sendReportMail = async (
  job: ScheduledMailJob,
  reportBuffer: Buffer,
  reportFileName: string
): Promise<boolean> => {
  try {
    const subject = `${job.report_name} - ${new Date().toLocaleDateString(
      "tr-TR"
    )}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Fabrica Demo Rapor Sistemi</h2>
        <p>Merhaba,</p>
        <p>Zamanlanmış raporunuz hazır. Ekte bulabilirsiniz.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #555;">Rapor Bilgileri:</h3>
          <p style="margin: 5px 0;"><strong>Rapor Adı:</strong> ${
            job.report_name
          }</p>
          <p style="margin: 5px 0;"><strong>Format:</strong> ${job.report_format.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleString(
            "tr-TR"
          )}</p>
          <p style="margin: 5px 0;"><strong>Gönderim:</strong> Mailjet REST API</p>
          ${
            job.is_recurring
              ? '<p style="margin: 5px 0;"><strong>Tip:</strong> Tekrarlanan Görev</p>'
              : ""
          }
        </div>
        
        <p>Bu rapor otomatik olarak oluşturulmuştur.</p>
        <p>İyi çalismalar,<br>Fabrica Demo Sistemi</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Bu e-posta Fabrica Demo sistem tarafindan otomatik olarak gönderilmiştir.
        </p>
      </div>
    `;

    const attachments = [
      {
        filename: reportFileName,
        content: reportBuffer,
        contentType: getContentType(job.report_format),
      },
    ];

    return await sendMail({
      to: job.email_recipient,
      subject,
      html: htmlContent,
      attachments,
    });
  } catch (error) {
    console.error("Failed to send report email:", error);
    return false;
  }
};

export const testMailConnection = async (): Promise<boolean> => {
  try {
    const fromEmail =
      process.env.MAILJET_FROM_EMAIL || "demofabrica.test@gmail.com";

    const result = await sendMail({
      to: fromEmail,
      subject: "Mailjet Connection Test",
      text: "This is a connection test email from Fabrica Demo System.",
      html: "<p>This is a connection test email from <strong>Fabrica Demo System</strong>.</p>",
    });

    return result;
  } catch (error) {
    console.error("Mail connection test failed:", error);
    return false;
  }
};

const getContentType = (format: string): string => {
  switch (format.toLowerCase()) {
    case "pdf":
      return "application/pdf";
    case "excel":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
};
