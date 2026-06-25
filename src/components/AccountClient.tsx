'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSessionUser, loginAction, registerAction, getOrdersAction, getProductsAction } from '@/app/actions';
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
        window.location.reload();
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    } else {
      if (!identifier) {
        setAuthError('Email or Mobile is required.');
        return;
      }

      if (authMethod === 'otp') {
        if (!otpSent) {
          // Simulate sending OTP
          setOtpSent(true);
          setAuthError('');
          return;
        }
        if (otpCode !== '123456') {
          setAuthError('Invalid OTP code. Enter 123456 to log in.');
          return;
        }
        // Success login via OTP
        const res = await loginAction(identifier, undefined, true);
        if (res.success) {
          window.location.reload();
        } else {
          setAuthError(res.error || 'OTP Login failed.');
        }
      } else {
        if (!password) {
          setAuthError('Password is required.');
          return;
        }
        const res = await loginAction(identifier, password, false);
        if (res.success) {
          window.location.reload();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-xs text-white/50 font-light">
        Verifying Account Session...
      </div>
    );
  }

  // --- RENDER LOGIN/REGISTER PORTAL ---
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Infinity Access</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-white">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-xs text-white/50 font-light">
            {isRegister ? 'Join our luxury footwear program.' : 'Access your orders and addresses.'}
          </p>
        </div>

        <div className="bg-[#141821]/50 border border-white/5 p-6 rounded-lg backdrop-blur-md space-y-6">
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs p-3 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {isRegister ? (
              // REGISTER FIELDS
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/60">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full input-premium text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/60">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full input-premium text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/60">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    placeholder="10-digit Indian Mobile"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full input-premium text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/60">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full input-premium text-xs"
                  />
                </div>
              </>
            ) : (
              // LOGIN FIELDS
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/60">Email Address or Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter registered email or mobile"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full input-premium text-xs"
                  />
                </div>

                {authMethod === 'password' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-white/60">Password</label>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('otp')}
                        className="text-[10px] text-accent-teal hover:underline"
                      >
                        Login via OTP instead
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full input-premium text-xs"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-white/60">OTP Verification</label>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('password')}
                        className="text-[10px] text-accent-teal hover:underline"
                      >
                        Login via Password instead
                      </button>
                    </div>

                    {otpSent ? (
                      <>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter 6-digit OTP (Code: 123456)"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full input-premium text-center text-sm font-bold tracking-widest"
                        />
                        <span className="text-[10px] text-accent-teal/80 text-center block">
                          Demo OTP: <strong>123456</strong> sent to {identifier}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-white/40 block">
                        We will simulate sending a 6-digit code to your email/mobile.
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-widest rounded mt-4"
            >
              {isRegister ? 'Register' : otpSent ? 'Verify & Login' : authMethod === 'otp' ? 'Request OTP' : 'Login'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError('');
                setOtpSent(false);
              }}
              className="text-xs text-white/60 hover:text-accent-teal transition-colors tracking-wide"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER CUSTOMER DASHBOARD ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent-teal font-semibold">Customer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-white/50 mt-1">Role: {user.role} | {user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 rounded"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-2 bg-[#141821]/30 border border-white/5 p-4 rounded-lg">
          {[
            { id: 'profile', label: 'My Profile', icon: UserIcon },
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'recent', label: 'Recently Viewed', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-all rounded ${
                  activeTab === tab.id
                    ? 'bg-accent-teal text-background'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Right Tab Content */}
        <main className="lg:col-span-9 bg-[#141821]/15 border border-white/5 p-6 rounded-lg backdrop-blur-md min-h-[50vh]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80">
                <div className="space-y-1">
                  <span className="text-white/40 block uppercase tracking-wider">Full Name</span>
                  <span className="text-sm font-semibold text-white">{user.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-white/40 block uppercase tracking-wider">Mobile Number</span>
                  <span className="text-sm font-semibold text-white">+91 {user.mobile}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-white/40 block uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-semibold text-white">{user.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-white/40 block uppercase tracking-wider">Created Date</span>
                  <span className="text-sm font-semibold text-white">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Saved Shipping Addresses</h3>
                
                {user.addresses.length === 0 ? (
                  <p className="text-xs text-white/50 font-light">No saved shipping addresses yet. Add one during checkout.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 border rounded-md space-y-1.5 text-xs font-light text-white/80 relative ${
                          addr.isDefault ? 'border-accent-teal bg-accent-teal/5' : 'border-white/10 bg-white/5'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 bg-accent-teal text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        <p className="font-semibold text-white">Address Details:</p>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - <strong className="text-white">{addr.pincode}</strong></p>
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
              <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
                Order History & Invoices
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-white/50 font-light tracking-wide">You have not placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="btn-primary inline-block px-5 py-2 text-xs uppercase tracking-widest font-semibold"
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
                        className="border border-white/10 rounded-lg overflow-hidden bg-[#1f2833]/15"
                      >
                        {/* Order Header info */}
                        <div className="bg-[#141821]/70 border-b border-white/10 p-4 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/70">
                          <div>
                            <span className="text-[10px] text-white/40 uppercase block">Order ID</span>
                            <span className="font-bold text-white tracking-widest">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/40 uppercase block">Placed On</span>
                            <span className="font-medium text-white">{orderDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/40 uppercase block">Payment Status</span>
                            <span
                              className={`font-semibold ${
                                order.paymentStatus === 'PAID' ? 'text-[#10b981]' : 'text-warning'
                              }`}
                            >
                              {order.paymentStatus} ({order.paymentMethod})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/40 uppercase block">Order Status</span>
                            <span
                              className={`font-bold uppercase ${
                                order.orderStatus === 'DELIVERED'
                                  ? 'text-[#10b981]'
                                  : order.orderStatus === 'DISPATCHED'
                                  ? 'text-accent-teal'
                                  : 'text-warning'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 divide-y divide-white/5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 flex gap-4 text-xs">
                              <div className="w-12 h-14 bg-white/5 rounded overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex justify-between">
                                <div>
                                  <h4 className="font-medium text-white">{item.name}</h4>
                                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                    Size: UK {item.size} | Qty: {item.quantity}
                                  </p>
                                </div>
                                <span className="font-semibold text-white">₹{item.price.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="bg-[#141821]/45 p-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                          {/* Tracking status if dispatched */}
                          {order.orderStatus === 'DISPATCHED' && order.trackingNumber && (
                            <div className="bg-accent-teal/5 border border-accent-teal/20 p-2.5 rounded text-[11px] text-accent-teal w-full sm:w-auto">
                              <p className="font-semibold">Shipment Dispatched:</p>
                              <p>Courier: {order.courierName} | Tracking: <strong className="text-white select-all">{order.trackingNumber}</strong></p>
                              <p className="opacity-80">Details: {order.dispatchDetails}</p>
                            </div>
                          )}

                          <div className="text-right w-full sm:w-auto">
                            <span className="text-white/50 mr-2">Paid:</span>
                            <span className="text-sm font-bold text-accent-teal">₹{order.finalAmount.toLocaleString('en-IN')}</span>
                          </div>

                          {/* Print Invoice Button */}
                          <Link
                            href={`/invoice/${order.id}`}
                            target="_blank"
                            className="btn-secondary px-4 py-2 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 rounded w-full sm:w-auto text-center justify-center"
                          >
                            <FileText className="w-3.5 h-3.5" /> View GST Invoice
                          </Link>
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
              <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
                My Wishlist ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <p className="text-xs text-white/50 font-light">No items saved to your wishlist yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#141821]/50 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/10 transition-colors"
                    >
                      <Link href={`/product/${p.id}`} className="aspect-[4/5] bg-white/5 overflow-hidden block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-accent-teal font-semibold block">{p.brand}</span>
                        <Link href={`/product/${p.id}`} className="text-xs font-semibold text-white hover:text-accent-teal line-clamp-1 block">
                          {p.name}
                        </Link>
                        <span className="text-xs font-bold text-white block">₹{p.sellingPrice.toLocaleString('en-IN')}</span>
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
              <h2 className="text-base font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
                Recently Viewed Articles
              </h2>

              {recentProducts.length === 0 ? (
                <p className="text-xs text-white/50 font-light">No recently viewed history recorded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#141821]/50 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/10 transition-colors"
                    >
                      <Link href={`/product/${p.id}`} className="aspect-[4/5] bg-white/5 overflow-hidden block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-accent-teal font-semibold block">{p.brand}</span>
                        <Link href={`/product/${p.id}`} className="text-xs font-semibold text-white hover:text-accent-teal line-clamp-1 block">
                          {p.name}
                        </Link>
                        <span className="text-xs font-bold text-white block">₹{p.sellingPrice.toLocaleString('en-IN')}</span>
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
