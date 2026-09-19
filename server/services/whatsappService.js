import { NotificationLog } from '../models/NotificationLog.js';
import { Admin } from '../models/Admin.js';

export const whatsappService = {
  formatPhoneNumber(phone) {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `91${clean}`;
    }
    return clean;
  },

  async getShopDetails() {
    try {
      const admins = await Admin.find();
      if (admins && admins.length > 0) {
        const a = admins[0];
        return {
          shopName: a.shopName || process.env.SHOP_NAME || 'Apex Laptop & Mobile Repair Hub',
          shopPhone: a.phone || process.env.SHOP_PHONE || '+91 98765 43210',
          shopAddress: a.address || process.env.SHOP_ADDRESS || 'Tech Arcade, Electronics Market',
          shopEmail: a.shopEmail || 'apexrepaircare@gmail.com',
          upiId: a.upiId || 'apexrepair@upi'
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      shopName: process.env.SHOP_NAME || 'Apex Laptop & Mobile Repair Hub',
      shopPhone: process.env.SHOP_PHONE || '+91 98765 43210',
      shopAddress: process.env.SHOP_ADDRESS || 'Tech Arcade, Electronics Market',
      shopEmail: 'apexrepaircare@gmail.com',
      upiId: 'apexrepair@upi'
    };
  },

  generateIntakeMessage({ ticketId, customerName, device, issue, estimatedDeliveryDate, trackingUrl, shop = {} }) {
    const shopName = shop.shopName || process.env.SHOP_NAME || 'Apex Laptop & Mobile Repair Hub';
    const shopPhone = shop.shopPhone || process.env.SHOP_PHONE || '+91 98765 43210';
    const shopAddress = shop.shopAddress || process.env.SHOP_ADDRESS || 'Tech Arcade, Electronics Market';

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
📞 *Helpline / WhatsApp:* ${shopPhone}

Thank you for choosing *${shopName}*!`;
  },

  generateReadyForDeliveryMessage({ ticketId, customerName, device, finalCost, paymentStatus, trackingUrl, shop = {} }) {
    const shopName = shop.shopName || process.env.SHOP_NAME || 'Apex Laptop & Mobile Repair Hub';
    const shopPhone = shop.shopPhone || process.env.SHOP_PHONE || '+91 98765 43210';
    const shopAddress = shop.shopAddress || process.env.SHOP_ADDRESS || 'Tech Arcade, Electronics Market';
    const upiId = shop.upiId || 'apexrepair@upi';

    return `✅ *GOOD NEWS! Your Device is Ready for Delivery*

Hello *${customerName}*,
Your *${device.brand} ${device.model}* (Ticket *#${ticketId}*) has been successfully repaired, inspected, and passed all quality tests.

💰 *Billing Summary:*
• *Total Payable:* ₹${finalCost || 0}
• *Payment Status:* ${paymentStatus || 'UNPAID'}
• *Shop UPI ID:* ${upiId}

📍 *Pickup Location:*
${shopAddress}
⏰ *Working Hours:* 10:00 AM – 8:30 PM (Mon - Sat)
📞 *Support:* ${shopPhone}

You can view your detailed itemized invoice and tracking history here:
${trackingUrl}

Please bring Ticket ID #${ticketId} at the time of pickup!
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
