import * as nodemailer from "nodemailer";
import { ScheduledMailJob } from "@/types/scheduled-mail.types";

const createSMTPTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_SERVER || "192.168.110.141",
    port: parseInt(process.env.SMTP_PORT || "25"),
    secure: false,
    auth: process.env.SMTP_USERNAME
      ? {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD || "",
        }
      : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

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
    if (!options.to) {
      throw new Error("Recipient email is required");
    }
    if (!options.subject) {
      throw new Error("Email subject is required");
    }

    const transporter = createSMTPTransporter();

    const fromEmail =
      process.env.SMTP_FROM_EMAIL ||
      "TBTNotificationService@toyota-boshoku.com";
    const fromName =
      process.env.SMTP_FROM_NAME || "Toyota Boshoku Notification Service";

    const attachments =
      options.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })) || [];

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      attachments: attachments,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("SMTP mail sent successfully:", result.messageId);
    return true;
  } catch (error: any) {
    console.error("SMTP mail send error:", error.message);
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
        <h2 style="color: #333;">Watchlog Report System</h2>
        <p>Hello</p>
        <p>The scheduled report is ready. You can find it in the attachments.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #555;">Rapor Bilgileri:</h3>
          <p style="margin: 5px 0;"><strong>Report Name:</strong> ${
            job.report_name
          }</p>
          <p style="margin: 5px 0;"><strong>Format:</strong> ${job.report_format.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Created Date:</strong> ${new Date().toLocaleString(
            "tr-TR"
          )}</p>
          <p style="margin: 5px 0;"><strong>Sending:</strong> Mailjet REST API</p>
          ${
            job.is_recurring
              ? '<p style="margin: 5px 0;"><strong>Tip:</strong> Recurring Task</p>'
              : ""
          }
        </div>
        
        <p>This report is automatically generated.</p>
        <p>Best regards,<br>Watchlog Report System</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          This email is automatically sent by Watchlog Report System.
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
      process.env.SMTP_FROM_EMAIL ||
      "TBTNotificationService@toyota-boshoku.com";

    const result = await sendMail({
      to: fromEmail,
      subject: "Toyota Boshoku SMTP Connection Test",
      text: "This is a connection test email from Toyota Boshoku Watchlog System.",
      html: "<p>This is a connection test email from <strong>Toyota Boshoku Watchlog System</strong>.</p>",
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
