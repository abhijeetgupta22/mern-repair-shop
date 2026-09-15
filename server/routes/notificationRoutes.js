import express from 'express';
import { NotificationLog } from '../models/NotificationLog.js';
import { RepairTicket } from '../models/RepairTicket.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';
import { whatsappService } from '../services/whatsappService.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// GET /api/notifications/logs - View notification history
router.get('/logs', protectAdmin, async (req, res) => {
  try {
    const { ticketId, channel } = req.query;
    let logs = await NotificationLog.find();

    if (ticketId) {
      logs = logs.filter(l => l.ticketId === ticketId);
    }
    if (channel) {
      logs = logs.filter(l => l.channel === channel);
    }

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notification logs' });
  }
});

// POST /api/notifications/whatsapp/preview - Build formatted message & wa.me link
router.post('/whatsapp/preview', protectAdmin, async (req, res) => {
  try {
    const { ticketId, triggerType } = req.body;
    const ticket = await RepairTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track/${ticket.ticketId}`;
    let message = '';

    if (triggerType === 'INTAKE_CONFIRMATION') {
      message = whatsappService.generateIntakeMessage({
        ticketId: ticket.ticketId,
        customerName: ticket.customer?.name,
        device: ticket.device,
        issue: ticket.issueDescription,
        estimatedDeliveryDate: ticket.estimatedDeliveryDate,
        trackingUrl
      });
    } else {
      // READY_FOR_DELIVERY or generic
      message = whatsappService.generateReadyForDeliveryMessage({
        ticketId: ticket.ticketId,
        customerName: ticket.customer?.name,
        device: ticket.device,
        finalCost: ticket.finalCost || ticket.estimatedCost,
        paymentStatus: ticket.paymentStatus,
        trackingUrl
      });
    }

    const waUrl = whatsappService.generateWhatsAppUrl(ticket.customer?.phone, message);

    res.json({
      success: true,
      ticketId: ticket.ticketId,
      customerName: ticket.customer?.name,
      customerPhone: ticket.customer?.phone,
      message,
      waUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate WhatsApp preview' });
  }
});

// POST /api/notifications/whatsapp/send-direct - Record log when admin clicks to dispatch via WhatsApp Web/App
router.post('/whatsapp/send-direct', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { ticketId, customerName, customerPhone, triggerType, messageBody } = req.body;

    const log = await whatsappService.logNotification({
      ticketId,
      customerName,
      customerContact: customerPhone,
      triggerType: triggerType || 'CUSTOM',
      messageBody,
      meta: { manualDispatch: true }
    });

    res.json({ success: true, message: 'WhatsApp dispatch recorded in logs', log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record WhatsApp log' });
  }
});

// POST /api/notifications/email/send - Dispatch email for intake or delivery
router.post('/email/send', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { ticketId, triggerType } = req.body;
    const ticket = await RepairTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!ticket.customer?.email) {
      return res.status(400).json({ success: false, message: 'Customer does not have an email address specified' });
    }

    const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track/${ticket.ticketId}`;
    let result = null;

    if (triggerType === 'INTAKE_CONFIRMATION') {
      result = await emailService.sendIntakeEmail({
        ticketId: ticket.ticketId,
        customerName: ticket.customer.name,
        customerEmail: ticket.customer.email,
        device: ticket.device,
        issue: ticket.issueDescription,
        estimatedDeliveryDate: ticket.estimatedDeliveryDate,
        trackingUrl
      });
    } else {
      result = await emailService.sendReadyForDeliveryEmail({
        ticketId: ticket.ticketId,
        customerName: ticket.customer.name,
        customerEmail: ticket.customer.email,
        device: ticket.device,
        finalCost: ticket.finalCost || ticket.estimatedCost,
        paymentStatus: ticket.paymentStatus,
        trackingUrl
      });
    }

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error || 'Failed to send email' });
    }

    res.json({
      success: true,
      message: `Email sent to ${ticket.customer.email}`,
      result
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

export default router;
