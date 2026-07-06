'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trackOrderAction, cancelOrderAction } from '@/app/actions';
import type { Order } from '@/lib/db';
import { Search, MapPin, Package, Calendar, Tag, CreditCard, ChevronRight, CheckCircle2, Truck, FileText, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
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
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!order) return;
    const confirmMsg = t('home.newArrivals') === 'नए जूते (New Arrivals)' 
      ? 'क्या आप वाकई इस ऑर्डर को रद्द करना चाहते हैं?' 
      : 'Are you sure you want to cancel this order?';
    if (!window.confirm(confirmMsg)) return;

    setCancelling(true);
    try {
      const res = await cancelOrderAction(order.id);
      if (res.success) {
        alert(t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया है।' : 'Order cancelled successfully.');
        // Re-track order to refresh local state
        setLoading(true);
        const trackRes = await trackOrderAction(order.id, order.customerEmail);
        if (trackRes.success && trackRes.order) {
          setOrder(trackRes.order);
        }
        setLoading(false);
      } else {
        if (res.error?.includes('Authentication required')) {
          alert(t('home.newArrivals') === 'नए जूते (New Arrivals)' 
            ? 'ऑर्डर रद्द करने के लिए आपको लॉग इन करना होगा।' 
            : 'Please log in to cancel your order.');
          router.push(`/account?redirect=/track?id=${order.id}`);
        } else {
          alert(res.error || 'Failed to cancel order.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error cancelling order.');
    } finally {
      setCancelling(false);
    }
  };

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
  const getStepIndex = (status: Order['orderStatus'], orderObj?: Order | null) => {
    if (status === 'DISPATCHED' && orderObj && orderObj.courierName === 'Delhivery' && orderObj.trackingNumber) {
      const tracking = (orderObj as any).delhiveryTracking;
      if (tracking && tracking.Status?.Scans && tracking.Status.Scans.length > 0) {
        const hasTransitScans = tracking.Status.Scans.some((scan: any) => {
          const activity = (scan.ScanDetail?.Scan || '').toUpperCase();
          return activity !== 'MANIFESTED' && activity !== 'SOFT DATA UPLOADED';
        });
        if (hasTransitScans) {
          return 2; // Real pickup/transit scan exists
        }
      }
      return 1; // Manifested but not yet scanned by the pickup agent
    }
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

  const currentStep = order ? getStepIndex(order.orderStatus, order) : 0;
  const isHindi = t('home.newArrivals') === 'नए जूते (New Arrivals)';

  const getStages = () => {
    if (!order) return [];
    const tracking = (order as any).delhiveryTracking;
    const scans = tracking?.Status?.Scans || [];

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 1. Order Received
    const stage1 = {
      completed: true,
      time: formatDate(order.createdAt),
      desc: isHindi ? 'ऑर्डर सफलतापूर्वक प्राप्त हुआ' : 'Order successfully placed on platform'
    };

    // 2. Ready to Ship
    const stage2 = {
      completed: ['PENDING', 'DISPATCHED', 'DELIVERED'].includes(order.orderStatus),
      time: ['PENDING', 'DISPATCHED', 'DELIVERED'].includes(order.orderStatus)
        ? formatDate(order.createdAt)
        : '',
      desc: isHindi ? 'सत्यापित और पैकेजिंग पूरी हुई' : 'Fulfillment processed & packed'
    };

    // 3. Scheduled for Pickup
    const pickupScan = scans.find((s: any) => {
      const act = (s.ScanDetail?.Scan || '').toUpperCase();
      return act === 'MANIFESTED' || act === 'SOFT DATA UPLOADED';
    });
    const stage3 = {
      completed: !!(order.courierName === 'Delhivery' && order.trackingNumber),
      time: pickupScan?.ScanDetail?.ScanDateTime 
        ? formatDate(pickupScan.ScanDetail.ScanDateTime) 
        : (order.trackingNumber ? formatDate(order.createdAt) : ''),
      desc: isHindi ? 'दिल्लीवरी कूरियर पिकअप निर्धारित' : 'Delhivery pickup requested & scheduled'
    };

    // 4. In-Transit
    const transitScan = scans.find((s: any) => {
      const act = (s.ScanDetail?.Scan || '').toUpperCase();
      return act !== 'MANIFESTED' && act !== 'SOFT DATA UPLOADED';
    });
    const stage4 = {
      completed: !!transitScan,
      time: transitScan?.ScanDetail?.ScanDateTime ? formatDate(transitScan.ScanDetail.ScanDateTime) : '',
      desc: transitScan?.ScanDetail?.Scan 
        ? `${transitScan.ScanDetail.Scan} - ${transitScan.ScanDetail.ScannedLocation || ''}` 
        : (isHindi ? 'पिकअप कूरियर द्वारा उठाया जाना शेष' : 'Awaiting origin center reception scans')
    };

    // 5. Out for Delivery
    const outScan = scans.find((s: any) => {
      const act = (s.ScanDetail?.Scan || '').toUpperCase();
      return act.includes('OUT FOR DELIVERY') || act.includes('RUNSHEET') || act.includes('DISPATCHED TO RIDER');
    });
    const stage5 = {
      completed: !!outScan,
      time: outScan?.ScanDetail?.ScanDateTime ? formatDate(outScan.ScanDetail.ScanDateTime) : '',
      desc: outScan?.ScanDetail?.Scan 
        ? `${outScan.ScanDetail.Scan}` 
        : (isHindi ? 'वितरण केंद्र पर आगमन लंबित' : 'Awaiting arrival at destination delivery hub')
    };

    // 6. Delivered
    const deliveryScan = scans.find((s: any) => {
      const act = (s.ScanDetail?.Scan || '').toUpperCase();
      return act.includes('DELIVERED') || act.includes('SUCCESSFULLY DELIVERED');
    });
    const stage6 = {
      completed: order.orderStatus === 'DELIVERED' || !!deliveryScan,
      time: deliveryScan?.ScanDetail?.ScanDateTime 
        ? formatDate(deliveryScan.ScanDetail.ScanDateTime) 
        : (order.orderStatus === 'DELIVERED' ? formatDate(order.createdAt) : ''),
      desc: isHindi ? 'सुरक्षित रूप से प्राप्तकर्ता को दिया गया' : 'Package successfully handed over to consignee'
    };

    return [
      { label: isHindi ? 'ऑर्डर प्राप्त हुआ' : 'Order Received', ...stage1, stepNum: 1 },
      { label: isHindi ? 'शिप करने के लिए तैयार' : 'Ready to Ship', ...stage2, stepNum: 2 },
      { label: isHindi ? 'पिकअप के लिए निर्धारित' : 'Scheduled for Pickup', ...stage3, stepNum: 3 },
      { label: isHindi ? 'पारगमन में' : 'In-Transit', ...stage4, stepNum: 4 },
      { label: isHindi ? 'वितरण के लिए बाहर' : 'Out for Delivery', ...stage5, stepNum: 5 },
      { label: isHindi ? 'वितरित' : 'Delivered', ...stage6, stepNum: 6 }
    ];
  };

  const stages = getStages();

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-black/45 block tracking-wider">
                  {isHindi ? 'लाइव स्टेटस' : 'Live Status'}
                </span>
                <h2 className={`text-sm font-extrabold uppercase tracking-widest mt-0.5 flex items-center gap-2 ${
                  order.orderStatus === 'CANCELLED' ? 'text-rose-600' : 'text-black'
                }`}>
                  <span className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${
                    order.orderStatus === 'CANCELLED' ? 'bg-rose-600' : 'bg-teal-600 animate-ping'
                  }`} />
                  {order.orderStatus === 'PENDING' && (isHindi ? 'ऑर्डर की पुष्टि हो गई (सत्यापन)' : 'Order Verified (Fulfillment Pending)')}
                  {order.orderStatus === 'DISPATCHED' && (
                    currentStep < 2
                      ? (isHindi ? 'कूरियर पिकअप की प्रतीक्षा है (Awaiting Pickup)' : 'Awaiting Courier Pickup')
                      : (isHindi ? 'पारगमन में (Dispatched)' : 'In Transit (Dispatched)')
                  )}
                  {order.orderStatus === 'DELIVERED' && (isHindi ? 'सफलतापूर्वक वितरित (Delivered)' : 'Successfully Delivered')}
                  {order.orderStatus === 'CANCELLED' && (isHindi ? 'रद्द किया गया (Cancelled)' : 'Cancelled (Order Annulled)')}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] uppercase font-bold text-black/45 block tracking-wider">
                    {isHindi ? 'ऑर्डर आईडी' : 'Order ID'}
                  </span>
                  <span className="text-xs font-extrabold text-black tracking-widest font-mono select-all">
                    {order.id}
                  </span>
                </div>
                {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 px-4 py-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-full transition-all text-center justify-center shadow-xs disabled:opacity-50 active:scale-[0.98]"
                  >
                    {cancelling 
                      ? (isHindi ? 'रद्द किया जा रहा है...' : 'Cancelling...') 
                      : (isHindi ? 'ऑर्डर रद्द करें' : 'Cancel Order')}
                  </button>
                )}
              </div>
            </div>

            {order.orderStatus === 'CANCELLED' ? (
              <div className="bg-rose-50/60 border border-rose-100/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-rose-950 uppercase tracking-wider">
                    {isHindi ? 'यह ऑर्डर रद्द कर दिया गया है' : 'Order Cancellation Completed'}
                  </h4>
                  <p className="text-rose-900/85 font-medium leading-relaxed">
                    {order.paymentMethod === 'RAZORPAY' 
                      ? (isHindi 
                          ? 'ऑनलाइन भुगतान के लिए रिफंड प्रक्रिया शुरू कर दी गई है। यह आपके खाते में ३-४ कार्य दिवसों में जमा हो जाएगा।'
                          : 'The refund process for your online payment has been initiated. Funds will credit back to your source account within 3-4 working days.')
                      : (isHindi
                          ? 'चूंकि यह कैश ऑन डिलीवरी (COD) ऑर्डर था, इसलिए कोई रिफंड आवश्यक नहीं है।'
                          : 'As this was a Cash on Delivery (COD) order, no transaction refund is required.')}
                  </p>
                </div>
              </div>
            ) : (
              /* Premium Vertical 6-Step Timeline */
              <div className="space-y-6 pt-4 pb-2 px-2 max-w-xl mx-auto">
                <div className="flex flex-col gap-6 relative">
                  {stages.map((stage, idx) => {
                    const isCompleted = stage.completed;
                    const isLast = idx === stages.length - 1;
                    return (
                      <div key={idx} className="relative flex gap-4 text-left items-start">
                        {/* Circle & Connecting Line */}
                        <div className="flex flex-col items-center flex-shrink-0 relative">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all z-10 ${
                              isCompleted
                                ? 'bg-black border-black text-white shadow-xs scale-105'
                                : 'bg-white border-black/10 text-black/30'
                            }`}
                          >
                            {stage.stepNum}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 absolute top-7 bottom-[-28px] left-[13px] z-0 transition-all ${
                                stages[idx + 1].completed ? 'bg-black' : 'bg-black/5'
                              }`}
                            />
                          )}
                        </div>

                        {/* Text labels */}
                        <div className="space-y-1 pt-0.5 flex-1">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                            <h4 className={`text-xs font-extrabold uppercase tracking-wider ${
                              isCompleted ? 'text-black font-extrabold' : 'text-black/30 font-bold'
                            }`}>
                              {stage.label}
                            </h4>
                            {stage.time && (
                              <span className="text-[9px] text-black/45 font-semibold">
                                {stage.time}
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] ${isCompleted ? 'text-black/60 font-medium' : 'text-black/25 font-light'}`}>
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                    {currentStep < 2
                      ? (isHindi ? 'कूरियर पिकअप निर्धारित (हस्तांतरण लंबित)' : 'Courier Pickup Scheduled (Awaiting Handover)')
                      : (order.dispatchDetails || (isHindi ? 'धनबाद हब से रवाना' : 'Dispatched from Dhanbad HQ'))}
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

          {/* Delhivery Live Delivery Checkpoints */}
          {order && (order as any).delhiveryTracking && (order as any).delhiveryTracking.Status?.Scans && (
            <div className="bg-white border border-black/5 p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-black flex items-center gap-2">
                <Truck className="w-4 h-4 text-black/60" />
                {isHindi ? 'लाइव डिलीवरी ट्रैकिंग इतिहास (Delhivery)' : 'Live Delivery Transit Log (Delhivery)'}
              </h3>
              <div className="space-y-5 relative pl-4 before:absolute before:left-1.5 before:top-2.5 before:bottom-2.5 before:w-px before:bg-black/10">
                {(order as any).delhiveryTracking.Status.Scans.slice().reverse().map((scan: any, sIdx: number) => {
                  const detail = scan.ScanDetail;
                  if (!detail) return null;
                  return (
                    <div key={sIdx} className="space-y-1 relative">
                      <span className="absolute -left-[14.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-black border-2 border-white shadow-xs" />
                      <div className="flex flex-col sm:flex-row justify-between text-xs font-extrabold text-black gap-1">
                        <span className="uppercase tracking-wider">{detail.Scan}</span>
                        <span className="text-[9px] text-black/45 font-medium">
                          {new Date(detail.ScanDateTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-black/60 font-medium">
                        Location: <span className="font-bold text-black/85">{detail.ScannedLocation}</span>
                        {detail.Instructions && <span className="italic text-black/50"> — {detail.Instructions}</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
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
