import express from 'express';
import { InventoryItem } from '../models/InventoryItem.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();

// GET /api/inventory - List items with category & search filter
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let items = await InventoryItem.find();

    if (category && category !== 'ALL') {
      items = items.filter(item => item.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q))
      );
    }

    if (lowStock === 'true') {
      items = items.filter(item => Number(item.stockQuantity) <= Number(item.minStockThreshold));
    }

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

// GET /api/inventory/stats/low-stock - Summary count and items
router.get('/stats/low-stock', protectAdmin, async (req, res) => {
  try {
    const all = await InventoryItem.find();
    const lowStockItems = all.filter(item => Number(item.stockQuantity) <= Number(item.minStockThreshold));

    res.json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch low stock alerts' });
  }
});

// POST /api/inventory - Add new product
router.post('/', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      brand,
      stockQuantity = 0,
      minStockThreshold = 3,
      costPrice = 0,
      sellingPrice,
      unit = 'pcs',
      location = 'Shelf A',
      description = '',
      compatibleModels = []
    } = req.body;

    if (!name || !sellingPrice) {
      return res.status(400).json({ success: false, message: 'Item name and selling price are required' });
    }

    const generatedSku = sku || `SKU-${category ? category.substring(0, 3) : 'GEN'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newItem = await InventoryItem.create({
      name,
      sku: generatedSku.toUpperCase(),
      category: category || 'LAPTOP',
      brand: brand || 'Generic',
      stockQuantity: Number(stockQuantity),
      minStockThreshold: Number(minStockThreshold),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      unit,
      location,
      description,
      compatibleModels: Array.isArray(compatibleModels) ? compatibleModels : []
    });

    res.status(201).json({
      success: true,
      message: 'Product added to inventory successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ success: false, message: 'Failed to create inventory item' });
  }
});

// PATCH /api/inventory/:id/adjust - Add or subtract stock quantity
router.patch('/:id/adjust', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, amount = 1, reason = 'Manual adjustment' } = req.body;

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const numericAmount = Math.max(1, Number(amount) || 1);
    let newQuantity = Number(item.stockQuantity) || 0;

    if (action === 'SUBTRACT') {
      newQuantity = Math.max(0, newQuantity - numericAmount);
    } else {
      // Default: 'ADD'
      newQuantity += numericAmount;
    }

    const updated = await InventoryItem.findByIdAndUpdate(
      id,
      { $set: { stockQuantity: newQuantity } },
      { new: true }
    );

    res.json({
      success: true,
      message: `Stock updated: ${item.name} is now ${newQuantity} ${item.unit || 'pcs'}`,
      item: updated,
      isLowStock: newQuantity <= (updated.minStockThreshold || 3)
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust stock' });
  }
});

// PUT /api/inventory/:id - Update product details
router.put('/:id', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.stockQuantity !== undefined) {
      updateData.stockQuantity = Number(updateData.stockQuantity);
    }
    if (updateData.sellingPrice !== undefined) {
      updateData.sellingPrice = Number(updateData.sellingPrice);
    }

    const updated = await InventoryItem.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', protectAdmin, requireActiveSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InventoryItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

export default router;
