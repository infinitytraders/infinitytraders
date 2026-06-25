'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getSessionUser, createOrderAction } from '@/app/actions';
import { User, Order } from '@/lib/db';
import { ShoppingBag, CreditCard, CheckCircle2, ChevronRight, AlertTriangle, Truck, MapPin, Sparkles, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    gstAmount,
    shippingCharges,
    couponDiscount,
    finalAmount,
    coupon,
    clearCart
  } = useCart();

  // Session & User State
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');

  // Checkout Status States
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  // Load session
  useEffect(() => {
    getSessionUser().then((u) => {
      setUser(u);
      setLoadingSession(false);
      if (u) {
        setName(u.name);
        setEmail(u.email);
        setMobile(u.mobile);
        
        // Auto fill default address if exists
        const defaultAddr = u.addresses.find(a => a.isDefault);
        if (defaultAddr) {
          setStreet(defaultAddr.street);
          setCity(defaultAddr.city);
          setState(defaultAddr.state);
          setPincode(defaultAddr.pincode);
        }
      }
    });
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const validateForm = (): boolean => {
    setValidationError('');
    if (!name.trim()) return setError('Full Name is required.');
    if (!email.trim() || !email.includes('@')) return setError('Valid Email is required.');
    if (!mobile.trim() || mobile.length !== 10) return setError('10-digit mobile number is required.');
    if (!street.trim()) return setError('Street Address is required.');
    if (!city.trim()) return setError('City is required.');
    if (!state.trim()) return setError('State is required.');
    if (!pincode.trim() || pincode.length !== 6) return setError('6-digit pincode is required.');
    return true;
  };

  const setError = (msg: string): boolean => {
    setValidationError(msg);
    return false;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'RAZORPAY') {
      setShowPaymentModal(true);
    } else {
      await processOrderPlacement();
    }
  };

  const processOrderPlacement = async () => {
    setIsSubmitting(true);
    setValidationError('');

    const orderPayload = {
      customerName: name,
      customerEmail: email,
      customerMobile: mobile,
      shippingAddress: { street, city, state, pincode },
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        image: item.product.images[0],
        quantity: item.quantity,
        size: item.size,
        price: item.product.sellingPrice
      })),
      orderValue: subtotal,
      gstAmount,
      shippingCharges,
      couponApplied: coupon?.code,
      finalAmount,
      paymentMethod
    };

    const res = await createOrderAction(orderPayload);
    setIsSubmitting(false);
    setShowPaymentModal(false);

    if (res.success && res.order) {
      setOrderConfirmed(res.order);
      clearCart();
      // Throw confetti!
      triggerConfetti();
    } else {
      setValidationError(res.error || 'Failed to place order.');
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#66fcf1', '#45f3ff', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#66fcf1', '#45f3ff', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  if (loadingSession) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-xs text-white/50 font-light">
        Loading Checkout Parameters...
      </div>
    );
  }

  // --- ORDER CONFIRMED CELEBRATION SCREEN ---
  if (orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-accent-teal/10 border border-accent-teal/30 text-accent-teal animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Thank you for your order!</span>
          <h1 className="text-3xl font-extrabold tracking-widest text-white uppercase">Order Confirmed</h1>
          <p className="text-xs text-white/60 font-light">
            Your payment was successfully received. We have sent an email invoice and dispatch schedule to {orderConfirmed.customerEmail}.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-[#141821]/50 border border-white/5 p-6 rounded-lg text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50 uppercase">Order Reference</span>
            <strong className="text-white tracking-widest">{orderConfirmed.id}</strong>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50 uppercase">Dispatch Depot</span>
            <span className="text-white font-medium">Dhanbad HQ, Jharkhand</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50 uppercase">Paid Amount</span>
            <strong className="text-accent-teal">₹{orderConfirmed.finalAmount.toLocaleString('en-IN')}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 uppercase">Estimated Transit</span>
            <span className="text-white font-semibold">3-4 Working Days</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/invoice/${orderConfirmed.id}`}
            target="_blank"
            className="flex-1 btn-primary py-3.5 text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Download GST Invoice
          </Link>
          <Link
            href="/shop"
            className="flex-1 btn-secondary py-3.5 text-xs font-bold uppercase tracking-widest rounded text-center block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // --- STANDARD CART IS EMPTY DISCLOSURE ---
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#1f2833]/20 border border-white/5 flex items-center justify-center mx-auto text-white/30">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Empty Bag</h2>
        <p className="text-xs text-white/50 font-light">Add performance sneakers or sliders to initiate checkout.</p>
        <Link
          href="/shop"
          className="btn-primary inline-block px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  // --- CHECKOUT SUBMISSION INTERFACE ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center sm:text-left space-y-1 border-b border-white/5 pb-6 mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-accent-teal font-semibold">Secure checkout</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase mt-1">
          Review & Complete Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Forms */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
          {validationError && (
            <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs p-3 rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Customer Contact details */}
          <div className="bg-[#141821]/50 border border-white/5 p-6 rounded-lg space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2.5">
              1. Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-premium text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="Indian mobile phone"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full input-premium text-xs"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full input-premium text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="bg-[#141821]/50 border border-white/5 p-6 rounded-lg space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2.5">
              2. Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">Flat/Building, Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Enter street address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full input-premium text-xs"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">City</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full input-premium text-xs"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">State</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full input-premium text-xs"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/60">Pincode (6 digits)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6 digits code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full input-premium text-xs font-semibold tracking-wider text-center"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Options */}
          <div className="bg-[#141821]/50 border border-white/5 p-6 rounded-lg space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2.5">
              3. Payment Settlement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 border rounded-md text-left flex flex-col justify-between h-24 transition-colors ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-accent-teal bg-accent-teal/5 text-accent-teal'
                    : 'border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Razorpay Online Payment</p>
                  <p className="text-[10px] opacity-75">Pay via Cards, UPI, Netbanking</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 border rounded-md text-left flex flex-col justify-between h-24 transition-colors ${
                  paymentMethod === 'COD'
                    ? 'border-accent-teal bg-accent-teal/5 text-accent-teal'
                    : 'border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <Truck className="w-6 h-6" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Cash on Delivery (COD)</p>
                  <p className="text-[10px] opacity-75">Settle with cash upon delivery</p>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1.5"
          >
            {paymentMethod === 'RAZORPAY' ? 'Proceed to Pay ₹' + finalAmount.toLocaleString('en-IN') : 'Place Order via COD'}
          </button>
        </form>

        {/* Right Column: Order Summary Review */}
        <aside className="lg:col-span-5 bg-[#141821]/30 border border-white/5 p-6 rounded-lg space-y-6">
          <h2 className="text-xs uppercase tracking-widest font-bold text-white border-b border-white/5 pb-3">
            Review Articles ({totalItems})
          </h2>

          <div className="divide-y divide-white/5 max-h-60 overflow-y-auto pr-2">
            {cart.map((item, idx) => (
              <div key={idx} className="py-3 flex gap-3 text-xs">
                <div className="w-10 h-12 bg-white/5 rounded overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <h3 className="font-semibold text-white line-clamp-1">{item.product.name}</h3>
                    <p className="text-[10px] text-white/50">Size: UK {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <span className="text-white font-medium">₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-white/70 font-light">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-white/40 italic">
              <span>Included GST Breakdown (18%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-accent-teal">
                <span>Coupon Applied ({coupon?.code})</span>
                <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping & Route</span>
              <span>{shippingCharges === 0 ? <strong className="text-accent-teal uppercase">Free</strong> : '₹' + shippingCharges}</span>
            </div>
            <div className="border-t border-white/5 pt-3 mt-1 flex justify-between text-sm font-bold text-white">
              <span className="uppercase tracking-wider">Final Payable Amount</span>
              <span className="text-accent-teal text-base">₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* RAZORPAY SIMULATED GATEWAY POPUP MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative bg-[#141821] border border-white/10 rounded-lg p-6 max-w-sm w-full space-y-6 text-center z-10 shadow-2xl">
            <div className="flex justify-center">
              <span className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-1 border border-accent-teal/30 px-3 py-1 bg-accent-teal/5 text-accent-teal">
                <Sparkles className="w-4 h-4 text-accent-teal animate-spin" /> Razorpay Secured
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-widest font-bold text-white">Complete Transaction</h3>
              <p className="text-xs text-white/50 font-light">
                Secure checkout portal for <strong>₹{finalAmount.toLocaleString('en-IN')}</strong>. Simulated Razorpay transaction.
              </p>
            </div>

            <div className="border border-white/5 bg-white/5 p-4 rounded-md space-y-3 text-xs text-left">
              <p className="text-[10px] uppercase text-white/40">Select Payment Route</p>
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input type="radio" defaultChecked className="accent-accent-teal" />
                <span>Unified Payments Interface (UPI/Google Pay)</span>
              </label>
              <label className="flex items-center gap-2 text-white/40">
                <input type="radio" disabled className="accent-accent-teal" />
                <span>Credit / Debit Card (Not available in demo)</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 btn-secondary py-2.5 text-[10px] uppercase tracking-widest font-semibold rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processOrderPlacement}
                className="flex-1 btn-primary py-2.5 text-[10px] uppercase tracking-widest font-bold rounded"
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
