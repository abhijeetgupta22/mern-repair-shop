import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { RepairTicket } from '../models/RepairTicket.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { Invoice } from '../models/Invoice.js';

export async function seedDatabase() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('[Seed] Database already seeded. Skipping.');
      return;
    }

    console.log('[Seed] Seeding initial repair shop data...');

    // 1. Seed Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    const admin = await Admin.create({
      name: 'Vikram Sharma',
      email: 'admin@techfix.com',
      password: hashedPassword,
      shopName: 'TechFix Pro Care Hub',
      phone: '+91 98765 43210',
      address: 'Shop 104, Tech Arcade, Cyber City, Bangalore',
      upiId: 'techfix@upi',
      subscription: {
        plan: 'PRO',
        status: 'ACTIVE',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        price: 1999,
        billingCycle: 'monthly',
        ticketLimit: 1000
      }
    });

    // 2. Seed Inventory Parts
    const inventoryData = [
      {
        sku: 'DSP-IPH13-OLED',
        name: 'iPhone 13 OLED Display Assembly (OEM)',
        category: 'MOBILE',
        brand: 'Apple Compatible',
        stockQuantity: 4,
        minStockThreshold: 3,
        costPrice: 4200,
        sellingPrice: 6500,
        unit: 'pcs',
        location: 'Mobile Drawer M-1'
      },
      {
        sku: 'BAT-SAMS21-4000',
        name: 'Samsung Galaxy S21 4000mAh Battery',
        category: 'MOBILE',
        brand: 'Samsung OEM',
        stockQuantity: 2, // Low stock!
        minStockThreshold: 3,
        costPrice: 1200,
        sellingPrice: 2200,
        unit: 'pcs',
        location: 'Mobile Drawer M-3'
      },
      {
        sku: 'PRT-USBC-SUB',
        name: 'Universal Type-C Charging Flex Board',
        category: 'MOBILE',
        brand: 'Generic',
        stockQuantity: 15,
        minStockThreshold: 5,
        costPrice: 250,
        sellingPrice: 850,
        unit: 'pcs',
        location: 'Mobile Bin B-2'
      },
      {
        sku: 'DSP-156-FHD-IPS',
        name: '15.6" Slim 30-Pin FHD IPS Screen (1920x1080)',
        category: 'LAPTOP',
        brand: 'BOE / LG',
        stockQuantity: 6,
        minStockThreshold: 2,
        costPrice: 3100,
        sellingPrice: 4800,
        unit: 'pcs',
        location: 'Rack L-1'
      },
      {
        sku: 'SSD-NVME-512GB',
        name: 'Crucial P3 512GB PCIe M.2 NVMe SSD',
        category: 'LAPTOP',
        brand: 'Crucial',
        stockQuantity: 8,
        minStockThreshold: 4,
        costPrice: 2400,
        sellingPrice: 3600,
        unit: 'pcs',
        location: 'Rack L-4'
      },
      {
        sku: 'KBD-DELL-3500',
        name: 'Dell Inspiron 3500 Backlit Keyboard',
        category: 'LAPTOP',
        brand: 'Dell Compatible',
        stockQuantity: 1, // Low stock!
        minStockThreshold: 3,
        costPrice: 850,
        sellingPrice: 1600,
        unit: 'pcs',
        location: 'Rack L-2'
      },
      {
        sku: 'RAM-DDR4-16GB-3200',
        name: 'Corsair Vengeance LPX 16GB DDR4 3200MHz',
        category: 'DESKTOP',
        brand: 'Corsair',
        stockQuantity: 5,
        minStockThreshold: 3,
        costPrice: 2600,
        sellingPrice: 3800,
        unit: 'pcs',
        location: 'Desktop Shelf D-1'
      },
      {
        sku: 'PSU-650W-BRZ',
        name: 'Cooler Master MWE 650W Bronze V2 Power Supply',
        category: 'DESKTOP',
        brand: 'Cooler Master',
        stockQuantity: 3,
        minStockThreshold: 2,
        costPrice: 4100,
        sellingPrice: 5600,
        unit: 'pcs',
        location: 'Desktop Shelf D-4'
      },
      {
        sku: 'THM-PST-MX4',
        name: 'Arctic MX-4 High Performance Thermal Paste (4g)',
        category: 'TOOLS_CONSUMABLES',
        brand: 'Arctic',
        stockQuantity: 12,
        minStockThreshold: 4,
        costPrice: 450,
        sellingPrice: 850,
        unit: 'tubes',
        location: 'Workbench Toolset'
      }
    ];

    for (const item of inventoryData) {
      await InventoryItem.create(item);
    }

    // 3. Seed Repair Tickets
    const sampleTickets = [
      {
        ticketId: 'REP-1001',
        customer: {
          name: 'Rahul Verma',
          phone: '+91 98112 34567',
          email: 'rahul.verma@example.com',
          address: 'Indiranagar, Bangalore'
        },
        device: {
          type: 'LAPTOP',
          brand: 'Dell',
          model: 'XPS 15 (9500)',
          serialNumber: 'DLXPS-99281',
          accessoriesReceived: ['Original 130W USB-C Charger', 'Laptop Sleeve'],
          passcode: '1994'
        },
        issueDescription: 'Screen flickering lines when tilted; heating up rapidly during video calls.',
        status: 'IN_REPAIR',
        statusHistory: [
          { status: 'RECEIVED', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Device intake logged', updatedBy: 'Vikram Sharma' },
          { status: 'DIAGNOSING', timestamp: new Date(Date.now() - 2 * 86400000), note: 'EDP display cable worn out and fans clogged with dust.', updatedBy: 'Vikram Sharma' },
          { status: 'IN_REPAIR', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Replacing EDP cable and applying thermal paste.', updatedBy: 'Vikram Sharma' }
        ],
        technician: 'Vikram Sharma',
        estimatedDeliveryDate: new Date(Date.now() + 1 * 86400000),
        estimatedCost: 3500,
        laborCost: 1500,
        finalCost: 3500,
        paymentStatus: 'UNPAID',
        internalNotes: 'Customer requested backup before thermal service.'
      },
      {
        ticketId: 'REP-1002',
        customer: {
          name: 'Ananya Iyer',
          phone: '+91 98200 88765',
          email: 'ananya.iyer@example.com',
          address: 'Koramangala 4th Block'
        },
        device: {
          type: 'MOBILE',
          brand: 'Apple',
          model: 'iPhone 14 Pro',
          serialNumber: 'F2LXW198PN0',
          accessoriesReceived: ['Spigen Case'],
          passcode: '582011'
        },
        issueDescription: 'Cracked front glass and touch unresponsive on lower half after drop.',
        status: 'READY_FOR_DELIVERY',
        statusHistory: [
          { status: 'RECEIVED', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Intake received', updatedBy: 'Vikram Sharma' },
          { status: 'DIAGNOSING', timestamp: new Date(Date.now() - 3 * 86400000), note: 'OLED panel damaged; logic board intact.', updatedBy: 'Vikram Sharma' },
          { status: 'IN_REPAIR', timestamp: new Date(Date.now() - 2 * 86400000), note: 'OEM OLED assembly installed with TrueTone restored.', updatedBy: 'Vikram Sharma' },
          { status: 'QUALITY_CHECK', timestamp: new Date(Date.now() - 1 * 86400000), note: '32-point hardware sensor & touch calibration passed.', updatedBy: 'Vikram Sharma' },
          { status: 'READY_FOR_DELIVERY', timestamp: new Date(Date.now() - 4 * 3600000), note: 'Device cleaned, sanitized, and packed for pickup.', updatedBy: 'Vikram Sharma' }
        ],
        technician: 'Vikram Sharma',
        estimatedDeliveryDate: new Date(),
        estimatedCost: 7500,
        laborCost: 1000,
        finalCost: 7500,
        paymentStatus: 'PAID',
        internalNotes: 'Customer verified screen before payment via UPI.'
      },
      {
        ticketId: 'REP-1003',
        customer: {
          name: 'Siddharth Rao',
          phone: '+91 97411 22334',
          email: 'sid.rao@example.com',
          address: 'HSR Layout Sector 2'
        },
        device: {
          type: 'DESKTOP',
          brand: 'Custom Built',
          model: 'NZXT H510 Gaming Rig',
          serialNumber: 'RIG-2024-88',
          accessoriesReceived: ['Power Cable'],
          passcode: 'N/A'
        },
        issueDescription: 'Random Blue Screen of Death (BSOD) crashes while gaming; burning smell noticed near SMPS.',
        status: 'DIAGNOSING',
        statusHistory: [
          { status: 'RECEIVED', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Rig checked in for full diagnostics', updatedBy: 'Vikram Sharma' },
          { status: 'DIAGNOSING', timestamp: new Date(Date.now() - 5 * 3600000), note: 'SMPS 12V rail voltage fluctuating. Testing with bench PSU.', updatedBy: 'Vikram Sharma' }
        ],
        technician: 'Vikram Sharma',
        estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000),
        estimatedCost: 6500,
        laborCost: 1200,
        finalCost: 6500,
        paymentStatus: 'UNPAID',
        internalNotes: 'Needs 650W PSU replacement approval.'
      },
      {
        ticketId: 'REP-1004',
        customer: {
          name: 'Pooja Mehta',
          phone: '+91 99011 44556',
          email: 'pooja.mehta@example.com',
          address: 'Whitefield Main Road'
        },
        device: {
          type: 'LAPTOP',
          brand: 'Apple',
          model: 'MacBook Air M2 (13-inch)',
          serialNumber: 'C02G8792MD6R',
          accessoriesReceived: ['35W Dual Charger', 'Incase Sleeve'],
          passcode: '2023'
        },
        issueDescription: 'Coffee spilled on keyboard. Spacebar and shift keys sticking. Battery indicator shows service recommended.',
        status: 'WAITING_PARTS',
        statusHistory: [
          { status: 'RECEIVED', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Received with liquid spill damage', updatedBy: 'Vikram Sharma' },
          { status: 'DIAGNOSING', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Ultrasonic board clean done. Needs new top case keyboard assembly.', updatedBy: 'Vikram Sharma' },
          { status: 'WAITING_PARTS', timestamp: new Date(Date.now() - 8 * 3600000), note: 'Ordered OEM Top Case from distributor. Expected arrival tomorrow.', updatedBy: 'Vikram Sharma' }
        ],
        technician: 'Vikram Sharma',
        estimatedDeliveryDate: new Date(Date.now() + 3 * 86400000),
        estimatedCost: 11500,
        laborCost: 2500,
        finalCost: 11500,
        paymentStatus: 'PARTIAL',
        internalNotes: '50% advance received.'
      },
      {
        ticketId: 'REP-1005',
        customer: {
          name: 'Karan Malhotra',
          phone: '+91 98450 77123',
          email: 'karan.m@example.com',
          address: 'Jayanagar 9th Block'
        },
        device: {
          type: 'MOBILE',
          brand: 'Samsung',
          model: 'Galaxy S22 Ultra',
          serialNumber: 'R5CW301889M',
          accessoriesReceived: ['S-Pen included'],
          passcode: '7741'
        },
        issueDescription: 'Phone does not charge unless cable is pushed upwards forcefully. Moisture warning pops up.',
        status: 'RECEIVED',
        statusHistory: [
          { status: 'RECEIVED', timestamp: new Date(), note: 'Device intake logged. Initial visual inspection shows lint and corrosion in Type-C port.', updatedBy: 'Vikram Sharma' }
        ],
        technician: 'Vikram Sharma',
        estimatedDeliveryDate: new Date(Date.now() + 1 * 86400000),
        estimatedCost: 1800,
        laborCost: 800,
        finalCost: 1800,
        paymentStatus: 'UNPAID',
        internalNotes: 'Check sub-board vs port pin cleaning.'
      }
    ];

    for (const t of sampleTickets) {
      await RepairTicket.create(t);
    }

    // 4. Seed sample Invoices
    await Invoice.create({
      invoiceNumber: 'INV-2026-0001',
      ticketId: 'REP-1002',
      customer: {
        name: 'Ananya Iyer',
        phone: '+91 98200 88765',
        email: 'ananya.iyer@example.com',
        address: 'Koramangala 4th Block'
      },
      deviceSummary: 'Apple iPhone 14 Pro - OEM OLED Display Assembly',
      items: [
        {
          description: 'iPhone 14 Pro OEM OLED Display Assembly',
          type: 'PART',
          quantity: 1,
          unitPrice: 5800,
          total: 5800
        },
        {
          description: 'Display Calibration & Installation Labor',
          type: 'LABOR',
          quantity: 1,
          unitPrice: 1000,
          total: 1000
        }
      ],
      laborFee: 1000,
      subtotal: 6800,
      discount: 300,
      taxRate: 18,
      taxAmount: 1000,
      totalAmount: 7500,
      paidAmount: 7500,
      dueAmount: 0,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      notes: 'Payment received via UPI. 90-day warranty applies.',
      warrantyInfo: '90 Days Service & Touch Warranty on replaced OLED panel.'
    });

    console.log('[Seed] Database successfully seeded with Admin, Inventory, Tickets & Invoices!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
}
