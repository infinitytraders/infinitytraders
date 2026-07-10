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
  deleteNewsletterSubscriberAction,
  retryDelhiveryBookingAction,
  checkDelhiveryPincodeServiceabilityAction,
  getDelhiveryTrackingDetails,
  getUsersAction,
  updateUserAction,
  deleteUserAction
} from '@/app/actions';
import { getHexFromColorName, getColorsArray } from '@/lib/colors';
import type { User, Product, Order, Coupon, PincodeServiceability, AuditLog, NewsletterSubscriber } from '@/lib/db';
import { BarChart3, ShoppingCart, Users, BadgeAlert, Plus, Edit2, Trash2, Check, X, FileSpreadsheet, Package, AlertTriangle, ShieldCheck, Tag, History, MapPin, Truck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'orders' | 'coupons' | 'pincodes' | 'logs' | 'newsletter' | 'delhivery' | 'users'>('metrics');

  // Delhivery Live API Dashboard States
  const [delhiveryPincode, setDelhiveryPincode] = useState('');
  const [delhiveryPincodeResult, setDelhiveryPincodeResult] = useState<any>(null);
  const [delhiveryPincodeError, setDelhiveryPincodeError] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  
  const [externalAwb, setExternalAwb] = useState('');
  const [externalTrackingResult, setExternalTrackingResult] = useState<any>(null);
  const [externalTrackingError, setExternalTrackingError] = useState('');
  const [isTrackingAwb, setIsTrackingAwb] = useState(false);
  
  const [orderLiveStatuses, setOrderLiveStatuses] = useState<Record<string, any>>({});
  const [isFetchingLiveStatuses, setIsFetchingLiveStatuses] = useState(false);

  // User Manager states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQueryUsers, setSearchQueryUsers] = useState('');
  const [roleFilterUsers, setRoleFilterUsers] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '', email: '', mobile: '', role: 'CUSTOMER' as any
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

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
    width: 'Standard', sizes: '7,8,9,10,11', images: '',
    seoTitle: '', seoDescription: '', videos: '',
    isNewArrival: true, isBestSeller: false, isTrending: false
  });

  // Order status update states
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatchDetails, setDispatchDetails] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED'>('PENDING');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  // Coupon create states
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '', minOrderValue: '', categoryRestriction: ''
  });

  // Excel Bulk upload simulation state
  const [excelDataInput, setExcelDataInput] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  // Cloudinary Image Upload states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryConfigured = !!(cloudinaryCloudName && cloudinaryUploadPreset);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    
    // Check limit on image sizes (2MB = 2 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(file => file.size > MAX_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the 2MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}. Please resize or compress your images.`);
      return;
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryUploadPreset!);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name} to Cloudinary`);
        }

        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      }

      // Add new URLs to the current form images
      const existingImages = productForm.images.split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0);
      const combined = [...existingImages, ...uploadedUrls].join(',');
      setProductForm({ ...productForm, images: combined });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error uploading images');
      alert(err.message || 'Error uploading images. Please verify your Cloudinary settings.');
    } finally {
      setUploadingImages(false);
      // Reset input value to allow uploading same file again
      e.target.value = '';
    }
  };

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
    if (ords.success && ords.orders) {
      const sortedOrders = [...ords.orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
      
      // Auto-fetch live statuses for active Delhivery shipments
      const activeDelhivery = ords.orders.filter(
        o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED'
      );
      if (activeDelhivery.length > 0) {
        setIsFetchingLiveStatuses(true);
        const statuses: Record<string, any> = {};
        for (const o of activeDelhivery) {
          if (o.trackingNumber) {
            try {
              const details = await getDelhiveryTrackingDetails(o.trackingNumber);
              if (details) {
                statuses[o.trackingNumber] = details;
              }
            } catch (err) {
              console.error('Failed to auto-fetch live status for waybill:', o.trackingNumber, err);
            }
          }
        }
        setOrderLiveStatuses(prev => ({ ...prev, ...statuses }));
        setIsFetchingLiveStatuses(false);
      }
    }

    const coups = await getCouponsAction();
    setCoupons(coups);

    const logs = await getAuditLogsAction();
    if (logs.success && logs.logs) setAuditLogs(logs.logs);

    const pins = await getPincodesAction();
    if (pins.success && pins.pincodes) setPincodes(pins.pincodes);

    const subs = await getNewsletterSubscribersAction();
    setSubscribers(subs);

    const usrRes = await getUsersAction();
    if (usrRes.success && usrRes.users) setUsersList(usrRes.users);
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
      seoTitle: productForm.seoTitle || undefined,
      seoDescription: productForm.seoDescription || undefined,
      videos: productForm.videos ? productForm.videos.split(',').map(v => v.trim()).filter(v => v.length > 0) : [],
      isNewArrival: !!productForm.isNewArrival,
      isBestSeller: !!productForm.isBestSeller,
      isTrending: !!productForm.isTrending
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
      images: p.images.join(','),
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      videos: p.videos ? p.videos.join(',') : '',
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      isTrending: p.isTrending
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
      width: 'Standard', sizes: '7,8,9,10,11', images: '',
      seoTitle: '', seoDescription: '', videos: '',
      isNewArrival: true, isBestSeller: false, isTrending: false
    });
  };

  // Order Dispatch / Courier Update Submit
  const handleOrderUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;

    const payload: any = { 
      orderStatus: selectedStatus,
      paymentStatus: selectedPaymentStatus
    };
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

  const handleCheckDelhiveryPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    setDelhiveryPincodeError('');
    setDelhiveryPincodeResult(null);
    if (!delhiveryPincode || delhiveryPincode.length !== 6) {
      setDelhiveryPincodeError('Please enter a valid 6-digit destination pincode.');
      return;
    }
    setIsCheckingPincode(true);
    const res = await checkDelhiveryPincodeServiceabilityAction(delhiveryPincode);
    setIsCheckingPincode(false);
    if (res.success && res.data) {
      setDelhiveryPincodeResult(res.data);
    } else {
      setDelhiveryPincodeError(res.error || 'Failed to check pincode serviceability.');
    }
  };

  const handleTrackExternalAwb = async (e: React.FormEvent) => {
    e.preventDefault();
    setExternalTrackingError('');
    setExternalTrackingResult(null);
    if (!externalAwb.trim()) {
      setExternalTrackingError('Please enter a valid Delhivery AWB tracking number.');
      return;
    }
    setIsTrackingAwb(true);
    const details = await getDelhiveryTrackingDetails(externalAwb.trim());
    setIsTrackingAwb(false);
    if (details) {
      setExternalTrackingResult(details);
    } else {
      setExternalTrackingError('Failed to fetch tracking details from Delhivery. Verify the AWB is correct.');
    }
  };

  const handleFetchOrderLiveStatuses = async () => {
    const delhiveryOrders = orders.filter(o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED');
    if (delhiveryOrders.length === 0) return;
    
    setIsFetchingLiveStatuses(true);
    const statuses: Record<string, any> = {};
    for (const o of delhiveryOrders) {
      if (o.trackingNumber) {
        const details = await getDelhiveryTrackingDetails(o.trackingNumber);
        if (details) {
          statuses[o.trackingNumber] = details;
        }
      }
    }
    setOrderLiveStatuses(statuses);
    setIsFetchingLiveStatuses(false);
  };

  const handleEditUserClick = (u: User) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role
    });
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    const res = await updateUserAction(editingUser.id, {
      name: userForm.name,
      email: userForm.email,
      mobile: userForm.mobile,
      role: userForm.role
    });
    setIsSavingUser(false);
    if (res.success) {
      setEditingUser(null);
      loadAdminData();
    } else {
      alert(res.error || 'Failed to update user.');
    }
  };

  const handleDeleteUserClick = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) return;
    const res = await deleteUserAction(userId);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to delete user.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-black pt-28 w-full overflow-x-hidden">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-black/50 font-extrabold">Control Center</span>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-wide sm:tracking-widest text-black uppercase mt-1 break-words">
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

      {/* Mobile Nav Dropdown */}
      <div className="block sm:hidden space-y-1.5">
        <label className="text-[9px] uppercase tracking-wider text-black/50 font-extrabold block">Select Section</label>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs text-black font-semibold shadow-xs"
        >
          <option value="metrics">Metrics Overview</option>
          <option value="products">Product Catalog Manager</option>
          <option value="orders">Orders & Tracking</option>
          {['SUPER_ADMIN', 'STORE_MANAGER'].includes(user.role) && (
            <option value="users">User Accounts Manager</option>
          )}
          <option value="coupons">Marketing & Coupons</option>
          <option value="pincodes">Pincode Serviceability</option>
          <option value="delhivery">Delhivery Logistics</option>
          {['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING_MANAGER'].includes(user.role) && (
            <option value="newsletter">Newsletter Subscribers</option>
          )}
          {user.role === 'SUPER_ADMIN' && (
            <option value="logs">Super Audit Logs</option>
          )}
        </select>
      </div>

      {/* Desktop Nav Tabs */}
      <div className="hidden sm:flex flex-wrap gap-2 border-b border-black/5 pb-4">
        {[
          { id: 'metrics', label: 'Metrics Overview', icon: BarChart3 },
          { id: 'products', label: 'Product Catalog Manager', icon: Package },
          { id: 'orders', label: 'Orders & Tracking', icon: ShoppingCart },
          { id: 'users', label: 'User Accounts Manager', icon: Users },
          { id: 'coupons', label: 'Marketing & Coupons', icon: Tag },
          { id: 'pincodes', label: 'Pincode Serviceability', icon: MapPin },
          { id: 'delhivery', label: 'Delhivery Logistics', icon: Truck },
          { id: 'newsletter', label: 'Newsletter Subscribers', icon: Users },
          { id: 'logs', label: 'Super Audit Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          if (tab.id === 'logs' && user.role !== 'SUPER_ADMIN') return null; // restrict audit logs
          if (tab.id === 'users' && !['SUPER_ADMIN', 'STORE_MANAGER'].includes(user.role)) return null; // restrict users
          if (tab.id === 'newsletter' && !['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING_MANAGER'].includes(user.role)) return null; // restrict newsletter
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 rounded-full transition-all border ${
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
      <div className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8 min-h-[50vh] shadow-xs max-w-full overflow-hidden">
        
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
              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile View: Cards */}
              <div className="block md:hidden space-y-3">
                {metrics.topProducts.map((item: any, i: number) => (
                  <div key={i} className="bg-white border border-black/5 p-4 rounded-xl flex justify-between items-center text-xs shadow-xs font-bold">
                    <div>
                      <h4 className="font-extrabold text-black">{item.name}</h4>
                      <p className="text-[10px] text-black/50 font-bold mt-0.5">{item.brand}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-black block">{item.count} sold</span>
                      <span className="text-[10px] text-emerald-800 font-extrabold mt-0.5 block">₹{item.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
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
                          const isApparelCat = ['Apparel', 'Lowers', 'T-shirts', 'Gym Wear', 'Tracksuit', 'Sando'].includes(newCat);
                          updatedSizes = isApparelCat ? 'S,M,L,XL,XXL' : '7,8,9,10,11';
                        }
                        setProductForm({...productForm, category: newCat, sizes: updatedSizes});
                      }}
                      className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs text-black font-semibold"
                    >
                      <option value="Running Shoes">Running Shoes</option>
                      <option value="Training Shoes">Training Shoes</option>
                      <option value="Daily Wear">Daily Wear</option>
                      <option value="Sliders">Sliders</option>
                      <option value="Gym Wear">Gym Wear</option>
                      <option value="Tracksuit">Tracksuit</option>
                      <option value="Lowers">Lowers</option>
                      <option value="Sando">Sando</option>
                      <option value="Air Sega">Air Sega</option>
                      <option value="Slippers">Slippers</option>
                      <option value="Running Kit">Running Kit</option>
                      <option value="Footwear">Footwear (Legacy)</option>
                      <option value="Apparel">Apparel (Legacy)</option>
                      <option value="Accessories">Accessories (Legacy)</option>
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
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Product Color (Multi-color supported)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. White, Black/Red"
                      value={productForm.color}
                      onChange={(e) => setProductForm({...productForm, color: e.target.value})}
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

                  <div className="md:col-span-3 border-t border-black/5 pt-4 space-y-2">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider block">Product Badges & Visibility</label>
                    <div className="flex flex-wrap gap-6 bg-[#fcfbf9] border border-black/10 p-4 rounded-2xl shadow-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-black select-none">
                        <input
                          type="checkbox"
                          checked={productForm.isNewArrival}
                          onChange={(e) => setProductForm({...productForm, isNewArrival: e.target.checked})}
                          className="w-4 h-4 rounded border-black/20 text-black focus:ring-black"
                        />
                        New Arrival
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-black select-none">
                        <input
                          type="checkbox"
                          checked={productForm.isBestSeller}
                          onChange={(e) => setProductForm({...productForm, isBestSeller: e.target.checked})}
                          className="w-4 h-4 rounded border-black/20 text-black focus:ring-black"
                        />
                        Best Seller
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-black select-none">
                        <input
                          type="checkbox"
                          checked={productForm.isTrending}
                          onChange={(e) => setProductForm({...productForm, isTrending: e.target.checked})}
                          className="w-4 h-4 rounded border-black/20 text-black focus:ring-black"
                        />
                        Trending
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-3 border-t border-black/5 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">SEO Page Title (Optional)</label>
                      <input
                        type="text" placeholder="e.g. Nike Pegasus 40 - Running Shoes"
                        value={productForm.seoTitle} onChange={(e) => setProductForm({...productForm, seoTitle: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">SEO Meta Description (Optional)</label>
                      <input
                        type="text" placeholder="Search engine details description"
                        value={productForm.seoDescription} onChange={(e) => setProductForm({...productForm, seoDescription: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Product Videos (Comma separated URLs)</label>
                      <input
                        type="text" placeholder="e.g. https://domain.com/video.mp4"
                        value={productForm.videos} onChange={(e) => setProductForm({...productForm, videos: e.target.value})}
                        className="w-full input-premium text-xs"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 border-t border-black/5 pt-4 space-y-2">
                    <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider block">Product Images</label>
                    
                    {/* Cloudinary Warning if not configured */}
                    {!cloudinaryConfigured && (
                      <div className="bg-amber-500/10 border border-amber-500/25 text-amber-800 rounded-xl p-3 text-[11px] font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>
                          Cloudinary is not configured. Set <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</strong> and <strong>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</strong> in `.env` to enable file uploads.
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      {/* File upload button */}
                      <div className="relative flex-1">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={!cloudinaryConfigured || uploadingImages}
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        />
                        <div className="border border-dashed border-black/10 rounded-xl p-4 flex flex-col items-center justify-center gap-1 bg-white hover:bg-black/[0.02] transition-colors h-full min-h-[90px]">
                          {uploadingImages ? (
                            <span className="text-xs font-bold text-black animate-pulse uppercase tracking-wider">Uploading to Cloudinary...</span>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-black uppercase tracking-wider text-center">Drag & Drop or Click to Upload</span>
                              <span className="text-[9px] text-black/45 font-bold text-center">Max 2MB per image. Multi-file upload supported.</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Text input fallback / view URLs */}
                      <div className="flex-1 space-y-1">
                        <textarea
                          placeholder="Paste image addresses manually (comma-separated URLs)"
                          value={productForm.images}
                          onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                          className="w-full input-premium text-xs h-full min-h-[90px]"
                        />
                      </div>
                    </div>

                    {/* Display preview of currently configured images */}
                    {productForm.images.trim().length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {productForm.images.split(',').map((imgUrl, index) => {
                          const url = imgUrl.trim();
                          if (!url) return null;
                          return (
                            <div key={index} className="relative w-16 h-16 border border-black/5 rounded-xl overflow-hidden group">
                              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = productForm.images.split(',')
                                    .map(u => u.trim())
                                    .filter((_, i) => i !== index)
                                    .join(',');
                                  setProductForm({...productForm, images: updated});
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

            {/* Products Table list */}
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3 w-12">Image</th>
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
                    <tr key={p.id} className="align-middle">
                      <td className="py-2.5">
                        <div className="w-10 h-12 bg-black/5 rounded-lg border border-black/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] text-black/35 font-bold">No Img</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-black/50">{p.sku}</td>
                      <td className="py-2.5 font-extrabold text-black line-clamp-1 max-w-xs">{p.name}</td>
                      <td className="py-2.5 font-medium">{p.brand}</td>
                      <td className="py-2.5 font-medium">{p.category}</td>
                      <td className="py-2.5 text-right font-extrabold">₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-center font-extrabold">
                        <span className={p.stockQuantity <= 5 ? 'text-amber-800 font-extrabold' : 'text-black'}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 border border-black/10 hover:border-black rounded-lg transition-all inline-block bg-white text-black/60 hover:text-black shadow-xs"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(p.id)}
                          className="p-1.5 border border-black/10 hover:border-red-700 rounded-lg transition-all inline-block bg-white text-red-650 hover:text-red-750 hover:bg-red-50 shadow-xs"
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

            {/* Mobile View: Stacked Cards */}
            <div className="block md:hidden space-y-4">
              {products.map((p) => (
                <div key={p.id} className="bg-[#fcfbf9] border border-black/5 p-4 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-14 bg-black/5 rounded-lg border border-black/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-black/35 font-bold">No Img</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-black/45 bg-black/5 px-2 py-0.5 rounded font-bold">{p.sku}</span>
                        <h4 className="text-xs font-extrabold text-black pt-1">{p.name}</h4>
                        <p className="text-[10px] text-black/50 font-bold">{p.brand} &bull; {p.category}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-black block">₹{p.sellingPrice.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] font-extrabold block mt-1 ${p.stockQuantity <= 5 ? 'text-amber-800 font-extrabold' : 'text-black/60'}`}>
                        Stock: {p.stockQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2.5 border-t border-black/5">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="px-3 py-1.5 border border-black/10 hover:border-black rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white text-black/60 hover:text-black shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProductClick(p.id)}
                      className="px-3 py-1.5 border border-black/10 hover:border-red-750 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white text-red-650 hover:text-red-750 hover:bg-red-50 shadow-xs"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
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

                {/* List Items in Updating Order */}
                <div className="bg-black/5 border border-black/5 p-3 rounded-xl space-y-2">
                  <p className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Ordered Products</p>
                  {updatingOrder.items.map((item, idx) => {
                    const currentStock = products.find(p => p.id === item.productId)?.stockQuantity ?? 0;
                    return (
                      <div key={idx} className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-10 object-cover rounded-md border border-black/5 flex-shrink-0"
                        />
                        <div className="text-[10px] leading-tight space-y-0.5">
                          <p className="font-extrabold text-black line-clamp-1">{item.name}</p>
                          <p className="text-black/50 font-bold">
                            {item.brand} &nbsp;|&nbsp; Size: {item.size} &nbsp;|&nbsp; Qty: {item.quantity}
                          </p>
                          <p className="text-black/50 font-bold">
                            Stock: <span className={`font-extrabold ${currentStock === 0 ? 'text-rose-700' : currentStock <= 5 ? 'text-amber-700' : 'text-black'}`}>{currentStock} available</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-black/50 uppercase tracking-wider">Fulfillment Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setSelectedStatus(newStatus);
                      // Auto-fail payment if marked as returned/cancelled
                      if (newStatus === 'RETURNED' && updatingOrder.paymentMethod === 'COD') {
                        setSelectedPaymentStatus('FAILED');
                      }
                    }}
                    className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs text-black font-semibold"
                  >
                    <option value="PENDING">PENDING Fulfillment</option>
                    <option value="DISPATCHED">DISPATCHED Shipment</option>
                    <option value="DELIVERED">DELIVERED Confirmation</option>
                    <option value="RETURNED">RETURNED Back (Refund/Cancel)</option>
                    <option value="CANCELLED">CANCELLED (Order Annulled)</option>
                  </select>
                </div>

                {updatingOrder.paymentMethod === 'COD' && (
                  <div className="space-y-1.5 pt-2 border-t border-black/5">
                    <label className="text-[9px] font-bold text-[#b45309] uppercase tracking-wider block">COD Payment Status</label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
                      className="w-full bg-[#fdfaf2] border border-amber-500/20 rounded-lg p-2 text-xs text-amber-900 font-semibold"
                    >
                      <option value="PENDING">PENDING Cash Collection</option>
                      <option value="PAID">PAID (Cash Collected)</option>
                      <option value="FAILED">FAILED (Non-payment / Returned)</option>
                    </select>
                  </div>
                )}

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

                {!updatingOrder.trackingNumber && (
                  <div className="pt-2 border-t border-black/5 flex justify-between items-center gap-2">
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Shipment Not Booked
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Do you want to book this order shipment with Delhivery now?')) {
                          try {
                            const res = await retryDelhiveryBookingAction(updatingOrder.id);
                            if (res.success && res.waybill) {
                              alert(`Shipment booked successfully! Delhivery Waybill: ${res.waybill}`);
                              setUpdatingOrder(null);
                              loadAdminData();
                            } else {
                              alert(res.error || 'Failed to book shipment. Check your Delhivery wallet balance.');
                            }
                          } catch (err: any) {
                            alert(err.message || 'Error booking shipment.');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                      Book Delhivery Shipping
                    </button>
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
            {/* Desktop View: Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 pb-2 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3 text-center">Date</th>
                    <th className="pb-3">Ordered Items Details</th>
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
                          <p className="text-[9px] text-black/60 font-bold mt-1 uppercase tracking-wider">
                            Method: <span className="text-black font-extrabold">{o.paymentMethod}</span> &nbsp;|&nbsp; 
                            Payment: <span className={`font-extrabold ${
                              o.paymentStatus === 'PAID' ? 'text-emerald-700' : 
                              o.paymentStatus === 'FAILED' ? 'text-rose-700' : 'text-amber-700'
                            }`}>{o.paymentStatus}</span>
                          </p>
                        </td>
                        <td className="py-3.5 text-center font-medium">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </td>
                         <td className="py-3.5">
                           <div className="space-y-3 min-w-[240px]">
                             {o.items.map((item, idx) => {
                                const currentStock = products.find(p => p.id === item.productId)?.stockQuantity ?? 0;
                                return (
                                  <div key={idx} className="flex items-start gap-2.5">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-12 object-cover rounded-lg border border-black/5 flex-shrink-0"
                                    />
                                    <div className="text-[10px] leading-tight space-y-0.5">
                                      <p className="font-extrabold text-black line-clamp-1">{item.name}</p>
                                      <p className="text-black/50 font-bold">
                                        {item.brand} &nbsp;|&nbsp; Size: {item.size}
                                      </p>
                                      <p className="text-black/70 font-extrabold">
                                        {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
                                      </p>
                                      <p className="text-black/50 font-bold">
                                        Stock: <span className={`font-extrabold ${currentStock === 0 ? 'text-rose-700' : currentStock <= 5 ? 'text-amber-700' : 'text-black'}`}>{currentStock} available</span>
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                         </td>
                        <td className="py-3.5 text-right font-extrabold text-black">₹{o.finalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 text-center">
                          {(() => {
                            let displayStatus = o.orderStatus as string;
                            let badgeClass = 'bg-amber-600/10 text-amber-800';
                            
                            if (o.orderStatus === 'DELIVERED') {
                              badgeClass = 'bg-emerald-700/10 text-emerald-800';
                            } else if (o.orderStatus === 'RETURNED') {
                              badgeClass = 'bg-rose-700/10 text-rose-800';
                            } else if (o.orderStatus === 'CANCELLED') {
                              badgeClass = 'bg-rose-100 text-rose-600 font-extrabold';
                            } else if (o.orderStatus === 'DISPATCHED') {
                              // Check if there are physical scans in Delhivery tracker
                              const live = o.trackingNumber ? orderLiveStatuses[o.trackingNumber] : null;
                              const scans = live?.Status?.Scans || [];
                              const hasTransitScans = scans.some((scan: any) => {
                                const activity = (scan.ScanDetail?.Scan || '').toUpperCase();
                                return activity !== 'MANIFESTED' && activity !== 'SOFT DATA UPLOADED';
                              });
                              
                              if (o.courierName === 'Delhivery' && o.trackingNumber && !hasTransitScans) {
                                displayStatus = 'AWAITING PICKUP';
                                badgeClass = 'bg-orange-500/15 text-orange-800 font-bold';
                              } else {
                                displayStatus = 'DISPATCHED';
                                badgeClass = 'bg-blue-700/10 text-blue-800';
                              }
                            }
                            
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${badgeClass}`}>
                                {displayStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setUpdatingOrder(o);
                              setSelectedStatus(o.orderStatus);
                              setSelectedPaymentStatus(o.paymentStatus);
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

            {/* Mobile View: Stacked Cards */}
            <div className="block lg:hidden space-y-4">
              {orders.map((o) => {
                const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div key={o.id} className="bg-[#fcfbf9] border border-black/5 p-4 rounded-2xl space-y-3 shadow-xs font-bold text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-black/45 bg-black/5 px-2 py-0.5 rounded font-bold">{o.id}</span>
                        <span className="text-[9px] text-black/40 block mt-1.5">{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        <h4 className="text-xs font-extrabold text-black mt-2">{o.customerName}</h4>
                        <p className="text-[10px] text-black/50 font-bold">{o.customerEmail} | Pincode: {o.shippingAddress.pincode}</p>
                        <p className="text-[9px] text-black/60 font-bold mt-1 uppercase tracking-wider">
                          Method: <span className="text-black font-extrabold">{o.paymentMethod}</span> &nbsp;|&nbsp; 
                          Payment: <span className={`font-extrabold ${
                            o.paymentStatus === 'PAID' ? 'text-emerald-700' : 
                            o.paymentStatus === 'FAILED' ? 'text-rose-700' : 'text-amber-700'
                          }`}>{o.paymentStatus}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-black block">₹{o.finalAmount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-black/50 font-bold">{totalQty} items</span>
                      </div>
                    </div>

                    <div className="bg-white border border-black/5 p-3 rounded-xl space-y-3">
                      <span className="text-[8px] uppercase tracking-wider text-black/50 font-extrabold block">Ordered Items</span>
                      {o.items.map((item, idx) => {
                        const currentStock = products.find(p => p.id === item.productId)?.stockQuantity ?? 0;
                        return (
                          <div key={idx} className="flex items-start gap-2.5 text-[10px] font-bold">
                            <img src={item.image} alt={item.name} className="w-8 h-10 object-cover rounded-md border border-black/5 flex-shrink-0" />
                            <div className="flex-1 leading-tight space-y-0.5">
                              <p className="text-black font-extrabold line-clamp-1">{item.name}</p>
                              <p className="text-black/50 text-[9px] font-bold">{item.brand} &bull; Size: {item.size}</p>
                              <p className="text-black/70 font-extrabold">{item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                              <p className="text-black/40 text-[9px] font-bold">
                                Stock: <span className={`font-extrabold ${currentStock === 0 ? 'text-rose-700' : currentStock <= 5 ? 'text-amber-700' : 'text-black/50'}`}>{currentStock} avail</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-black/5">
                      <div>
                        {(() => {
                          let displayStatus = o.orderStatus as string;
                          let badgeClass = 'bg-amber-600/10 text-amber-800';
                          
                          if (o.orderStatus === 'DELIVERED') {
                            badgeClass = 'bg-emerald-700/10 text-emerald-800';
                          } else if (o.orderStatus === 'RETURNED') {
                            badgeClass = 'bg-rose-700/10 text-rose-800';
                          } else if (o.orderStatus === 'CANCELLED') {
                            badgeClass = 'bg-rose-100 text-rose-600 font-extrabold';
                          } else if (o.orderStatus === 'DISPATCHED') {
                            const live = o.trackingNumber ? orderLiveStatuses[o.trackingNumber] : null;
                            const scans = live?.Status?.Scans || [];
                            const hasTransitScans = scans.some((scan: any) => {
                              const activity = (scan.ScanDetail?.Scan || '').toUpperCase();
                              return activity !== 'MANIFESTED' && activity !== 'SOFT DATA UPLOADED';
                            });
                            
                            if (o.courierName === 'Delhivery' && o.trackingNumber && !hasTransitScans) {
                              displayStatus = 'AWAITING PICKUP';
                              badgeClass = 'bg-orange-500/15 text-orange-800 font-bold';
                            } else {
                              displayStatus = 'DISPATCHED';
                              badgeClass = 'bg-blue-700/10 text-blue-800';
                            }
                          }
                          
                          return (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider ${badgeClass}`}>
                              {displayStatus}
                            </span>
                          );
                        })()}
                        {o.trackingNumber && (
                          <span className="text-[8px] font-mono text-black/50 block mt-1">AWB: {o.trackingNumber}</span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setUpdatingOrder(o);
                            setSelectedStatus(o.orderStatus);
                            setSelectedPaymentStatus(o.paymentStatus);
                          }}
                          className="px-2.5 py-1.5 border border-black/10 hover:border-black text-[9px] font-extrabold uppercase tracking-widest rounded-lg bg-white"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-white border border-black/5 p-4 rounded-xl space-y-2 shadow-xs text-[11px] font-mono leading-relaxed">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-black">{log.userEmail}</h4>
                      <p className="text-[9px] text-black/45 mt-0.5">{new Date(log.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-black/5 px-2 py-0.5 rounded text-black shrink-0">
                      {log.action}
                    </span>
                  </div>
                  <div className="border-t border-black/5 pt-2 text-black/70 font-semibold break-words">
                    {log.details}
                  </div>
                </div>
              ))}
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

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-3">
              {pincodes.length === 0 ? (
                <div className="py-8 text-center text-black/40 text-xs font-normal">
                  No explicit pincode rules defined. Standard Indian pincodes default to 4-day delivery.
                </div>
              ) : (
                pincodes.map((p) => (
                  <div key={p.pincode} className="bg-[#fcfbf9] border border-black/5 p-4 rounded-xl flex justify-between items-center text-xs shadow-xs font-bold">
                    <div>
                      <h4 className="font-extrabold text-black font-mono">{p.pincode}</h4>
                      <p className="text-[10px] text-black/50 font-bold mt-0.5">{p.state}</p>
                      <p className="text-[9px] text-black/70 font-semibold mt-1">{p.estimatedDays} Working Days</p>
                    </div>
                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                      {p.serviceable ? (
                        <span className="bg-emerald-500/10 text-emerald-800 px-2 py-0.5 text-[8px] uppercase tracking-wider font-extrabold rounded">
                          Serviceable
                        </span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-800 px-2 py-0.5 text-[8px] uppercase tracking-wider font-extrabold rounded">
                          Blocked
                        </span>
                      )}
                      <div className="flex gap-1.5 mt-1">
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
                          className="text-black/60 hover:text-black p-1 border border-black/10 bg-white rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePincodeDelete(p.pincode)}
                          className="text-red-700 hover:text-red-800 p-1 border border-black/10 hover:border-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-3">
              {subscribers.length === 0 ? (
                <div className="py-8 text-center text-black/40 text-xs font-normal">
                  No newsletter subscriptions found.
                </div>
              ) : (
                subscribers.map((sub) => (
                  <div key={sub.id} className="bg-white border border-black/5 p-4 rounded-xl flex justify-between items-center text-xs shadow-xs font-bold">
                    <div>
                      <h4 className="font-extrabold text-black">{sub.firstName} {sub.lastName}</h4>
                      <p className="text-[10px] text-black/50 font-mono mt-0.5">{sub.email}</p>
                      <p className="text-[9px] text-black/40 mt-1">
                        {new Date(sub.subscribedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubscriberDelete(sub.email)}
                      className="text-red-700 hover:text-red-800 p-1.5 border border-black/10 hover:border-red-700 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: DELHIVERY LOGISTICS */}
        {activeTab === 'delhivery' && (
          <div className="space-y-8">
            {/* Header / Info bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black/5 pb-6">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">
                  Delhivery Logistics Control Center
                </h2>
                <p className="text-[10px] text-black/50 mt-0.5 font-bold">
                  Verify pincode delivery serviceability and track dispatched packages in real time directly from Delhivery API.
                </p>
              </div>
            </div>

            {/* Main content split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1 & 2: Live Shipment Tracking Dashboard */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-black/60" /> Active Shipments Tracking Dashboard
                  </h3>
                  
                  {orders.filter(o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED').length > 0 && (
                    <button
                      onClick={handleFetchOrderLiveStatuses}
                      disabled={isFetchingLiveStatuses}
                      className="px-4 py-2 border border-black hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-xs"
                    >
                      {isFetchingLiveStatuses ? 'Refreshing Live Statuses...' : 'Refresh All Statuses'}
                    </button>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto border border-black/5 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fcfbf9] border-b border-black/5 text-[9px] uppercase tracking-wider font-extrabold text-black/50">
                        <th className="p-3">Order / AWB</th>
                        <th className="p-3">Customer / City</th>
                        <th className="p-3">Delhivery Live Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-bold">
                      {orders.filter(o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED').length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-black/45 font-normal">
                            No orders currently shipped via Delhivery found in database.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter(o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED')
                          .map(order => {
                            const liveData = orderLiveStatuses[order.trackingNumber || ''];
                            return (
                              <tr key={order.id} className="hover:bg-black/[0.01]">
                                <td className="p-3">
                                  <div className="text-[10px] font-extrabold text-black">{order.id}</div>
                                  <div className="text-[9px] font-mono text-black/50">{order.trackingNumber}</div>
                                </td>
                                <td className="p-3">
                                  <div className="text-[10px] font-extrabold text-black">{order.customerName}</div>
                                  <div className="text-[9px] text-black/50">{order.shippingAddress.state}</div>
                                </td>
                                <td className="p-3">
                                  {liveData ? (
                                    <div className="space-y-1">
                                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                                        (liveData.Status?.Status || '').toUpperCase() === 'DELIVERED' 
                                          ? 'bg-emerald-500/10 text-emerald-800' 
                                          : 'bg-blue-500/10 text-blue-800'
                                      }`}>
                                        {liveData.Status?.Status || 'Unknown'}
                                      </span>
                                      <div className="text-[8px] text-black/50 font-normal">
                                        Last scan: {liveData.Status?.Instructions || 'No scan detail'}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-black/40 font-medium">Not checked yet</span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={async () => {
                                      if (order.trackingNumber) {
                                        const details = await getDelhiveryTrackingDetails(order.trackingNumber);
                                        if (details) {
                                          setOrderLiveStatuses({ ...orderLiveStatuses, [order.trackingNumber]: details });
                                        } else {
                                          alert('Failed to get status from Delhivery.');
                                        }
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-black text-white hover:bg-black/80 text-[9px] uppercase tracking-wider font-bold rounded"
                                  >
                                    Get Live Status
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden space-y-3">
                  {orders.filter(o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED').length === 0 ? (
                    <div className="p-8 text-center text-black/45 text-xs font-normal">
                      No orders currently shipped via Delhivery found in database.
                    </div>
                  ) : (
                    orders
                      .filter(o => o.courierName === 'Delhivery' && o.trackingNumber && o.orderStatus !== 'CANCELLED')
                      .map(order => {
                        const liveData = orderLiveStatuses[order.trackingNumber || ''];
                        return (
                          <div key={order.id} className="bg-[#fcfbf9] border border-black/5 p-4 rounded-xl space-y-2.5 shadow-xs text-xs font-bold">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-extrabold text-black">{order.customerName}</h4>
                                <p className="text-[10px] text-black/50 font-mono mt-0.5">AWB: {order.trackingNumber}</p>
                                <p className="text-[9px] text-black/45">Order ID: {order.id}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-black/5 px-2 py-0.5 rounded">
                                  {order.shippingAddress.state}
                                </span>
                              </div>
                            </div>
                            <div className="border-t border-black/5 pt-2.5 flex justify-between items-center">
                              <div>
                                {liveData ? (
                                  <div className="space-y-0.5">
                                    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                                      (liveData.Status?.Status || '').toUpperCase() === 'DELIVERED' 
                                        ? 'bg-emerald-500/10 text-emerald-800' 
                                        : 'bg-blue-500/10 text-blue-800'
                                    }`}>
                                      {liveData.Status?.Status || 'Unknown'}
                                    </span>
                                    <p className="text-[8px] text-black/50 mt-1 font-normal">
                                      {liveData.Status?.Instructions || 'No scan detail'}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-black/40 font-medium">Not checked yet</span>
                                )}
                              </div>
                              <button
                                onClick={async () => {
                                  if (order.trackingNumber) {
                                    const details = await getDelhiveryTrackingDetails(order.trackingNumber);
                                    if (details) {
                                      setOrderLiveStatuses({ ...orderLiveStatuses, [order.trackingNumber]: details });
                                    } else {
                                      alert('Failed to get status from Delhivery.');
                                    }
                                  }
                                }}
                                className="px-2.5 py-1 bg-black text-white text-[9px] uppercase tracking-wider font-bold rounded"
                              >
                                Get Status
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Column 3: Real API Tools Sidebar */}
              <div className="space-y-8">
                
                {/* A. Live Pincode Serviceability Lookup */}
                <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl space-y-4 shadow-xs">
                  <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-black border-b border-black/5 pb-2">
                    Delhivery Pincode Checker
                  </h3>
                  
                  <form onSubmit={handleCheckDelhiveryPincode} className="space-y-3.5">
                    {delhiveryPincodeError && (
                      <div className="text-red-700 text-[10px] bg-red-50 border border-red-200 p-2.5 rounded-lg font-bold">
                        {delhiveryPincodeError}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-black/50 font-extrabold block">Check Pincode Serviceability</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="e.g. 110001"
                        value={delhiveryPincode}
                        onChange={(e) => setDelhiveryPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCheckingPincode}
                      className="w-full bg-black text-white hover:bg-black/80 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-full transition-all"
                    >
                      {isCheckingPincode ? 'Checking...' : 'Check Serviceability'}
                    </button>
                  </form>

                  {delhiveryPincodeResult && (
                    <div className="bg-white border border-black/5 p-4 rounded-xl space-y-2.5 text-[10px] font-bold">
                      <div className="flex justify-between border-b border-black/5 pb-1.5">
                        <span className="text-black/50">Location:</span>
                        <span>{delhiveryPincodeResult.district}, {delhiveryPincodeResult.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Prepaid Delivery:</span>
                        <span>{delhiveryPincodeResult.prepaid ? '🟢 Serviceable' : '🔴 Unserviceable'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Cash On Delivery (COD):</span>
                        <span>{delhiveryPincodeResult.cod ? '🟢 Serviceable' : '🔴 Unserviceable'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Courier Pickup:</span>
                        <span>{delhiveryPincodeResult.pickup ? '🟢 Serviceable' : '🔴 Unserviceable'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* B. Live Tracking Scan Timeline (External Lookup) */}
                <div className="bg-[#fcfbf9] border border-black/5 p-6 rounded-2xl space-y-4 shadow-xs">
                  <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-black border-b border-black/5 pb-2">
                    Delhivery Quick Waybill Tracker
                  </h3>
                  
                  <form onSubmit={handleTrackExternalAwb} className="space-y-3.5">
                    {externalTrackingError && (
                      <div className="text-red-700 text-[10px] bg-red-50 border border-red-200 p-2.5 rounded-lg font-bold">
                        {externalTrackingError}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-black/50 font-extrabold block">Enter Waybill / AWB</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5774381000066"
                        value={externalAwb}
                        onChange={(e) => setExternalAwb(e.target.value)}
                        className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isTrackingAwb}
                      className="w-full bg-black text-white hover:bg-black/80 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-full transition-all"
                    >
                      {isTrackingAwb ? 'Tracking...' : 'Track Shipment'}
                    </button>
                  </form>

                  {externalTrackingResult && (
                    <div className="bg-white border border-black/5 p-4 rounded-xl space-y-3 text-[10px] font-bold">
                      <div className="flex justify-between border-b border-black/5 pb-1.5">
                        <span className="text-black/50">Current Status:</span>
                        <span className="uppercase text-black">{externalTrackingResult.Status || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50 font-bold">Recipient:</span>
                        <span>{externalTrackingResult.Recipient || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/50">Instructions:</span>
                        <span className="text-black/80 text-right">{externalTrackingResult.Instructions || 'None'}</span>
                      </div>
                      
                      {externalTrackingResult.Scans && externalTrackingResult.Scans.length > 0 && (
                        <div className="border-t border-black/5 pt-2 space-y-2">
                          <span className="text-[8px] uppercase tracking-widest text-black/50 block">Scan timeline log:</span>
                          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                            {externalTrackingResult.Scans.map((scan: any, i: number) => (
                              <div key={i} className="border-l border-black/10 pl-2 py-0.5 text-left">
                                <div className="text-black/80 font-bold">{scan.ScanDetail?.Scan}</div>
                                <div className="text-[8px] text-black/40 font-normal">{scan.ScanDetail?.ScanDateTime} - {scan.ScanDetail?.ScannedLocation}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}
        {/* TAB: USER ACCOUNTS MANAGER */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-6">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">
                  User Accounts Directory
                </h2>
                <p className="text-[10px] text-black/50 mt-0.5 font-bold">
                  Manage registered customer accounts, staff privileges, roles, and platform permissions.
                </p>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users by name, email, or mobile..."
                  value={searchQueryUsers}
                  onChange={(e) => setSearchQueryUsers(e.target.value)}
                  className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                />
              </div>
              <div className="w-full sm:w-64">
                <select
                  value={roleFilterUsers}
                  onChange={(e) => setRoleFilterUsers(e.target.value)}
                  className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black bg-white font-bold"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                  <option value="STORE_MANAGER">Store Managers</option>
                  <option value="MARKETING_MANAGER">Marketing Managers</option>
                  <option value="CUSTOMER_SUPPORT">Customer Support</option>
                  <option value="CUSTOMER">Customers Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto border border-black/5 rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#fcfbf9] border-b border-black/5 text-[9px] uppercase tracking-wider font-extrabold text-black/50">
                    <th className="p-3">User Details</th>
                    <th className="p-3">Contact Information</th>
                    <th className="p-3">System Role</th>
                    <th className="p-3">Addresses</th>
                    <th className="p-3">Date Registered</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-bold">
                  {usersList
                    .filter(u => {
                      const query = searchQueryUsers.toLowerCase().trim();
                      const matchesSearch = !query || 
                        u.name.toLowerCase().includes(query) ||
                        u.email.toLowerCase().includes(query) ||
                        (u.mobile && u.mobile.includes(query));
                      
                      const matchesRole = roleFilterUsers === 'ALL' || u.role === roleFilterUsers;
                      return matchesSearch && matchesRole;
                    })
                    .length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-black/45 font-normal">
                          No registered users found matching the search filters.
                        </td>
                      </tr>
                    ) : (
                      usersList
                        .filter(u => {
                          const query = searchQueryUsers.toLowerCase().trim();
                          const matchesSearch = !query || 
                            u.name.toLowerCase().includes(query) ||
                            u.email.toLowerCase().includes(query) ||
                            (u.mobile && u.mobile.includes(query));
                          
                          const matchesRole = roleFilterUsers === 'ALL' || u.role === roleFilterUsers;
                          return matchesSearch && matchesRole;
                        })
                        .map(item => (
                          <tr key={item.id} className="hover:bg-black/[0.01]">
                            <td className="p-3">
                              <div className="text-[10px] font-extrabold text-black">{item.name || 'Unnamed Guest'}</div>
                              <div className="text-[8px] text-black/40 font-mono mt-0.5">{item.id}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-[10px] text-black font-semibold">{item.email}</div>
                              <div className="text-[9px] text-black/50 mt-0.5">{item.mobile || 'No Mobile'}</div>
                            </td>
                            <td className="p-3">
                              <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded ${
                                item.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-800' :
                                item.role === 'STORE_MANAGER' ? 'bg-amber-500/10 text-amber-800' :
                                item.role === 'CUSTOMER' ? 'bg-black/5 text-black/70' : 'bg-blue-500/10 text-blue-800'
                              }`}>
                                {item.role}
                              </span>
                            </td>
                            <td className="p-3 text-black/60 font-medium">
                              {item.addresses && item.addresses.length > 0 ? (
                                <div className="space-y-1.5 max-w-xs text-[10px]">
                                  {item.addresses.map((addr) => (
                                    <div key={addr.id} className="border-l border-black/10 pl-2 leading-tight py-0.5">
                                      <span className="font-semibold block text-black">{addr.street}</span>
                                      <span className="text-[9px] text-black/50">{addr.city}, {addr.state} - {addr.pincode}</span>
                                      {addr.isDefault && (
                                        <span className="inline-block text-[7px] bg-black/5 text-black px-1.5 py-0.2 rounded font-extrabold ml-1 uppercase">Default</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-black/40 font-normal">No addresses registered</span>
                              )}
                            </td>
                            <td className="p-3 text-black/50 text-[10px]">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              }) : 'N/A'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleEditUserClick(item)}
                                  className="text-black/60 hover:text-black p-1.5 border border-black/10 hover:border-black bg-white rounded-lg transition-all shadow-xs"
                                  title="Edit User Details"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                {user?.role === 'SUPER_ADMIN' && user?.id !== item.id && (
                                  <button
                                    onClick={() => handleDeleteUserClick(item.id)}
                                    className="text-red-700 hover:text-red-800 p-1.5 border border-black/10 hover:border-red-700 hover:bg-red-50 rounded-lg transition-all shadow-xs"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden space-y-4">
              {usersList
                .filter(u => {
                  const query = searchQueryUsers.toLowerCase().trim();
                  const matchesSearch = !query || 
                    u.name.toLowerCase().includes(query) ||
                    u.email.toLowerCase().includes(query) ||
                    (u.mobile && u.mobile.includes(query));
                  
                  const matchesRole = roleFilterUsers === 'ALL' || u.role === roleFilterUsers;
                  return matchesSearch && matchesRole;
                })
                .length === 0 ? (
                  <div className="p-8 text-center text-black/45 text-xs font-normal">
                    No registered users found matching the search filters.
                  </div>
                ) : (
                  usersList
                    .filter(u => {
                      const query = searchQueryUsers.toLowerCase().trim();
                      const matchesSearch = !query || 
                        u.name.toLowerCase().includes(query) ||
                        u.email.toLowerCase().includes(query) ||
                        (u.mobile && u.mobile.includes(query));
                      
                      const matchesRole = roleFilterUsers === 'ALL' || u.role === roleFilterUsers;
                      return matchesSearch && matchesRole;
                    })
                    .map(item => (
                      <div key={item.id} className="bg-[#fcfbf9] border border-black/5 p-4 rounded-xl space-y-3.5 shadow-xs text-xs font-bold">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-extrabold text-black">{item.name || 'Unnamed Guest'}</h4>
                            <p className="text-[9px] text-black/40 font-mono mt-0.5">{item.id}</p>
                            <p className="text-[10px] text-black/60 font-semibold mt-1">{item.email}</p>
                            <p className="text-[10px] text-black/60 font-semibold">{item.mobile || 'No Mobile'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded ${
                              item.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-800' :
                              item.role === 'STORE_MANAGER' ? 'bg-amber-500/10 text-amber-800' :
                              item.role === 'CUSTOMER' ? 'bg-black/5 text-black/70' : 'bg-blue-500/10 text-blue-800'
                            }`}>
                              {item.role}
                            </span>
                            <span className="text-[9px] text-black/40 block mt-1.5">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              }) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white border border-black/5 p-3 rounded-xl text-[10px] leading-relaxed">
                          <span className="text-[8px] uppercase tracking-wider text-black/50 font-extrabold block">Saved Addresses ({item.addresses?.length || 0})</span>
                          {item.addresses && item.addresses.length > 0 ? (
                            item.addresses.map((addr: any, idx: number) => (
                              <div key={idx} className="mt-1 pb-1 border-b border-black/5 last:border-b-0 font-medium">
                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode} {addr.isDefault && <span className="text-emerald-800 font-extrabold text-[8px]">(Default)</span>}
                              </div>
                            ))
                          ) : (
                            <p className="text-black/40 font-normal">No addresses saved.</p>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-black/5">
                          <button
                            onClick={() => handleEditUserClick(item)}
                            className="px-2.5 py-1.5 border border-black/10 hover:border-black bg-white rounded-lg transition-all text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          {user?.role === 'SUPER_ADMIN' && user?.id !== item.id && (
                            <button
                              onClick={() => handleDeleteUserClick(item.id)}
                              className="px-2.5 py-1.5 border border-black/10 hover:border-red-700 bg-white text-red-650 hover:text-red-750 hover:bg-red-50 rounded-lg transition-all shadow-xs text-[10px] font-bold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
            </div>

            {/* EDIT USER OVERLAY MODAL */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white border border-black/10 p-8 rounded-3xl w-full max-w-md shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-black/5 pb-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-black">
                      Edit User Profile
                    </h3>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="p-1 text-black/40 hover:text-black border border-black/5 hover:border-black/20 rounded-full transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUserFormSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-black/50 font-extrabold block">Full Name</label>
                      <input
                        type="text"
                        required
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-black/50 font-extrabold block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-black/50 font-extrabold block">Mobile Number</label>
                      <input
                        type="text"
                        value={userForm.mobile}
                        onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                        className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black"
                      />
                    </div>

                    {user?.role === 'SUPER_ADMIN' && (
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-black/50 font-extrabold block">System Role</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                          className="w-full input-premium text-xs rounded-full px-4 py-2 border border-black/10 outline-none focus:border-black bg-white font-bold"
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="CUSTOMER_SUPPORT">Customer Support</option>
                          <option value="MARKETING_MANAGER">Marketing Manager</option>
                          <option value="STORE_MANAGER">Store Manager</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="flex-1 py-2.5 border border-black/10 hover:border-black text-[9px] uppercase tracking-widest font-bold rounded-full transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingUser}
                        className="flex-1 bg-black text-white hover:bg-black/85 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-full transition-all"
                      >
                        {isSavingUser ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
