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
  getPincodesAction,
  addOrUpdatePincodeAction,
  deletePincodeAction,
  loginAction,
  getNewsletterSubscribersAction,
  deleteNewsletterSubscriberAction
} from '@/app/actions';
import type { User, Product, Order, Coupon, PincodeServiceability, AuditLog, NewsletterSubscriber } from '@/lib/db';
import { BarChart3, ShoppingCart, Users, BadgeAlert, Plus, Edit2, Trash2, Check, X, FileSpreadsheet, Package, AlertTriangle, ShieldCheck, Tag, History, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('admin@infinitytraders.shop');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Active board tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'orders' | 'coupons' | 'pincodes' | 'logs' | 'newsletter'>('metrics');

  // Loaded database items
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pincodes, setPincodes] = useState<PincodeServiceability[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  // Pincode CRUD states
  const [showPincodeForm, setShowPincodeForm] = useState(false);
  const [pincodeForm, setPincodeForm] = useState({
    pincode: '', serviceable: true, estimatedDays: '4', state: ''
  });

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

    const pins = await getPincodesAction();
    if (pins.success && pins.pincodes) setPincodes(pins.pincodes);

    const subs = await getNewsletterSubscribersAction();
    setSubscribers(subs);
  };

  // Product submit (create or update)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = productForm.sizes.split(',')
      .map(s => {
        const val = s.trim();
        const num = Number(val);
        return isNaN(num) || val === '' ? val : num;
      })
      .filter(s => s !== '');
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

  // Pincode Submit
  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeForm.pincode || pincodeForm.pincode.length !== 6) {
      alert('Pincode must be exactly 6 digits.');
      return;
    }

    const res = await addOrUpdatePincodeAction(pincodeForm.pincode, {
      serviceable: pincodeForm.serviceable,
      estimatedDays: Number(pincodeForm.estimatedDays),
      state: pincodeForm.state
    });

    if (res.success) {
      setShowPincodeForm(false);
      setPincodeForm({ pincode: '', serviceable: true, estimatedDays: '4', state: '' });
      loadAdminData();
    } else {
      alert(res.error || 'Failed to update pincode.');
    }
  };

  // Pincode Delete
  const handlePincodeDelete = async (pincode: string) => {
    if (!confirm(`Are you sure you want to delete pincode ${pincode} from serviceability?`)) return;
    const res = await deletePincodeAction(pincode);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to delete pincode.');
    }
  };

  // Newsletter Delete / Unsubscribe
  const handleSubscriberDelete = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the newsletter subscriptions?`)) return;
    const res = await deleteNewsletterSubscriberAction(email);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to remove subscriber.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-xs text-black/45 font-extrabold">
        Loading Administration Session...
      </div>
    );
  }

  // --- RENDER ADMIN LOGIN PANEL ---
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 space-y-8 text-black pt-36">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-extrabold">Security Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase text-black">
            Admin Authorization
          </h1>
          <p className="text-xs text-black/60 font-medium">
            Restricted access to Infinity Traders distribution staff.
          </p>
        </div>

        <div className="bg-white border border-black/5 p-8 rounded-3xl shadow-xs space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
               <label className="text-[9px] uppercase tracking-wider text-black/50 font-extrabold">Staff Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full input-premium text-xs"
              />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] uppercase tracking-wider text-black/50 font-extrabold">Staff Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full input-premium text-xs"
              />
            </div>

            <div className="bg-black/5 border border-black/5 p-4 rounded-2xl text-[10px] text-black/70 leading-relaxed font-bold">
              <span>Demo Staff Logins:</span>
              <ul className="list-disc pl-4 mt-1.5 font-extrabold space-y-0.5">
                <li>Super Admin: admin@infinitytraders.shop / admin123</li>
                <li>Store Manager: manager@infinitytraders.shop / manager123</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-3.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-black pt-28">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-black/50 font-extrabold">Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-black uppercase mt-1">
            Infinity Management Panel
          </h1>
          <p className="text-xs text-black/60 mt-1 font-bold">
            Staff: <strong className="text-black font-extrabold">{user.name}</strong> &mdash; Role: <span className="uppercase tracking-wider text-[10px] bg-black/5 px-2 py-0.5 rounded font-extrabold text-black/70">{user.role}</span>
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 border border-black/10 hover:border-black text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all bg-white shadow-xs"
        >
          View Storefront
        </Link>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4">
        {[
          { id: 'metrics', label: 'Metrics Overview', icon: BarChart3 },
          { id: 'products', label: 'Product Catalog Manager', icon: Package },
          { id: 'orders', label: 'Orders & Tracking', icon: ShoppingCart },
          { id: 'coupons', label: 'Marketing & Coupons', icon: Tag },
          { id: 'pincodes', label: 'Pincode Serviceability', icon: MapPin },
          { id: 'newsletter', label: 'Newsletter Subscribers', icon: Users },
          { id: 'logs', label: 'Super Audit Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          if (tab.id === 'logs' && user.role !== 'SUPER_ADMIN') return null; // restrict audit logs
          if (tab.id === 'newsletter' && !['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING_MANAGER'].includes(user.role)) return null; // restrict newsletter
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 rounded-full transition-all border ${
                activeTab === tab.id
                  ? 'bg-black border-black text-white shadow-xs'
                  : 'border-black/10 text-black/60 hover:border-black hover:text-black bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Boards Content */}
      <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 min-h-[50vh] shadow-xs">
        
        {/* TAB 1: METRICS OVERVIEW */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase text-black/45 tracking-widest font-extrabold">Total Sales Revenue</span>
                <span className="text-xl sm:text-2xl font-extrabold text-black block mt-1">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block mt-1">100% Tax Compliant</span>
              </div>
              <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase text-black/45 tracking-widest font-extrabold">Orders Settle Volume</span>
                <span className="text-xl sm:text-2xl font-extrabold text-black block mt-1">{metrics.totalOrders} Orders</span>
                <span className="text-[9px] text-black/50 block mt-1 font-bold">AOV: ₹{metrics.averageOrderValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase text-black/45 tracking-widest font-extrabold">Inventory Low Stocks</span>
                <span className="text-xl sm:text-2xl font-extrabold text-black block mt-1">{metrics.lowStockProducts.length} Articles</span>
                <span className="text-[9px] text-amber-800 block mt-1 font-bold">{metrics.outOfStockCount} Out of Stock</span>
              </div>
              <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase text-black/45 tracking-widest font-extrabold">Conversion Ratio</span>
                <span className="text-xl sm:text-2xl font-extrabold text-black block mt-1">{metrics.conversionRate}%</span>
                <span className="text-[9px] text-black/50 block mt-1 font-bold">{metrics.newCustomersCount} Customers</span>
              </div>
            </div>

            {/* Low stock alerts */}
            {metrics.lowStockProducts.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl space-y-3">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 flex items-center gap-1.5">
                  <BadgeAlert className="w-4 h-4" /> Low Inventory Alerts (Less than 5 Left)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  {metrics.lowStockProducts.map((p: Product) => (
                    <div key={p.id} className="flex justify-between border-b border-black/5 pb-2">
                      <span className="text-black/80">{p.name} &mdash; <span className="text-black/50 text-[10px] uppercase tracking-wider">{p.brand}</span></span>
                      <strong className="text-amber-800 font-extrabold">Only {p.stockQuantity} Left</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Products */}
            <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-black">Top 5 Best Selling Articles</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Brand</th>
                      <th className="pb-3 text-center">Quantity Sold</th>
                      <th className="pb-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-black/70 font-bold">
                    {metrics.topProducts.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3.5 font-extrabold text-black">{item.name}</td>
                        <td className="py-3.5 font-medium">{item.brand}</td>
                        <td className="py-3.5 text-center font-extrabold">{item.count} items</td>
                        <td className="py-3.5 text-right font-extrabold">₹{item.revenue.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">Active Product Database</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setShowProductForm(!showProductForm);
                }}
                className="px-4 py-2 bg-black hover:bg-transparent text-white hover:text-black border border-black rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* Add / Edit Form */}
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl space-y-4 text-xs">
                <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-black border-b border-black/5 pb-2">
                  {editingProduct ? 'Edit Product Details' : 'Create New Product Article'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">SKU Code</label>
                    <input
                      type="text" required placeholder="e.g. NK-AZM-01"
                      value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Brand</label>
                    <input
                      type="text" required placeholder="e.g. Nike"
                      value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Category</label>
                    <select
                      value={productForm.category} 
                      onChange={(e) => {
                        const newCat = e.target.value;
                        let updatedSizes = productForm.sizes;
                        if (productForm.sizes === '7,8,9,10,11' || productForm.sizes === 'S,M,L,XL,XXL') {
                          updatedSizes = newCat === 'Apparel' ? 'S,M,L,XL,XXL' : '7,8,9,10,11';
                        }
                        setProductForm({...productForm, category: newCat, sizes: updatedSizes});
                      }}
                      className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs text-black font-semibold"
                    >
                      <option value="Footwear">Footwear</option>
                      <option value="Slippers">Slippers</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Product Display Name</label>
                    <input
                      type="text" required placeholder="Product Name"
                      value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Product Description</label>
                    <textarea
                      required placeholder="Product description"
                      value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full input-premium text-xs h-16"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">MRP (₹)</label>
                    <input
                      type="number" required placeholder="Original MRP"
                      value={productForm.mrp} onChange={(e) => setProductForm({...productForm, mrp: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Selling Price (₹)</label>
                    <input
                      type="number" required placeholder="Store Selling Price"
                      value={productForm.sellingPrice} onChange={(e) => setProductForm({...productForm, sellingPrice: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Stock Quantity</label>
                    <input
                      type="number" required placeholder="Stock Count"
                      value={productForm.stockQuantity} onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Color</label>
                    <input
                      type="text" placeholder="Color name"
                      value={productForm.color} onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Material</label>
                    <input
                      type="text" placeholder="Material type"
                      value={productForm.material} onChange={(e) => setProductForm({...productForm, material: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Width</label>
                    <select
                      value={productForm.width} onChange={(e) => setProductForm({...productForm, width: e.target.value})}
                      className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs text-black font-semibold"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Wide">Wide</option>
                      <option value="Narrow">Narrow</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Available Sizes (Comma separated)</label>
                    <input
                      type="text" placeholder="e.g. 7,8,9,10"
                      value={productForm.sizes} onChange={(e) => setProductForm({...productForm, sizes: e.target.value})}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Image URLs (Comma separated)</label>
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
                    className="px-4 py-2 border border-black/10 hover:border-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest transition-all bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-transparent text-white hover:text-black border border-black rounded-full text-[10px] font-bold transition-all uppercase tracking-widest"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Bulk Upload Spreadsheet Paste Box */}
            <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-black flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-black/60" /> Bulk Product Upload Simulation (Excel/TSV)
              </h3>
              <p className="text-[11px] text-black/50 font-bold leading-relaxed">
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
                  className="px-4 py-2 border border-black/10 hover:border-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest transition-all bg-white disabled:opacity-50 disabled:pointer-events-none"
                >
                  Simulate Excel Ingest
                </button>
                {bulkMessage && (
                  <p className="text-xs text-emerald-800 font-extrabold mt-1">{bulkMessage}</p>
                )}
              </form>
            </div>

            {/* Products Table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Brand</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-center">Stock</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-black/70 font-bold">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3.5 font-mono text-[10px] text-black/50">{p.sku}</td>
                      <td className="py-3.5 font-extrabold text-black line-clamp-1 max-w-xs">{p.name}</td>
                      <td className="py-3.5 font-medium">{p.brand}</td>
                      <td className="py-3.5 font-medium">{p.category}</td>
                      <td className="py-3.5 text-right font-extrabold">₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 text-center font-extrabold">
                        <span className={p.stockQuantity <= 5 ? 'text-amber-800 font-extrabold' : 'text-black'}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 border border-black/10 hover:border-black rounded-lg transition-all inline-block bg-white text-black/60 hover:text-black shadow-xs"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(p.id)}
                          className="p-1.5 border border-black/10 hover:border-red-700 rounded-lg transition-all inline-block bg-white text-red-600 hover:text-red-700 hover:bg-red-50 shadow-xs"
                          aria-label="Delete"
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
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">
              Customer Orders Fulfillment & Logistics Tracker
            </h2>

            {/* Courier Dispatch update Modal overlay */}
            {updatingOrder && (
              <form onSubmit={handleOrderUpdateSubmit} className="bg-[#fcfbf9] border border-black/15 p-6 rounded-2xl space-y-4 text-xs max-w-md shadow-lg">
                <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-black">
                  Update Order Logistics - {updatingOrder.id}
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Fulfillment Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs text-black font-semibold"
                  >
                    <option value="PENDING">PENDING Fulfillment</option>
                    <option value="DISPATCHED">DISPATCHED Shipment</option>
                    <option value="DELIVERED">DELIVERED Confirmation</option>
                  </select>
                </div>

                {selectedStatus === 'DISPATCHED' && (
                  <div className="space-y-3 pt-2 border-t border-black/5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Courier Partner Name</label>
                      <input
                        type="text" required placeholder="e.g. Shiprocket / Blue Dart / Delhivery"
                        value={courierName} onChange={(e) => setCourierName(e.target.value)}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Logistics Tracking Number</label>
                      <input
                        type="text" required placeholder="e.g. TRK123456789"
                        value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full input-premium text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Dispatch Route Details</label>
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
                    className="px-4 py-2 border border-black/10 hover:border-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest transition-all bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-transparent text-white hover:text-black border border-black rounded-full text-[10px] font-bold transition-all uppercase tracking-widest"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            )}

            {/* Orders listing table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3 text-center">Date</th>
                    <th className="pb-3 text-center">Items</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right font-extrabold">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-black/70 font-bold">
                  {orders.map((o) => {
                    const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr key={o.id}>
                        <td className="py-3.5 font-mono text-[10px] text-black/50">{o.id}</td>
                        <td className="py-3.5">
                          <p className="font-extrabold text-black">{o.customerName}</p>
                          <p className="text-[10px] text-black/50 font-bold">{o.customerEmail} | Pincode: {o.shippingAddress.pincode}</p>
                        </td>
                        <td className="py-3.5 text-center font-medium">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3.5 text-center font-medium">{totalQty} articles</td>
                        <td className="py-3.5 text-right font-extrabold text-black">₹{o.finalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                            o.orderStatus === 'DELIVERED' ? 'bg-emerald-700/10 text-emerald-800' :
                            o.orderStatus === 'DISPATCHED' ? 'bg-blue-700/10 text-blue-800' :
                            'bg-amber-600/10 text-amber-800'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setUpdatingOrder(o);
                              setSelectedStatus(o.orderStatus);
                            }}
                            className="px-3 py-1.5 border border-black/10 hover:border-black text-[9px] font-extrabold uppercase tracking-widest rounded-full transition-all bg-white"
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
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">Coupon Codes Manager</h2>
              <button
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="px-4 py-2 bg-black hover:bg-transparent text-white hover:text-black border border-black rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            {showCouponForm && (
              <form onSubmit={handleCouponSubmit} className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl space-y-3 text-xs max-w-md">
                <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-black border-b border-black/5 pb-1">
                  Create Promotional Coupon
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Coupon Code</label>
                      <input
                        type="text" required placeholder="e.g. FESTIVE20"
                        value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Discount Type</label>
                      <select
                        value={couponForm.discountType} onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as any})}
                        className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs text-black font-semibold"
                      >
                        <option value="PERCENTAGE">PERCENTAGE Off</option>
                        <option value="FIXED">FIXED Amount Off</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Discount Value</label>
                      <input
                        type="number" required placeholder="e.g. 10 or 500"
                        value={couponForm.discountValue} onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Min Order value (₹)</label>
                      <input
                        type="number" required placeholder="e.g. 999"
                        value={couponForm.minOrderValue} onChange={(e) => setCouponForm({...couponForm, minOrderValue: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Category Restriction (Optional)</label>
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
                    className="px-4 py-2 border border-black/10 hover:border-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest transition-all bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-transparent text-white hover:text-black border border-black rounded-full text-[10px] font-bold transition-all uppercase tracking-widest"
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
                  className="bg-[#fcfbf9] border border-black/5 p-5 rounded-2xl flex justify-between items-start text-xs text-black/70 font-bold shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="bg-black text-white px-2.5 py-1 text-[9px] uppercase tracking-widest font-extrabold rounded-full">
                      {c.code}
                    </span>
                    <p className="font-extrabold text-black mt-3">
                      Discount: {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                    </p>
                    <p className="text-[10px] text-black/50 font-bold">Minimum Order: ₹{c.minOrderValue}</p>
                    {c.categoryRestriction && (
                      <p className="text-[10px] text-emerald-800 font-bold">Category Restriction: {c.categoryRestriction}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCouponClick(c.id)}
                    className="text-red-700 hover:text-red-800 p-1.5 border border-black/10 hover:border-red-700 hover:bg-red-50 rounded-lg transition-all shadow-xs"
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
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-2">
              Super Admin System Audit Trail
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono leading-relaxed border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">User / Operator</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-black/70 font-bold">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 text-black/50">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-black font-extrabold">{log.userEmail}</td>
                      <td className="py-3 text-black font-extrabold underline uppercase tracking-wider text-[10px]">{log.action}</td>
                      <td className="py-3 max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PINCODE SERVICEABILITY */}
        {activeTab === 'pincodes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">
                  Pincode Delivery Rules
                </h2>
                <p className="text-[10px] text-black/50 mt-0.5">
                  Configure tax-compliant delivery coverage, estimated transit days, and destination states.
                </p>
              </div>
              <button
                onClick={() => setShowPincodeForm(!showPincodeForm)}
                className="px-4 py-2 bg-black hover:bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Delivery Pincode
              </button>
            </div>

            {/* Pincode Form */}
            {showPincodeForm && (
              <form onSubmit={handlePincodeSubmit} className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl space-y-4 max-w-xl shadow-xs">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black">
                  Create/Update Pincode Rule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-black/50 font-bold block">Pincode (6-digit)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 826001"
                      value={pincodeForm.pincode}
                      onChange={(e) => setPincodeForm({...pincodeForm, pincode: e.target.value.replace(/\D/g, '')})}
                      className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-black/50 font-bold block">Estimated Days</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      placeholder="e.g. 4"
                      value={pincodeForm.estimatedDays}
                      onChange={(e) => setPincodeForm({...pincodeForm, estimatedDays: e.target.value})}
                      className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-black/50 font-bold block">Destination State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jharkhand"
                      value={pincodeForm.state}
                      onChange={(e) => setPincodeForm({...pincodeForm, state: e.target.value})}
                      className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-black/50 font-bold block">Serviceability Status</label>
                    <select
                      value={pincodeForm.serviceable ? 'true' : 'false'}
                      onChange={(e) => setPincodeForm({...pincodeForm, serviceable: e.target.value === 'true'})}
                      className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black bg-white"
                    >
                      <option value="true">Serviceable (Delivery Active)</option>
                      <option value="false">Unserviceable (Delivery Blocked)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPincodeForm(false);
                      setPincodeForm({ pincode: '', serviceable: true, estimatedDays: '4', state: '' });
                    }}
                    className="px-4 py-2 border border-black/10 hover:border-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest transition-all bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-[#1a1a1a] text-white border border-black rounded-full text-[10px] font-bold transition-all uppercase tracking-widest"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            )}

            {/* Pincodes listing */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Pincode</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Estimated Transit</th>
                    <th className="pb-3">State / Destination</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-black/70 font-bold">
                  {pincodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-black/40 font-normal">
                        No explicit pincode rules defined. Standard Indian pincodes default to 4-day delivery.
                      </td>
                    </tr>
                  ) : (
                    pincodes.map((p) => (
                      <tr key={p.pincode}>
                        <td className="py-3 font-mono text-black font-extrabold">{p.pincode}</td>
                        <td className="py-3">
                          {p.serviceable ? (
                            <span className="bg-emerald-500/10 text-emerald-800 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded">
                              Serviceable
                            </span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-800 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded">
                              Blocked
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-black font-extrabold">{p.estimatedDays} Working Days</td>
                        <td className="py-3 text-black/80 font-medium">{p.state}</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setPincodeForm({
                                  pincode: p.pincode,
                                  serviceable: p.serviceable,
                                  estimatedDays: String(p.estimatedDays),
                                  state: p.state
                                });
                                setShowPincodeForm(true);
                              }}
                              className="text-black/60 hover:text-black p-1.5 border border-black/10 hover:border-black bg-white rounded-lg transition-all shadow-xs"
                              title="Edit Rule"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handlePincodeDelete(p.pincode)}
                              className="text-red-700 hover:text-red-800 p-1.5 border border-black/10 hover:border-red-700 hover:bg-red-50 rounded-lg transition-all shadow-xs"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: NEWSLETTER SUBSCRIBERS */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">
                  Newsletter Subscriptions
                </h2>
                <p className="text-[10px] text-black/50 mt-0.5">
                  View and manage users who signed up to receive updates from the store.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Subscriber Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Date Subscribed</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-black/70 font-bold">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-black/40 font-normal">
                        No newsletter subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="py-3 text-black font-extrabold">
                          {sub.firstName} {sub.lastName}
                        </td>
                        <td className="py-3 font-mono text-black/80 font-medium">
                          {sub.email}
                        </td>
                        <td className="py-3 text-black/60 font-medium">
                          {new Date(sub.subscribedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleSubscriberDelete(sub.email)}
                            className="text-red-700 hover:text-red-800 p-1.5 border border-black/10 hover:border-red-700 hover:bg-red-50 rounded-lg transition-all shadow-xs"
                            title="Unsubscribe Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
