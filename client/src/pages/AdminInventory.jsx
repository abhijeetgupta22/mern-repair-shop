import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Laptop,
  Smartphone,
  Monitor,
  Wrench,
  Trash2,
  Edit2,
  Tag,
  MapPin,
  TrendingUp,
  PackagePlus
} from 'lucide-react';
import api from '../services/api';
import { useSubscription } from '../context/SubscriptionContext';

export default function AdminInventory() {
  const { openPaywall } = useSubscription();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'LAPTOP',
    brand: '',
    stockQuantity: 5,
    minStockThreshold: 3,
    costPrice: '',
    sellingPrice: '',
    unit: 'pcs',
    location: 'Rack A-1',
    description: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (search) params.search = search;
      if (onlyLowStock) params.lowStock = 'true';

      const res = await api.get('/inventory', { params });
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter, onlyLowStock]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  // DIRECT ADD / SUBTRACT STOCK
  const handleStockAdjust = async (id, action, amount = 1) => {
    try {
      const res = await api.patch(`/inventory/${id}/adjust`, { action, amount });
      if (res.data.success) {
        // Update local state instantly
        setItems(prev => prev.map(item => (item._id === id || item.id === id ? res.data.item : item)));
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to adjust inventory quantities');
      } else {
        alert(err.response?.data?.message || 'Error updating stock');
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory', {
        ...newItem,
        stockQuantity: Number(newItem.stockQuantity) || 0,
        minStockThreshold: Number(newItem.minStockThreshold) || 3,
        costPrice: Number(newItem.costPrice) || 0,
        sellingPrice: Number(newItem.sellingPrice) || 0
      });

      if (res.data.success) {
        setShowAddModal(false);
        fetchInventory();
        setNewItem({
          name: '',
          sku: '',
          category: 'LAPTOP',
          brand: '',
          stockQuantity: 5,
          minStockThreshold: 3,
          costPrice: '',
          sellingPrice: '',
          unit: 'pcs',
          location: 'Rack A-1',
          description: ''
        });
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to add inventory items');
      } else {
        alert(err.response?.data?.message || 'Failed to add product');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from inventory?')) return;
    try {
      const res = await api.delete(`/inventory/${id}`);
      if (res.data.success) {
        setItems(prev => prev.filter(item => item._id !== id && item.id !== id));
      }
    } catch (err) {
      if (err.response?.status === 402) {
        openPaywall('Active subscription required to delete inventory');
      } else {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Inventory & Spare Parts Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Directly increment (+) or decrement (-) product stock, monitor reorder thresholds, and track parts cost.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
        >
          <PackagePlus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spare part name, SKU, brand..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category tabs (scrollable on mobile) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full no-scrollbar">
            {['ALL', 'LAPTOP', 'DESKTOP', 'MOBILE', 'TOOLS_CONSUMABLES'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat === 'TOOLS_CONSUMABLES' ? 'Tools' : cat}
              </button>
            ))}
          </div>

          {/* Low stock toggle */}
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
              onlyLowStock
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Inventory Table & Mobile Cards */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Item / SKU</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3 text-center">Stock Adjustment (+ / -)</th>
                <th className="pb-3 px-3 text-right">Cost Price</th>
                <th className="pb-3 px-3 text-right">Selling Price</th>
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((item) => {
                const isLow = Number(item.stockQuantity) <= Number(item.minStockThreshold);
                const itemId = item._id || item.id;

                return (
                  <tr key={itemId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-blue-600 dark:text-blue-400">{item.sku}</span>
                        <span>•</span>
                        <span>{item.brand}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    {/* DIRECT + / - STOCK QUANTITY CONTROLS */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        {/* Minus button */}
                        <button
                          onClick={() => handleStockAdjust(itemId, 'SUBTRACT', 1)}
                          title="Subtract 1 from stock"
                          className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-200 hover:text-rose-600 flex items-center justify-center shadow-sm active:scale-95 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* Current Stock Display */}
                        <div className="px-2 text-center min-w-[50px]">
                          <span className={`text-sm font-extrabold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {item.stockQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1 font-normal">
                            {item.unit || 'pcs'}
                          </span>
                        </div>

                        {/* Plus button */}
                        <button
                          onClick={() => handleStockAdjust(itemId, 'ADD', 1)}
                          title="Add 1 to stock"
                          className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center justify-center shadow-sm active:scale-95 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isLow && (
                        <div className="text-[10px] font-bold text-rose-500 mt-1 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock (Min {item.minStockThreshold})</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-medium text-slate-500 whitespace-nowrap">
                      ₹{item.costPrice || 0}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ₹{item.sellingPrice}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location || 'Shelf A'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteItem(itemId)}
                        title="Delete item"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Product Cards View (< 768px) */}
        <div className="md:hidden space-y-3">
          {items.map((item) => {
            const isLow = Number(item.stockQuantity) <= Number(item.minStockThreshold);
            const itemId = item._id || item.id;

            return (
              <div
                key={itemId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                {/* Header: Item Title & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                      <span className="text-blue-600 dark:text-blue-400">{item.sku}</span>
                      <span>•</span>
                      <span>{item.brand}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex-shrink-0">
                    {item.category}
                  </span>
                </div>

                {/* Stock Controls for Mobile (Large touch targets) */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Stock:
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Big Minus Button */}
                    <button
                      onClick={() => handleStockAdjust(itemId, 'SUBTRACT', 1)}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-200 hover:text-rose-600 flex items-center justify-center font-bold text-base shadow-sm active:scale-90 transition"
                      aria-label="Decrease stock"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="text-center min-w-[48px]">
                      <span className={`text-base font-black ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.stockQuantity}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1">
                        {item.unit || 'pcs'}
                      </span>
                    </div>

                    {/* Big Plus Button */}
                    <button
                      onClick={() => handleStockAdjust(itemId, 'ADD', 1)}
                      className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-blue-600/20 active:scale-90 transition"
                      aria-label="Increase stock"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isLow && (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-[11px] font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Low Stock Alert! Minimum threshold is {item.minStockThreshold} {item.unit || 'pcs'}</span>
                  </div>
                )}

                {/* Pricing & Location */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700/80">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400">Selling Price:</div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      ₹{item.sellingPrice}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <div className="text-[10px] text-slate-400">Location:</div>
                    <div className="font-medium text-slate-600 dark:text-slate-300">
                      {item.location || 'Shelf A'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(itemId)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Add New Product / Part
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Create an inventory entry with stock alerts and pricing.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Part Name *</label>
                <input
                  type="text" required value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. iPhone 13 Pro OLED Screen"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="LAPTOP">Laptop Part</option>
                    <option value="DESKTOP">Desktop Part</option>
                    <option value="MOBILE">Mobile Part</option>
                    <option value="ACCESSORIES">Accessories</option>
                    <option value="TOOLS_CONSUMABLES">Tools / Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                  <input
                    type="text" value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    placeholder="e.g. Apple / Dell / Crucial"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Stock Qty *</label>
                  <input
                    type="number" required value={newItem.stockQuantity}
                    onChange={(e) => setNewItem({ ...newItem, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Alert Threshold</label>
                  <input
                    type="number" value={newItem.minStockThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price (₹)</label>
                  <input
                    type="number" value={newItem.costPrice}
                    onChange={(e) => setNewItem({ ...newItem, costPrice: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number" required value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location in Shop</label>
                  <input
                    type="text" value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="e.g. Shelf B-2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text" value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="pcs / units"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Save Product to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
