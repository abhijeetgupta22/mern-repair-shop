import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const inventoryItemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['LAPTOP', 'DESKTOP', 'MOBILE', 'ACCESSORIES', 'TOOLS_CONSUMABLES'],
    default: 'LAPTOP'
  },
  brand: { type: String, default: 'Generic' },
  stockQuantity: { type: Number, default: 0 },
  minStockThreshold: { type: Number, default: 3 },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'pcs' },
  location: { type: String, default: 'Shelf A' },
  description: { type: String, default: '' },
  compatibleModels: [{ type: String }]
}, { timestamps: true });

let MongooseInventory = null;
try {
  MongooseInventory = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
} catch (e) {}

export const InventoryItem = createAdapter('inventory', MongooseInventory);
