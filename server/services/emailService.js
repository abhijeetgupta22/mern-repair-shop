import nodemailer from 'nodemailer';
import { NotificationLog } from '../models/NotificationLog.js';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // In dev / demo mode: create an ethereal test account automatically
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email] Ethereal test mailer initialized (${testAccount.user})`);
    } catch (err) {
      // Stream fallback
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      console.log('[Email] Using JSON mail transport fallback');
    }
  }
  return transporter;
}

export const emailService = {
  async sendIntakeEmail({ ticketId, customerName, customerEmail, device, issue, estimatedDeliveryDate, trackingUrl }) {
    if (!customerEmail) return { success: false, reason: 'No customer email provided' };

    const shopName = process.env.SHOP_NAME || 'TechFix Pro Care';
    const shopPhone = process.env.SHOP_PHONE || '+91 98765 43210';
    const shopAddress = process.env.SHOP_ADDRESS || 'TechFix Hub, Electronics Market';

    const subject = `🛠️ Repair Received: #${ticketId} - ${device.brand} ${device.model} (${shopName})`;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">${shopName}</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Laptop, Desktop & Mobile Repair Specialists</p>
          </div>

          <div style="padding: 28px;">
            <div style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-bottom: 16px;">
              Ticket #${ticketId} • RECEIVED
            </div>

            <h2 style="font-size: 18px; color: #111827; margin-top: 0;">Hello ${customerName},</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              We have received your device for repair and inspection. Our certified technician will examine it shortly.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fafb; border-radius: 8px; overflow: hidden; font-size: 14px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 14px; font-weight: bold; color: #6b7280; width: 35%;">Device:</td>
                <td style="padding: 10px 14px; color: #111827;">${device.brand} ${device.model} (${device.type})</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Reported Issue:</td>
                <td style="padding: 10px 14px; color: #dc2626; font-weight: 500;">${issue}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #6b7280;">Est. Delivery:</td>
                <td style="padding: 10px 14px; color: #111827;">${estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toLocaleDateString() : 'Under Assessment'}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Track Repair Status Live
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; text-align: center;">
              You will receive automatic updates as work progresses on your device.
            </p>
          </div>

          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 4px 0;">📍 ${shopAddress}</p>
            <p style="margin: 0;">📞 Helpline: ${shopPhone} | Keep this email for warranty reference.</p>
          </div>
        </div>
      </div>
    `;

    return await this.dispatchMail({
      ticketId,
      customerName,
      customerContact: customerEmail,
      triggerType: 'INTAKE_CONFIRMATION',
      subject,
      html
    });
  },

  async sendReadyForDeliveryEmail({ ticketId, customerName, customerEmail, device, finalCost, paymentStatus, trackingUrl }) {
    if (!customerEmail) return { success: false, reason: 'No customer email provided' };

    const shopName = process.env.SHOP_NAME || 'TechFix Pro Care';
    const shopPhone = process.env.SHOP_PHONE || '+91 98765 43210';
    const shopAddress = process.env.SHOP_ADDRESS || 'TechFix Hub, Electronics Market';

    const subject = `🎉 READY FOR DELIVERY: #${ticketId} - ${device.brand} ${device.model} (${shopName})`;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 28px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Device Ready for Pickup!</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">${shopName} • Quality Checked & Certified</p>
          </div>

          <div style="padding: 28px;">
            <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-bottom: 16px;">
              Ticket #${ticketId} • READY FOR DELIVERY
            </div>

            <h2 style="font-size: 18px; color: #111827; margin-top: 0;">Dear ${customerName},</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              We are pleased to inform you that your <strong>${device.brand} ${device.model}</strong> has been completely repaired, thoroughly tested, and is ready for pickup or delivery!
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #374151; font-size: 14px;">Total Amount:</span>
                <span style="font-size: 18px; font-weight: bold; color: #111827;">₹${finalCost || 0}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #374151; font-size: 14px;">Payment Status:</span>
                <span style="font-weight: bold; color: ${paymentStatus === 'PAID' ? '#10b981' : '#f59e0b'};">${paymentStatus || 'UNPAID'}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                View Bill & Tracking Summary
              </a>
            </div>

            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; font-size: 13px; color: #475569;">
              <strong style="color: #0f172a;">Store Hours & Pickup Address:</strong><br/>
              📍 ${shopAddress}<br/>
              ⏰ 10:00 AM - 8:30 PM (Monday - Saturday)<br/>
              <em>Please show this email or Ticket #${ticketId} at the counter.</em>
            </div>
          </div>

          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 4px 0;">Questions? Call support at ${shopPhone}</p>
            <p style="margin: 0;">${shopName} • Thank you for your business!</p>
          </div>
        </div>
      </div>
    `;

    return await this.dispatchMail({
      ticketId,
      customerName,
      customerContact: customerEmail,
      triggerType: 'READY_FOR_DELIVERY',
      subject,
      html
    });
  },

  async dispatchMail({ ticketId, customerName, customerContact, triggerType, subject, html }) {
    try {
      const mailer = await getTransporter();
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"TechFix Support" <notifications@techfix.com>',
        to: customerContact,
        subject,
        html
      };

      const info = await mailer.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info) || null;

      console.log(`[Email] Mail sent to ${customerContact}: ${info.messageId}`);
      if (previewUrl) {
        console.log(`[Email] Test Preview URL: ${previewUrl}`);
      }

      await NotificationLog.create({
        ticketId,
        recipientName: customerName,
        recipientContact: customerContact,
        channel: 'EMAIL',
        triggerType,
        subject,
        messageBody: `Sent to ${customerContact}: ${subject}`,
        status: 'SENT',
        meta: {
          messageId: info.messageId,
          previewUrl
        }
      });

      return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
      console.error('[Email] Failed to send email:', err);
      await NotificationLog.create({
        ticketId,
        recipientName: customerName,
        recipientContact: customerContact,
        channel: 'EMAIL',
        triggerType,
        subject,
        messageBody: `Failed to send to ${customerContact}`,
        status: 'FAILED',
        meta: { error: err.message }
      });
      return { success: false, error: err.message };
    }
  }
};
