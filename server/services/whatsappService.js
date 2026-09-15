import { NotificationLog } from '../models/NotificationLog.js';

export const whatsappService = {
  formatPhoneNumber(phone) {
    if (!phone) return '';
    // Strip non-digits
    const clean = phone.replace(/\D/g, '');
    // If 10 digits (common in India / US without country code), default to country code or keep clean
    if (clean.length === 10) {
      return `91${clean}`; // Default to +91 or standard 10 digit
    }
    return clean;
  },

  generateIntakeMessage({ ticketId, customerName, device, issue, estimatedDeliveryDate, trackingUrl }) {
    const shopName = process.env.SHOP_NAME || 'TechFix Pro Care';
    const shopPhone = process.env.SHOP_PHONE || '+91 98765 43210';
    const shopAddress = process.env.SHOP_ADDRESS || 'TechFix Hub, Electronics Market';

    return `🛠️ *${shopName} - Repair Intake Confirmation*

Hello *${customerName}*,
We have successfully received your device for service.

📋 *Repair Ticket Details:*
• *Ticket ID:* #${ticketId}
• *Device:* ${device.brand} ${device.model} (${device.type})
• *Reported Issue:* ${issue}
${estimatedDeliveryDate ? `• *Est. Delivery:* ${new Date(estimatedDeliveryDate).toLocaleDateString()}` : ''}

🔍 *Track Live Status Anytime:*
${trackingUrl}

📍 *Store Address:* ${shopAddress}
📞 *Helpline:* ${shopPhone}

Thank you for trusting *${shopName}*!`;
  },

  generateReadyForDeliveryMessage({ ticketId, customerName, device, finalCost, paymentStatus, trackingUrl }) {
    const shopName = process.env.SHOP_NAME || 'TechFix Pro Care';
    const shopPhone = process.env.SHOP_PHONE || '+91 98765 43210';
    const shopAddress = process.env.SHOP_ADDRESS || 'TechFix Hub, Electronics Market';

    return `✅ *GOOD NEWS! Your Device is Ready for Delivery*

Hello *${customerName}*,
Your *${device.brand} ${device.model}* (Ticket *#${ticketId}*) has been successfully repaired, inspected, and passed all quality tests.

💰 *Billing Summary:*
• *Total Payable:* ₹${finalCost || 0}
• *Payment Status:* ${paymentStatus || 'UNPAID'}

📍 *Pickup Location:*
${shopAddress}
⏰ *Working Hours:* 10:00 AM – 8:30 PM (Mon - Sat)
📞 *Support:* ${shopPhone}

You can view your detailed itemized invoice and tracking history here:
${trackingUrl}

Please bring your Ticket ID #${ticketId} at the time of pickup!
*${shopName}*`;
  },

  generateWhatsAppUrl(phone, message) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedText = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  },

  async logNotification({ ticketId, customerName, customerContact, triggerType, messageBody, meta = {} }) {
    try {
      return await NotificationLog.create({
        ticketId,
        recipientName: customerName,
        recipientContact: customerContact,
        channel: 'WHATSAPP',
        triggerType,
        subject: `WhatsApp Notification: ${triggerType}`,
        messageBody,
        status: 'SENT',
        meta
      });
    } catch (err) {
      console.error('Error logging WhatsApp notification:', err);
    }
  }
};
