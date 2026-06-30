'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getSessionUser, createOrderAction } from '@/app/actions';
import { User, Order } from '@/lib/db';
import { ShoppingBag, CreditCard, CheckCircle2, AlertTriangle, Truck, Sparkles, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Script from 'next/script';

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
      const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_T7TLW2HhvqGGyq';
      
      const options = {
        key: rzpKeyId,
        amount: Math.round(finalAmount * 100), // in paise
        currency: 'INR',
        name: 'Infinity Traders',
        description: 'Secure Payment Gateway',
        image: '/hero_runner.png',
        handler: async function (response: any) {
          setIsSubmitting(true);
          await processOrderPlacement(response.razorpay_payment_id);
        },
        prefill: {
          name: name,
          email: email,
          contact: mobile
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error) {
        setValidationError('Failed to load Razorpay checkout SDK. Please verify your internet connection.');
      }
    } else {
      await processOrderPlacement();
    }
  };

  const processOrderPlacement = async (paymentId?: string) => {
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

    if (res.success && res.order) {
      setOrderConfirmed(res.order);
      clearCart();
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
        colors: ['#000000', '#d97706', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#d97706', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  if (loadingSession) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-[10px] text-black/50 font-bold bg-[#f4f3ef]">
        Loading Checkout Parameters...
      </div>
    );
  }

  // --- ORDER CONFIRMED CELEBRATION SCREEN ---
  if (orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 bg-[#f4f3ef] min-h-[70vh] flex flex-col justify-center">
        <div className="inline-flex p-4 rounded-full bg-black text-white mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-black/55 font-bold">Thank you for your order!</span>
          <h1 className="text-3xl font-extrabold tracking-wider text-black uppercase">Order Confirmed</h1>
          <p className="text-xs text-black/60 font-light leading-relaxed max-w-sm mx-auto">
            Your payment was successfully received. We have sent an email invoice and dispatch schedule to {orderConfirmed.customerEmail}.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white border border-black/5 p-6 rounded-2xl text-left text-xs space-y-3.5 shadow-xs">
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50 uppercase font-bold text-[9px] tracking-wider">Order Reference</span>
            <strong className="text-black tracking-widest font-extrabold">{orderConfirmed.id}</strong>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50 uppercase font-bold text-[9px] tracking-wider">Dispatch Depot</span>
            <span className="text-black font-extrabold">Dhanbad HQ, Jharkhand</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-black/50 uppercase font-bold text-[9px] tracking-wider">Paid Amount</span>
            <strong className="text-black font-extrabold">₹{orderConfirmed.finalAmount.toLocaleString('en-IN')}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-black/50 uppercase font-bold text-[9px] tracking-wider">Estimated Transit</span>
            <span className="text-black font-extrabold">3-4 Working Days</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/invoice/${orderConfirmed.id}`}
            target="_blank"
            className="flex-1 bg-black hover:bg-transparent text-white hover:text-black border border-black py-3.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Download GST Invoice
          </Link>
          <Link
            href="/shop"
            className="flex-1 bg-white hover:bg-black text-black hover:text-white border border-black/10 hover:border-black py-3.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all text-center block"
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
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 bg-[#f4f3ef] min-h-[60vh] flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black/35">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold uppercase tracking-widest text-black">Empty Bag</h2>
        <p className="text-xs text-black/50 font-light">Add performance sneakers or sliders to initiate checkout.</p>
        <Link
          href="/shop"
          className="bg-black hover:bg-transparent text-white hover:text-black border border-black inline-block px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  // --- CHECKOUT SUBMISSION INTERFACE ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#f4f3ef]">
      <div className="text-center sm:text-left space-y-1 border-b border-black/5 pb-6 mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-black/55 font-bold">Secure checkout</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase mt-1">
          Review & Complete Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Forms */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
          {validationError && (
            <div className="bg-red-500/5 border border-red-500/10 text-red-800 text-xs p-4 rounded-xl flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Customer Contact details */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl space-y-4 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
              1. Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="Indian mobile phone"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl space-y-4 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
              2. Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Flat/Building, Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Enter street address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">City</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">State</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">Pincode (6 digits)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6 digits code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] font-bold tracking-widest text-center transition-all text-black"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Options */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl space-y-4 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
              3. Payment Settlement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 border rounded-2xl text-left flex flex-col justify-between h-24 transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 bg-white text-black hover:border-black/25'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">Razorpay Online Payment</p>
                  <p className={`text-[9px] font-medium ${paymentMethod === 'RAZORPAY' ? 'text-white/70' : 'text-black/50'}`}>Pay via Cards, UPI, Netbanking</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 border rounded-2xl text-left flex flex-col justify-between h-24 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 bg-white text-black hover:border-black/25'
                }`}
              >
                <Truck className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">Cash on Delivery (COD)</p>
                  <p className={`text-[9px] font-medium ${paymentMethod === 'COD' ? 'text-white/70' : 'text-black/50'}`}>Settle with cash upon delivery</p>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-4 text-xs font-bold uppercase tracking-widest rounded-full transition-all"
          >
            {paymentMethod === 'RAZORPAY' ? 'Proceed to Pay ₹' + finalAmount.toLocaleString('en-IN') : 'Place Order via COD'}
          </button>
        </form>

        {/* Right Column: Order Summary Review */}
        <aside className="lg:col-span-5 bg-white border border-black/5 p-6 rounded-2xl space-y-6 shadow-xs">
          <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-black border-b border-black/5 pb-3">
            Review Articles ({totalItems})
          </h2>

          <div className="divide-y divide-black/5 max-h-60 overflow-y-auto pr-2">
            {cart.map((item, idx) => (
              <div key={idx} className="py-3 flex gap-3 text-xs">
                <div className="w-10 h-12 bg-[#fcfbf9] border border-black/5 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <h3 className="font-extrabold text-black line-clamp-1">{item.product.name}</h3>
                    <p className="text-[9px] text-black/50 font-bold uppercase mt-0.5">Size: UK {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <span className="text-black font-extrabold">₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black/5 pt-4 space-y-2 text-xs text-black/70 font-bold">
            <div className="flex justify-between">
              <span className="uppercase tracking-wider">Subtotal</span>
              <span className="text-black font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[10px] text-black/45 italic font-medium">
              <span>Included GST Breakdown (18%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-teal-800">
                <span className="uppercase tracking-wider">Coupon Applied ({coupon?.code})</span>
                <span className="font-extrabold">- ₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="uppercase tracking-wider">Shipping & Route</span>
              <span>{shippingCharges === 0 ? <strong className="text-teal-800 underline uppercase font-extrabold">Free</strong> : '₹' + shippingCharges}</span>
            </div>
            <div className="border-t border-black/5 pt-3 mt-1 flex justify-between text-sm font-extrabold text-black uppercase tracking-wider">
              <span>Final Payable Amount</span>
              <span className="text-black text-base font-extrabold">₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </aside>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
