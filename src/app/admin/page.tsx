'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSessionUser,
  getDashboardMetricsAction,
  getProductsAction,
  getOrdersAction,
  getCouponsAction,
  getAuditLogsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  bulkUploadProductsAction,
  updateOrderStatusAction,
  createCouponAction,
  deleteCouponAction,
  loginAction
} from '@/app/actions';
import type { User, Product, Order, Coupon, AuditLog } from '@/lib/db';
import { BarChart3, ShoppingCart, Users, BadgeAlert, Plus, Edit2, Trash2, Check, X, FileSpreadsheet, Package, AlertTriangle, ShieldCheck, Tag, History } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('admin@infinitytraders.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Active board tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'orders' | 'coupons' | 'logs'>('metrics');

  // Loaded database items
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    sku: '', brand: '', category: 'Footwear', name: '', description: '',
    mrp: '', sellingPrice: '', stockQuantity: '', color: '', material: '',
    width: 'Standard', sizes: '7,8,9,10,11', images: ''
  });

  // Order status update states
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatchDetails, setDispatchDetails] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED'>('PENDING');

  // Coupon create states
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '', minOrderValue: '', categoryRestriction: ''
  });

  // Excel Bulk upload simulation state
  const [excelDataInput, setExcelDataInput] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const sessionUser = await getSessionUser();
    setLoading(false);
    if (sessionUser && sessionUser.role !== 'CUSTOMER') {
      setUser(sessionUser);
      loadAdminData();
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await loginAction(loginEmail, loginPassword, false);
    if (res.success && res.user && res.user.role !== 'CUSTOMER') {
      window.location.reload();
    } else {
      setLoginError(res.error || 'Access Denied. Admins and Managers only.');
    }
  };

  const loadAdminData = async () => {
    const met = await getDashboardMetricsAction();
    if (met.success) setMetrics(met.metrics);

    const prods = await getProductsAction();
    setProducts(prods);

    const ords = await getOrdersAction();
    if (ords.success && ords.orders) setOrders(ords.orders);

    const coups = await getCouponsAction();
    setCoupons(coups);

    const logs = await getAuditLogsAction();
    if (logs.success && logs.logs) setAuditLogs(logs.logs);
  };

  // Product submit (create or update)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = productForm.sizes.split(',').map(s => Number(s.trim())).filter(s => !isNaN(s));
    const imagesArray = productForm.images.split(',').map(img => img.trim()).filter(img => img.length > 0);

    const payload = {
      sku: productForm.sku,
      brand: productForm.brand,
      category: productForm.category,
      name: productForm.name,
      description: productForm.description,
      mrp: Number(productForm.mrp),
      sellingPrice: Number(productForm.sellingPrice),
      discountPercentage: Math.max(0, Math.round(((Number(productForm.mrp) - Number(productForm.sellingPrice)) / Number(productForm.mrp)) * 100)),
      stockQuantity: Number(productForm.stockQuantity),
      color: productForm.color,
      material: productForm.material,
      width: productForm.width,
      sizes: sizesArray,
      images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
      isNewArrival: true,
      isBestSeller: false,
      isTrending: false
    };

    let res;
    if (editingProduct) {
      res = await updateProductAction(editingProduct.id, payload);
    } else {
      res = await createProductAction(payload);
    }

    if (res.success) {
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      loadAdminData();
    } else {
      alert(res.error || 'Product operation failed.');
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      name: p.name,
      description: p.description,
      mrp: p.mrp.toString(),
      sellingPrice: p.sellingPrice.toString(),
      stockQuantity: p.stockQuantity.toString(),
      color: p.color,
      material: p.material,
      width: p.width,
      sizes: p.sizes.join(','),
      images: p.images.join(',')
    });
    setShowProductForm(true);
  };

  const handleDeleteProductClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await deleteProductAction(id);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Delete failed.');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      sku: '', brand: '', category: 'Footwear', name: '', description: '',
      mrp: '', sellingPrice: '', stockQuantity: '', color: '', material: '',
      width: 'Standard', sizes: '7,8,9,10,11', images: ''
    });
  };

  // Order Dispatch / Courier Update Submit
  const handleOrderUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;

    const payload: any = { orderStatus: selectedStatus };
    if (selectedStatus === 'DISPATCHED') {
      payload.courierName = courierName;
      payload.trackingNumber = trackingNumber;
      payload.dispatchDetails = dispatchDetails;
    }

    const res = await updateOrderStatusAction(updatingOrder.id, payload);
    if (res.success) {
      setUpdatingOrder(null);
      setCourierName('');
      setTrackingNumber('');
      setDispatchDetails('');
      loadAdminData();
    } else {
      alert(res.error || 'Status update failed.');
    }
  };

  // Bulk products mock Excel parser
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkMessage('');
    try {
      // Expect CSV/TSV like spreadsheet text
      // Headers: SKU, Brand, Category, Name, Price, Stock
      const rows = excelDataInput.split('\n').map(row => row.split('\t'));
      if (rows.length < 2) {
        setBulkMessage('Please paste valid tab-separated Excel rows.');
        return;
      }

      const productsArray = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5 || !row[0]) continue;
        productsArray.push({
          sku: row[0],
          brand: row[1],
          category: row[2],
          name: row[3],
          sellingPrice: Number(row[4]),
          stockQuantity: Number(row[5]) || 15
        });
      }

      const res = await bulkUploadProductsAction(productsArray);
      if (res.success) {
        setBulkMessage(`Successfully uploaded ${res.count} products from spreadsheet simulation.`);
        setExcelDataInput('');
        loadAdminData();
      } else {
        setBulkMessage(res.error || 'Excel simulation upload failed.');
      }
    } catch (err: any) {
      setBulkMessage('Failed to parse text: ' + err.message);
    }
  };

  // Coupon Submit
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCouponAction({
      code: couponForm.code.toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minOrderValue: Number(couponForm.minOrderValue),
      categoryRestriction: couponForm.categoryRestriction || undefined,
      isActive: true
    });

    if (res.success) {
      setShowCouponForm(false);
      setCouponForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', categoryRestriction: '' });
      loadAdminData();
    } else {
      alert(res.error || 'Failed to create coupon.');
    }
  };

  const handleDeleteCouponClick = async (id: string) => {
    if (!confirm('Deactivate this coupon?')) return;
    const res = await deleteCouponAction(id);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-xs text-white/50 font-light">
        Loading Administration Session...
      </div>
    );
  }

  // --- RENDER ADMIN LOGIN PANEL ---
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Security Portal</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-white">
            Admin Authorization
          </h1>
          <p className="text-xs text-white/50 font-light">
            Restricted access to Infinity Traders distribution staff.
          </p>
        </div>

        <div className="bg-[#141821]/50 border border-white/5 p-6 rounded-lg backdrop-blur-md space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs p-3 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/60">Staff Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full input-premium text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/60">Staff Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full input-premium text-xs"
              />
            </div>

            <div className="bg-accent-teal/5 border border-accent-teal/20 p-3 rounded text-[10px] text-accent-teal leading-relaxed">
              <span>Demo Staff Login:</span>
              <ul className="list-disc pl-4 mt-1 font-semibold">
                <li>Super Admin: admin@infinitytraders.com / admin123</li>
                <li>Store Manager: manager@infinitytraders.com / manager123</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-widest rounded"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER FULL ADMIN BOARD ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-teal font-semibold">Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase mt-1">
            Infinity Management Panel
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Staff: <strong className="text-white">{user.name}</strong> (Role: {user.role})
          </p>
        </div>
        <Link
          href="/"
          className="btn-secondary px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded"
        >
          View Storefront
        </Link>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: 'metrics', label: 'Metrics Overview', icon: BarChart3 },
          { id: 'products', label: 'Product Catalog Manager', icon: Package },
          { id: 'orders', label: 'Orders & Tracking', icon: ShoppingCart },
          { id: 'coupons', label: 'Marketing & Coupons', icon: Tag },
          { id: 'logs', label: 'Super Audit Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          if (tab.id === 'logs' && user.role !== 'SUPER_ADMIN') return null; // restrict audit logs
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 rounded transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-teal text-background'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Boards Content */}
      <div className="bg-[#141821]/15 border border-white/5 rounded-lg p-6 min-h-[50vh] backdrop-blur-md">
        
        {/* TAB 1: METRICS OVERVIEW */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1f2833]/15 border border-white/5 p-5 rounded-lg">
                <span className="text-[10px] uppercase text-white/40 tracking-wider">Total Sales Revenue</span>
                <span className="text-xl sm:text-2xl font-bold text-white block mt-1">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-accent-teal block mt-1">100% Tax Compliant</span>
              </div>
              <div className="bg-[#1f2833]/15 border border-white/5 p-5 rounded-lg">
                <span className="text-[10px] uppercase text-white/40 tracking-wider">Orders Settle Volume</span>
                <span className="text-xl sm:text-2xl font-bold text-white block mt-1">{metrics.totalOrders} Orders</span>
                <span className="text-[10px] text-white/50 block mt-1">AOV: ₹{metrics.averageOrderValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#1f2833]/15 border border-white/5 p-5 rounded-lg">
                <span className="text-[10px] uppercase text-white/40 tracking-wider">Inventory Low Stocks</span>
                <span className="text-xl sm:text-2xl font-bold text-white block mt-1">{metrics.lowStockProducts.length} Articles</span>
                <span className="text-[10px] text-warning block mt-1">{metrics.outOfStockCount} Out of Stock</span>
              </div>
              <div className="bg-[#1f2833]/15 border border-white/5 p-5 rounded-lg">
                <span className="text-[10px] uppercase text-white/40 tracking-wider">Conversion Ratio</span>
                <span className="text-xl sm:text-2xl font-bold text-white block mt-1">{metrics.conversionRate}%</span>
                <span className="text-[10px] text-white/50 block mt-1">{metrics.newCustomersCount} Customers</span>
              </div>
            </div>

            {/* Low stock alerts */}
            {metrics.lowStockProducts.length > 0 && (
              <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-warning flex items-center gap-1.5">
                  <BadgeAlert className="w-4 h-4" /> Low Inventory Alerts (Less than 5 Left)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {metrics.lowStockProducts.map((p: Product) => (
                    <div key={p.id} className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/80">{p.name} ({p.brand})</span>
                      <strong className="text-warning">Only {p.stockQuantity} Left</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Products */}
            <div className="bg-[#1f2833]/5 border border-white/5 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Top 5 Best Selling Articles</h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 pb-2 text-white/40 uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Brand</th>
                    <th className="pb-2 text-center">Quantity Sold</th>
                    <th className="pb-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {metrics.topProducts.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 font-medium text-white">{item.name}</td>
                      <td className="py-2.5">{item.brand}</td>
                      <td className="py-2.5 text-center">{item.count} items</td>
                      <td className="py-2.5 text-right">₹{item.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Active Product Database</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    resetProductForm();
                    setShowProductForm(!showProductForm);
                  }}
                  className="btn-primary px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 rounded"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {/* Add / Edit Form */}
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="bg-[#1f2833]/15 border border-white/10 p-6 rounded-lg space-y-4 text-xs">
                <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal border-b border-white/5 pb-2">
                  {editingProduct ? 'Edit Product Details' : 'Create New Product Article'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-white/60">SKU Code</label>
                    <input
                      type="text" required placeholder="e.g. ENA-AXI-01"
                      value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Brand</label>
                    <input
                      type="text" required placeholder="e.g. ENA Athletics"
                      value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Category</label>
                    <select
                      value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full bg-[#141821] border border-white/10 rounded p-2 text-xs text-white"
                    >
                      <option value="Footwear">Footwear</option>
                      <option value="Slippers">Slippers</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-white/60">Product Display Name</label>
                    <input
                      type="text" required placeholder="Product Name"
                      value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-white/60">Product Description</label>
                    <textarea
                      required placeholder="Product description"
                      value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full input-premium text-xs h-16"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">MRP (₹)</label>
                    <input
                      type="number" required placeholder="Original MRP"
                      value={productForm.mrp} onChange={(e) => setProductForm({...productForm, mrp: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Selling Price (₹)</label>
                    <input
                      type="number" required placeholder="Store Selling Price"
                      value={productForm.sellingPrice} onChange={(e) => setProductForm({...productForm, sellingPrice: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Stock Quantity</label>
                    <input
                      type="number" required placeholder="Stock Count"
                      value={productForm.stockQuantity} onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Color</label>
                    <input
                      type="text" placeholder="Color name"
                      value={productForm.color} onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Material</label>
                    <input
                      type="text" placeholder="Material type"
                      value={productForm.material} onChange={(e) => setProductForm({...productForm, material: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/60">Width</label>
                    <select
                      value={productForm.width} onChange={(e) => setProductForm({...productForm, width: e.target.value})}
                      className="w-full bg-[#141821] border border-white/10 rounded p-2 text-xs text-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Wide">Wide</option>
                      <option value="Narrow">Narrow</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-white/60">Available Sizes (Comma separated)</label>
                    <input
                      type="text" placeholder="e.g. 7,8,9,10"
                      value={productForm.sizes} onChange={(e) => setProductForm({...productForm, sizes: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-white/60">Image URLs (Comma separated)</label>
                    <input
                      type="text" placeholder="Paste image address"
                      value={productForm.images} onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button" onClick={() => setShowProductForm(false)}
                    className="btn-secondary px-4 py-2 text-xs uppercase font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2 text-xs uppercase font-bold rounded"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Bulk Upload Spreadsheet Paste Box */}
            <div className="bg-[#1f2833]/5 border border-white/5 p-6 rounded-lg space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-accent-teal" /> Bulk Product Upload Simulation (Excel/TSV)
              </h3>
              <p className="text-[11px] text-white/50 font-light leading-relaxed">
                Paste tabular columns directly copied from your product Excel spreadsheet.
                Required column sequence (separated by Tabs): <br />
                <strong>SKU &emsp; Brand &emsp; Category &emsp; Product Name &emsp; SellingPrice &emsp; Stock</strong>
              </p>
              <form onSubmit={handleBulkUpload} className="space-y-3">
                <textarea
                  placeholder="SKU-01	BrandName	Footwear	Sneaker Pro	4999	20"
                  value={excelDataInput}
                  onChange={(e) => setExcelDataInput(e.target.value)}
                  className="w-full input-premium text-xs h-20 font-mono"
                />
                <button
                  type="submit"
                  disabled={!excelDataInput.trim()}
                  className="btn-secondary px-4 py-2 text-[10px] uppercase tracking-widest font-semibold rounded"
                >
                  Simulate Excel Ingest
                </button>
                {bulkMessage && (
                  <p className="text-xs text-accent-teal font-semibold mt-1">{bulkMessage}</p>
                )}
              </form>
            </div>

            {/* Products Table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 pb-2 text-white/40 uppercase">
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Brand</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-center">Stock</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-mono">{p.sku}</td>
                      <td className="py-3 font-semibold text-white line-clamp-1 max-w-xs">{p.name}</td>
                      <td className="py-3">{p.brand}</td>
                      <td className="py-3">{p.category}</td>
                      <td className="py-3 text-right">₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-center">
                        <span className={p.stockQuantity <= 5 ? 'text-warning font-bold' : 'text-white'}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1 border border-white/10 hover:border-accent-teal hover:text-accent-teal rounded transition-colors inline-block"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(p.id)}
                          className="p-1 border border-white/10 hover:border-red-500 hover:text-red-400 rounded transition-colors inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
              Customer Orders Fulfillment & Return Request Tracker
            </h2>

            {/* Courier Dispatch update Modal overlay */}
            {updatingOrder && (
              <form onSubmit={handleOrderUpdateSubmit} className="bg-[#1f2833]/20 border border-accent-teal/20 p-5 rounded-lg space-y-4 text-xs max-w-md">
                <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal">
                  Update Order Logistics - {updatingOrder.id}
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-white/60">Fulfillment Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full bg-[#141821] border border-white/10 rounded p-2 text-xs text-white"
                  >
                    <option value="PENDING">PENDING Fulfillment</option>
                    <option value="DISPATCHED">DISPATCHED Shipment</option>
                    <option value="DELIVERED">DELIVERED Confirmation</option>
                    <option value="RETURNED">RETURNED Refund</option>
                  </select>
                </div>

                {selectedStatus === 'DISPATCHED' && (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-white/60">Courier Partner Name</label>
                      <input
                        type="text" required placeholder="e.g. Shiprocket / Blue Dart / Delhivery"
                        value={courierName} onChange={(e) => setCourierName(e.target.value)}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60">Logistics Tracking Number</label>
                      <input
                        type="text" required placeholder="e.g. TRK123456789"
                        value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full input-premium text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60">Dispatch Route Details</label>
                      <input
                        type="text" placeholder="e.g. Dispatched from Dhanbad Depot via express road"
                        value={dispatchDetails} onChange={(e) => setDispatchDetails(e.target.value)}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button" onClick={() => setUpdatingOrder(null)}
                    className="btn-secondary px-3 py-1.5 text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-3 py-1.5 text-[10px] font-bold rounded"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            )}

            {/* Orders listing table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 pb-2 text-white/40 uppercase">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2 text-center">Date</th>
                    <th className="pb-2 text-right">Items</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {orders.map((o) => {
                    const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr key={o.id}>
                        <td className="py-3 font-mono font-semibold text-white">{o.id}</td>
                        <td className="py-3">
                          <p className="font-semibold text-white">{o.customerName}</p>
                          <p className="text-[10px] text-white/40">{o.customerEmail} | Pincode: {o.shippingAddress.pincode}</p>
                        </td>
                        <td className="py-3 text-center">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 text-center">{totalQty} articles</td>
                        <td className="py-3 text-right font-semibold text-white">₹{o.finalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.orderStatus === 'DELIVERED' ? 'bg-[#10b981]/15 text-[#10b981]' :
                            o.orderStatus === 'DISPATCHED' ? 'bg-accent-teal/15 text-accent-teal' :
                            'bg-warning/15 text-warning'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setUpdatingOrder(o);
                              setSelectedStatus(o.orderStatus);
                            }}
                            className="btn-secondary px-2.5 py-1 text-[10px] uppercase tracking-wider"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MARKETING & COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Coupon Codes Manager</h2>
              <button
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="btn-primary px-3 py-1.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            {showCouponForm && (
              <form onSubmit={handleCouponSubmit} className="bg-[#1f2833]/15 border border-white/10 p-5 rounded-lg space-y-3 text-xs max-w-md">
                <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal border-b border-white/5 pb-1">
                  Create Promotional Coupon
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-white/60">Coupon Code</label>
                      <input
                        type="text" required placeholder="e.g. FESTIVE20"
                        value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/60">Discount Type</label>
                      <select
                        value={couponForm.discountType} onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as any})}
                        className="w-full bg-[#141821] border border-white/10 rounded p-2 text-xs text-white"
                      >
                        <option value="PERCENTAGE">PERCENTAGE Off</option>
                        <option value="FIXED">FIXED Amount Off</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-white/60">Discount Value</label>
                      <input
                        type="number" required placeholder="e.g. 10 or 500"
                        value={couponForm.discountValue} onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/60">Min Order value (₹)</label>
                      <input
                        type="number" required placeholder="e.g. 999"
                        value={couponForm.minOrderValue} onChange={(e) => setCouponForm({...couponForm, minOrderValue: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60">Category Restriction (Optional)</label>
                    <input
                      type="text" placeholder="e.g. Footwear"
                      value={couponForm.categoryRestriction} onChange={(e) => setCouponForm({...couponForm, categoryRestriction: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button" onClick={() => setShowCouponForm(false)}
                    className="btn-secondary px-3 py-1.5 text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-3 py-1.5 text-[10px] font-bold rounded"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            )}

            {/* Coupons listing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#1f2833]/15 border border-white/5 p-4 rounded-lg flex justify-between items-start text-xs text-white/80"
                >
                  <div className="space-y-1">
                    <span className="bg-accent-teal/10 text-accent-teal font-bold px-2 py-0.5 rounded tracking-widest text-[10px]">
                      {c.code}
                    </span>
                    <p className="font-semibold text-white mt-2">
                      Discount: {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                    </p>
                    <p className="text-[10px] text-white/50">Minimum Order: ₹{c.minOrderValue}</p>
                    {c.categoryRestriction && (
                      <p className="text-[10px] text-accent-teal">Category Restriction: {c.categoryRestriction}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCouponClick(c.id)}
                    className="text-red-400 hover:text-red-300 p-1 border border-red-500/10 hover:border-red-500/30 rounded"
                    aria-label="Deactivate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUPER AUDIT LOGS */}
        {activeTab === 'logs' && user.role === 'SUPER_ADMIN' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
              Super Admin System Audit Trail
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono leading-relaxed">
                <thead>
                  <tr className="border-b border-white/5 pb-2 text-white/40 uppercase">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">User / Operator</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 text-white/50">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-white font-semibold">{log.userEmail}</td>
                      <td className="py-2.5 text-accent-teal uppercase">{log.action}</td>
                      <td className="py-2.5 max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
