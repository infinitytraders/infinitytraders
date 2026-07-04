'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSessionUser, loginAction, registerAction, getOrdersAction, getProductsAction, sendOtpAction, verifyOtpAction, cancelOrderAction } from '@/app/actions';
import type { User, Order, Product } from '@/lib/db';
import { Star, User as UserIcon, Package, Heart, Eye, LogOut, Plus, AlertCircle, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Session State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'recent'>('profile');

  // Auth form states
  const [isRegister, setIsRegister] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Dashboard Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [addingAddress, setAddingAddress] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      const res = await cancelOrderAction(orderId);
      if (res.success) {
        alert('Order cancelled successfully.');
        // Refresh orders list
        getOrdersAction().then(res => {
          if (res.success && res.orders) setOrders(res.orders);
        });
      } else {
        alert(res.error || 'Failed to cancel order.');
      }
    } catch (err: any) {
      alert(err.message || 'Error cancelling order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Load Session
  useEffect(() => {
    getSessionUser().then((u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Load data if logged in
        getOrdersAction().then(res => {
          if (res.success && res.orders) setOrders(res.orders);
        });
        getProductsAction().then(allProducts => {
          setWishlistProducts(allProducts.filter(p => u.wishlist.includes(p.id)));
          setRecentProducts(allProducts.filter(p => u.recentlyViewed.includes(p.id)));
        });
      }
    });
  }, []);

  const handleAuthSuccess = () => {
    if (redirect && redirect !== '/') {
      window.location.href = redirect;
    } else {
      window.location.reload();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isRegister) {
      if (!regName || !regEmail || !regMobile || !regPassword) {
        setAuthError('All fields are required.');
        return;
      }
      const res = await registerAction({
        name: regName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
      });
      if (res.success) {
        handleAuthSuccess();
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    } else {
      if (!identifier) {
        setAuthError('Email or Mobile is required.');
        return;
      }

      if (authMethod === 'otp') {
        const isEmail = identifier.includes('@');
        if (!otpSent) {
          if (isEmail) {
            const res = await sendOtpAction(identifier);
            if (res.success) {
              setOtpSent(true);
              setAuthError('');
            } else {
              setAuthError(res.error || 'Failed to send verification code.');
            }
          } else {
            // Mock Mobile OTP
            setOtpSent(true);
            setAuthError('');
          }
          return;
        }

        // Verification phase
        if (isEmail) {
          const res = await verifyOtpAction(identifier, otpCode);
          if (res.success) {
            handleAuthSuccess();
          } else {
            setAuthError(res.error || 'Invalid OTP code.');
          }
        } else {
          // Mock Mobile OTP Verification
          if (otpCode !== '123456') {
            setAuthError('Invalid OTP code. Enter 123456 to log in.');
            return;
          }
          const res = await loginAction(identifier, undefined, true);
          if (res.success) {
            handleAuthSuccess();
          } else {
            setAuthError(res.error || 'OTP Login failed.');
          }
        }
      } else {
        if (!password) {
          setAuthError('Password is required.');
          return;
        }
        const res = await loginAction(identifier, password, false);
        if (res.success) {
          handleAuthSuccess();
        } else {
          setAuthError(res.error || 'Login failed.');
        }
      }
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) return;

    const updatedAddresses = [
      ...user.addresses,
      {
        id: `addr_${Date.now()}`,
        ...newAddress,
        isDefault: user.addresses.length === 0,
      },
    ];

    setUser({
      ...user,
      addresses: updatedAddresses
    });
    setNewAddress({ street: '', city: '', state: '', pincode: '' });
    setAddingAddress(false);
  };

  const handleLogout = async () => {
    const { logoutAction } = await import('@/app/actions');
    await logoutAction();
    setUser(null);
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-[10px] text-black/50 font-bold bg-[#f4f3ef]">
        Verifying Account Session...
      </div>
    );
  }

  // --- RENDER LOGIN/REGISTER PORTAL ---
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.015)] grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Brand Image Banner */}
          <div className="hidden md:flex md:col-span-5 relative bg-black items-center justify-center p-8 overflow-hidden select-none">
            <div className="absolute inset-0 z-0">
              <img 
                src="/image-runner.png" 
                alt="Infinity Performance" 
                className="w-full h-full object-cover opacity-50 object-center filter grayscale brightness-75 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>
            
            <div className="relative z-10 text-left space-y-4 w-full">
              <div className="flex items-center gap-2 text-white">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M30 35 C15 35 15 65 30 65 C45 65 55 35 70 35 C85 35 85 65 70 65 C55 65 45 35 30 35 Z"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase">INFINITY</span>
                  <span className="text-[8px] font-light tracking-[0.25em] uppercase text-white/60 mt-0.5">TRADERS</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">
                INFINITY ACCESS
              </h2>
              <p className="text-[10px] text-white/70 font-medium leading-relaxed max-w-xs">
                Unlock order tracking, view invoice documents, save shipping addresses, and receive early updates on new shoe drops.
              </p>
            </div>
          </div>

          {/* Right Column: Portal Form */}
          <div className="col-span-12 md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#faf9f5]/20">
            <div className="space-y-6">
              {/* Header Title */}
              <div className="space-y-1 text-left">
                {/* Mobile-only logo */}
                <div className="md:hidden flex items-center gap-2 mb-4 select-none">
                  <svg
                    className="w-8 h-8 text-black"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30 35 C15 35 15 65 30 65 C45 65 55 35 70 35 C85 35 85 65 70 65 C55 65 45 35 30 35 Z"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  <div className="flex flex-col leading-none">
                    <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase">INFINITY</span>
                    <span className="text-[8px] font-light tracking-[0.25em] uppercase text-black/60 mt-0.5">TRADERS</span>
                  </div>
                </div>

                <span className="text-[9px] uppercase tracking-[0.35em] text-black/45 font-extrabold block">Member Panel</span>
                <h1 className="text-3xl font-black tracking-wider uppercase text-black">
                  {isRegister ? 'Register' : 'Sign In'}
                </h1>
                <p className="text-xs text-black/50 font-normal leading-relaxed">
                  {isRegister ? 'Create an account to track orders and save details.' : 'Access your purchases, billing addresses, and invoices.'}
                </p>
              </div>

              {/* Form elements */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authError && (
                  <div className="bg-red-500/5 border border-red-500/10 text-red-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {isRegister ? (
                  // REGISTER FIELDS
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-black font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@domain.shop"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-black font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        pattern="[6-9][0-9]{9}"
                        placeholder="10-digit Indian Mobile"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-black font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-black font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  // LOGIN FIELDS
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">Email Address or Mobile</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter registered email or mobile"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-black font-medium"
                      />
                    </div>

                    {authMethod === 'password' ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">Password</label>
                          <button
                            type="button"
                            onClick={() => setAuthMethod('otp')}
                            className="text-[9px] text-black/60 hover:text-black font-bold uppercase tracking-wider underline transition-colors"
                          >
                            OTP Login
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-black font-medium"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold block">OTP Verification</label>
                          <button
                            type="button"
                            onClick={() => setAuthMethod('password')}
                            className="text-[9px] text-black/60 hover:text-black font-bold uppercase tracking-wider underline transition-colors"
                          >
                            Password Login
                          </button>
                        </div>

                        {otpSent ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              required
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-4 py-2.5 text-center text-xs font-black tracking-[0.25em] outline-none transition-all text-black"
                            />
                            <span className="text-[9px] text-emerald-800 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-center block font-bold">
                              {identifier.includes('@') ? (
                                `A 6-digit verification code has been sent to ${identifier}`
                              ) : (
                                <>
                                  Demo OTP Code: <strong className="font-extrabold text-[10px]">123456</strong> sent to {identifier}
                                </>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-black/45 block font-medium leading-relaxed bg-black/5 px-3 py-2 rounded-lg">
                            {identifier.includes('@') ? (
                              `We will send a secure 6-digit verification code to your email address.`
                            ) : (
                              "We will simulate sending a 6-digit verification code to your mobile."
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-black/90 text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-xs hover:shadow-sm active:scale-[0.98] mt-4"
                >
                  {isRegister ? 'Register' : otpSent ? 'Verify & Login' : authMethod === 'otp' ? 'Request OTP' : 'Login'}
                </button>
              </form>

              {/* Bottom Toggle switch */}
              <div className="text-center pt-4 border-t border-black/[0.04]">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setAuthError('');
                    setOtpSent(false);
                  }}
                  className="text-[9px] text-black/55 hover:text-black transition-colors font-bold uppercase tracking-widest"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER CUSTOMER DASHBOARD ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#f4f3ef]">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-black/50 font-bold">Customer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-black/50 font-bold mt-1 uppercase tracking-widest">Role: {user.role} | {user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-white hover:bg-black text-black hover:text-white border border-black/10 hover:border-black px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-full transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-2 bg-white border border-black/5 p-4 rounded-2xl shadow-xs">
          {[
            { id: 'profile', label: 'My Profile', icon: UserIcon },
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'recent', label: 'Recently Viewed', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-full ${
                  isTabActive
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Right Tab Content */}
        <main className="lg:col-span-9 bg-white border border-black/5 p-6 sm:p-8 rounded-2xl shadow-xs min-h-[55vh]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-black/80">
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">Full Name</span>
                  <span className="text-sm font-extrabold text-black">{user.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">Mobile Number</span>
                  <span className="text-sm font-extrabold text-black">+91 {user.mobile}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">Email Address</span>
                  <span className="text-sm font-extrabold text-black">{user.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">Created Date</span>
                  <span className="text-sm font-extrabold text-black">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="border-t border-black/5 pt-6 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-black">Saved Shipping Addresses</h3>
                
                {user.addresses.length === 0 ? (
                  <p className="text-xs text-black/50 font-light">No saved shipping addresses yet. Add one during checkout.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 border rounded-2xl space-y-1.5 text-xs font-light text-black/80 relative ${
                          addr.isDefault ? 'border-black bg-[#fcfbf9]' : 'border-black/5 bg-[#fdfdfd]'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 bg-black text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <p className="font-extrabold text-black text-[10px] uppercase tracking-wider">Address Details:</p>
                        <p className="font-medium text-black">{addr.street}</p>
                        <p>{addr.city}, {addr.state} - <strong className="text-black">{addr.pincode}</strong></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
                Order History & Invoices
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black/35 mx-auto">
                    <Package className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-black/50 font-light tracking-wide">You have not placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="bg-black hover:bg-transparent text-white hover:text-black border border-black inline-block px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      dateStyle: 'medium',
                    });
                    return (
                      <div
                        key={order.id}
                        className="border border-black/5 rounded-2xl overflow-hidden bg-[#fdfdfd]"
                      >
                        {/* Order Header info */}
                        <div className="bg-[#f4f3ef] border-b border-black/5 p-4 flex flex-col sm:flex-row justify-between gap-4 text-xs text-black/70">
                          <div>
                            <span className="text-[9px] text-black/45 uppercase font-bold tracking-wider block">Order ID</span>
                            <span className="font-extrabold text-black tracking-widest">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-black/45 uppercase font-bold tracking-wider block">Placed On</span>
                            <span className="font-extrabold text-black">{orderDate}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-black/45 uppercase font-bold tracking-wider block">Payment Status</span>
                            <span
                              className={`font-extrabold uppercase ${
                                order.paymentStatus === 'PAID' ? 'text-teal-800' : 'text-amber-800'
                              }`}
                            >
                              {order.paymentStatus} ({order.paymentMethod})
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-black/45 uppercase font-bold tracking-wider block">Order Status</span>
                            <span
                              className={`font-extrabold uppercase ${
                                order.orderStatus === 'DELIVERED'
                                  ? 'text-teal-800'
                                  : order.orderStatus === 'DISPATCHED'
                                  ? 'text-black underline'
                                  : order.orderStatus === 'CANCELLED'
                                  ? 'text-rose-600'
                                  : 'text-amber-800'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 divide-y divide-black/5 bg-white">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 flex gap-4 text-xs">
                              <div className="w-12 h-14 bg-[#fcfbf9] border border-black/5 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex justify-between">
                                <div>
                                  <h4 className="font-extrabold text-black">{item.name}</h4>
                                  <p className="text-[9px] text-black/45 uppercase tracking-widest font-bold mt-0.5">
                                    Size: UK {item.size} | Qty: {item.quantity}
                                  </p>
                                </div>
                                <span className="font-extrabold text-black">₹{item.price.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="bg-[#fdfdfd] p-4 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                          {/* Tracking status if dispatched */}
                          {order.orderStatus === 'DISPATCHED' && order.trackingNumber && (
                            <div className="bg-white border border-black/10 p-3 rounded-2xl text-[10px] text-black w-full sm:w-auto shadow-xs">
                              <p className="font-extrabold uppercase tracking-wider text-black">Shipment Dispatched:</p>
                              <p className="mt-0.5">Courier: <strong className="font-extrabold">{order.courierName}</strong> | Tracking: <strong className="select-all font-extrabold underline">{order.trackingNumber}</strong></p>
                              <p className="opacity-80 mt-0.5">Details: {order.dispatchDetails}</p>
                            </div>
                          )}

                          <div className="text-right w-full sm:w-auto">
                            <span className="text-black/50 mr-2 uppercase tracking-wider text-[9px] font-bold">Paid:</span>
                            <span className="text-sm font-extrabold text-black">₹{order.finalAmount.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                            {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingOrderId === order.id}
                                className="bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 px-4 py-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-full transition-all w-full sm:w-auto text-center justify-center shadow-xs disabled:opacity-50 active:scale-[0.98]"
                              >
                                {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                              </button>
                            )}

                            {/* Print Invoice Button */}
                            <Link
                              href={`/invoice/${order.id}`}
                              target="_blank"
                              className="bg-white hover:bg-black text-black hover:text-white border border-black/15 hover:border-black px-4 py-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-full transition-all w-full sm:w-auto text-center justify-center shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" /> View GST Invoice
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
                My Wishlist ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <p className="text-xs text-black/50 font-light">No items saved to your wishlist yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-black/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all shadow-xs"
                    >
                      <Link href={`/product/${p.id}`} className="aspect-[4/5] bg-[#fcfbf9] overflow-hidden block relative border-b border-black/5">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="p-4 space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-black/45 font-bold block">{p.brand}</span>
                        <Link href={`/product/${p.id}`} className="text-xs font-extrabold text-black hover:underline line-clamp-1 block">
                          {p.name}
                        </Link>
                        <span className="text-xs font-extrabold text-black block">₹{p.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RECENTLY VIEWED TAB */}
          {activeTab === 'recent' && (
            <div className="space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
                Recently Viewed Articles
              </h2>

              {recentProducts.length === 0 ? (
                <p className="text-xs text-black/50 font-light">No recently viewed history recorded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-black/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all shadow-xs"
                    >
                      <Link href={`/product/${p.id}`} className="aspect-[4/5] bg-[#fcfbf9] overflow-hidden block relative border-b border-black/5">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="p-4 space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-black/45 font-bold block">{p.brand}</span>
                        <Link href={`/product/${p.id}`} className="text-xs font-extrabold text-black hover:underline line-clamp-1 block">
                          {p.name}
                        </Link>
                        <span className="text-xs font-extrabold text-black block">₹{p.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
