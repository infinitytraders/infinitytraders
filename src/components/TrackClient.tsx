'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trackOrderAction } from '@/app/actions';
import type { Order } from '@/lib/db';
import { Search, MapPin, Package, Calendar, Tag, CreditCard, ChevronRight, CheckCircle2, Truck, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Automatically check if order ID is in search parameters
  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setOrderId(queryId);
    }
  }, [searchParams]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !emailOrMobile.trim()) {
      setError('Please provide both Order ID and registered Email or Mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    try {
      const res = await trackOrderAction(orderId.trim(), emailOrMobile.trim());
      if (res.success && res.order) {
        setOrder(res.order);
        // Sync URL param
        const params = new URLSearchParams(window.location.search);
        params.set('id', res.order.id);
        router.replace(`${window.location.pathname}?${params.toString()}`);
      } else {
        setError(res.error || 'Unable to retrieve order details.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setSearched(false);
    setError('');
    setEmailOrMobile('');
    setOrderId('');
    router.replace(window.location.pathname);
  };

  // Helper to determine status progress step indexes
  // Steps: 0 = Ordered, 1 = Confirmed, 2 = Dispatched, 3 = Delivered
  const getStepIndex = (status: Order['orderStatus']) => {
    switch (status) {
      case 'PENDING':
        return 1; // Confirmed (We confirm COD orders via phone immediately)
      case 'DISPATCHED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;
  const isHindi = t('home.newArrivals') === 'नए जूते (New Arrivals)';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-8 bg-[#f4f3ef] min-h-[85vh] flex flex-col justify-center">
      {/* Page Title Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-black/50 font-bold">
          {isHindi ? 'ऑर्डर स्थिति ट्रैकर' : 'Order Status Tracker'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-black">
          {isHindi ? 'अपना ऑर्डर ट्रैक करें' : 'Track Your Order'}
        </h1>
        <p className="text-xs text-black/60 font-light max-w-sm mx-auto">
          {isHindi
            ? 'वास्तविक समय में शिपमेंट डिलीवरी और ऑर्डर पुष्टिकरण की निगरानी करें।'
            : 'Monitor real-time shipment dispatch routes and order verification progress.'}
        </p>
      </div>

      {!order ? (
        // --- LOOKUP FORM CONTAINER ---
        <div className="bg-white border border-black/5 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 max-w-md mx-auto w-full">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/5 border border-red-500/10 text-red-800 text-xs p-3.5 rounded-xl flex items-start gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 rotate-180 text-red-700" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">
                {isHindi ? 'ऑर्डर आईडी' : 'Order ID'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ORD_171234567"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">
                {isHindi ? 'पंजीकृत ईमेल या मोबाइल' : 'Registered Email or Mobile'}
              </label>
              <input
                type="text"
                required
                placeholder={isHindi ? 'नाम@ईमेल.कॉम या 10-अंकीय मोबाइल' : 'name@email.com or 10-digit mobile'}
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-3.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isHindi ? 'खोज की जा रही है...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {isHindi ? 'ट्रैक करें' : 'Track Order'}
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-[10px] text-black/40 font-medium">
            {isHindi
              ? 'ऑर्डर आईडी आपकी ईमेल रसीद और ऑर्डर पुष्टिकरण एसएमएस पर उपलब्ध है।'
              : 'Order ID is available on your email receipt and order confirmation SMS.'}
          </div>
        </div>
      ) : (
        // --- DETAILED TRACKING TIMELINE & DATA ---
        <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto w-full">
          {/* Back button */}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-extrabold text-black/60 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isHindi ? 'दूसरा ऑर्डर खोजें' : 'Query Another Order'}
          </button>

          {/* 1. Visual Progress Timeline */}
          <div className="bg-white border border-black/5 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-black/5 pb-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-black/45 block tracking-wider">
                  {isHindi ? 'लाइव स्टेटस' : 'Live Status'}
                </span>
                <h2 className="text-sm font-extrabold uppercase text-black tracking-widest mt-0.5 flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                  {order.orderStatus === 'PENDING' && (isHindi ? 'ऑर्डर की पुष्टि हो गई (सत्यापन)' : 'Order Verified (Fulfillment Pending)')}
                  {order.orderStatus === 'DISPATCHED' && (isHindi ? 'पारगमन में (Dispatched)' : 'In Transit (Dispatched)')}
                  {order.orderStatus === 'DELIVERED' && (isHindi ? 'सफलतापूर्वक वितरित (Delivered)' : 'Successfully Delivered')}
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[9px] uppercase font-bold text-black/45 block tracking-wider">
                  {isHindi ? 'ऑर्डर आईडी' : 'Order ID'}
                </span>
                <span className="text-xs font-extrabold text-black tracking-widest font-mono select-all">
                  {order.id}
                </span>
              </div>
            </div>

            {/* Steps Visual Bar */}
            <div className="relative pt-4 pb-2">
              <div className="absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-black/5 -z-1" />
              <div
                className="absolute top-[28px] left-[15%] h-0.5 bg-black -z-1 transition-all duration-1000"
                style={{
                  width: `${
                    currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : currentStep === 3 ? '70%' : '0%'
                  }`,
                }}
              />

              <div className="grid grid-cols-4 text-center">
                {/* Step 1: Placed */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      currentStep >= 0
                        ? 'bg-black text-white border-black scale-110 shadow-xs'
                        : 'bg-white text-black/40 border-black/10'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-black block">
                    {isHindi ? 'आदेश दिया' : 'Ordered'}
                  </span>
                  <span className="text-[8px] text-black/40 font-light block">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                  </span>
                </div>

                {/* Step 2: Verified */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      currentStep >= 1
                        ? 'bg-black text-white border-black scale-110 shadow-xs'
                        : 'bg-white text-black/40 border-black/10'
                    }`}
                  >
                    {currentStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-white fill-black" /> : '2'}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-black block">
                    {isHindi ? 'सत्यापित' : 'Confirmed'}
                  </span>
                  <span className="text-[8px] text-teal-800 font-bold block uppercase tracking-wider">
                    {isHindi ? 'कॉल सत्यापित' : 'COD Verified'}
                  </span>
                </div>

                {/* Step 3: Dispatched */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      currentStep >= 2
                        ? 'bg-black text-white border-black scale-110 shadow-xs'
                        : 'bg-white text-black/40 border-black/10'
                    }`}
                  >
                    {currentStep >= 2 ? <Truck className="w-4 h-4 text-white" /> : '3'}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-black block">
                    {isHindi ? 'भेजा गया' : 'Dispatched'}
                  </span>
                  <span className="text-[8px] text-black/40 font-light block">
                    {order.courierName || (isHindi ? 'लंबा पारगमन' : 'Express Air')}
                  </span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      currentStep >= 3
                        ? 'bg-black text-white border-black scale-110 shadow-xs'
                        : 'bg-white text-black/40 border-black/10'
                    }`}
                  >
                    {currentStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-white fill-black" /> : '4'}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-black block">
                    {isHindi ? 'वितरित' : 'Delivered'}
                  </span>
                  <span className="text-[8px] text-black/40 font-light block">
                    {order.orderStatus === 'DELIVERED' ? (isHindi ? 'पूर्ण' : 'Completed') : '---'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Dispatch Logistics Details (If Dispatched) */}
          {order.orderStatus !== 'PENDING' && order.trackingNumber && (
            <div className="bg-teal-800/[0.03] border border-teal-800/10 p-6 rounded-2xl space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-teal-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-800" />
                {isHindi ? 'शिपमेंट कूरियर ट्रैकिंग विवरण' : 'Shipment Courier Tracking Details'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">
                    {isHindi ? 'कूरियर पार्टनर' : 'Courier Partner'}
                  </span>
                  <span className="text-sm font-extrabold text-black">{order.courierName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">
                    {isHindi ? 'ट्रैकिंग नंबर' : 'Tracking Number'}
                  </span>
                  <span className="text-sm font-extrabold text-black select-all underline font-mono">
                    {order.trackingNumber}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-black/45 block uppercase tracking-wider font-bold text-[9px]">
                    {isHindi ? 'शिपमेंट रूट' : 'Shipment Route'}
                  </span>
                  <span className="text-sm font-extrabold text-black">
                    {order.dispatchDetails || (isHindi ? 'धनबाद हब से रवाना' : 'Dispatched from Dhanbad HQ')}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-teal-900/60 font-medium italic pt-2">
                {isHindi
                  ? '*कूरियर पोर्टल पर ट्रैकिंग जानकारी अपडेट होने में 12-24 घंटे तक का समय लग सकता है।'
                  : '*Logistics transit scans may take 12-24 hours to sync live on the partner courier portal.'}
              </p>
            </div>
          )}

          {/* 3. Address & Billing details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Customer Address & Items */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-black flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-black/60" />
                  {isHindi ? 'शिपिंग वितरण पता' : 'Shipping Destination Address'}
                </h3>
                <div className="text-xs text-black/80 space-y-1.5 font-light">
                  <p className="font-extrabold text-black text-[10px] uppercase tracking-wider">
                    {order.customerName}
                  </p>
                  <p className="font-medium text-black">
                    +91 {order.customerMobile.slice(0, 5)}*****
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    <strong className="text-black">{order.shippingAddress.pincode}</strong>
                  </p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-black flex items-center gap-2">
                  <Package className="w-4 h-4 text-black/60" />
                  {isHindi ? 'ऑर्डर किए गए उत्पाद' : 'Ordered Articles'}
                </h3>
                <div className="divide-y divide-black/5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex gap-4 text-xs first:pt-0 last:pb-0">
                      <div className="w-12 h-14 bg-[#fcfbf9] border border-black/5 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex justify-between">
                        <div>
                          <h4 className="font-extrabold text-black line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-black/45 uppercase tracking-widest font-bold mt-0.5">
                            {isHindi ? 'साइज़' : 'Size'}: UK {item.size} | {isHindi ? 'मात्रा' : 'Qty'}: {item.quantity}
                          </p>
                        </div>
                        <span className="font-extrabold text-black">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Payment & Invoicing */}
            <div className="space-y-6">
              {/* Invoice Billing breakdown */}
              <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-black flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-black/60" />
                  {isHindi ? 'भुगतान एवं बिलिंग' : 'Payment & Billing'}
                </h3>

                <div className="space-y-2 text-xs text-black/70 font-bold border-b border-black/5 pb-3">
                  <div className="flex justify-between">
                    <span className="uppercase tracking-wider">{isHindi ? 'उपयोग मूल्य' : 'Subtotal'}</span>
                    <span className="text-black font-extrabold">₹{order.orderValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-black/45 italic pl-2 border-l border-black/10 font-medium">
                    <span>{isHindi ? 'जीएसटी (18%) शामिल है' : 'Included GST (18%)'}</span>
                    <span>₹{order.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase tracking-wider">{isHindi ? 'शिपिंग शुल्क' : 'Shipping Charges'}</span>
                    <span className="text-black font-extrabold">
                      {order.shippingCharges === 0 ? (
                        <span className="text-teal-800 underline font-extrabold">{isHindi ? 'मुफ़्त' : 'FREE'}</span>
                      ) : (
                        `₹${order.shippingCharges}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-black uppercase tracking-wider">
                  <span>{isHindi ? 'कुल भुगतान' : 'Total Billing'}</span>
                  <span>₹{order.finalAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider">
                  <div className="bg-[#fcfbf9] border border-black/5 p-3.5 rounded-xl space-y-0.5 text-center">
                    <span className="text-black/45 block text-[8px] font-bold">{isHindi ? 'भुगतान का प्रकार' : 'Payment Type'}</span>
                    <span className="text-black font-extrabold text-sm">{order.paymentMethod}</span>
                  </div>
                  <div className="bg-[#fcfbf9] border border-black/5 p-3.5 rounded-xl space-y-0.5 text-center">
                    <span className="text-black/45 block text-[8px] font-bold">{isHindi ? 'भुगतान स्थिति' : 'Payment Status'}</span>
                    <span
                      className={`font-extrabold text-sm ${
                        order.paymentStatus === 'PAID' ? 'text-teal-800' : 'text-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Print GST Invoice Link */}
                <Link
                  href={`/invoice/${order.id}`}
                  target="_blank"
                  className="bg-white hover:bg-black text-black hover:text-white border border-black/15 hover:border-black py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-full transition-all shadow-xs text-center w-full"
                >
                  <FileText className="w-4 h-4" /> {isHindi ? 'जीएसटी चालान डाउनलोड करें' : 'Download GST Invoice'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
