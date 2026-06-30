'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Plus, Minus, Trash2, Tag, Truck, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    gstAmount,
    shippingCharges,
    couponDiscount,
    finalAmount,
    freeShippingProgress,
    shippingSettings,
    coupon,
    couponError,
    applyCouponCode,
    removeCoupon,
    pincode,
    setPincode,
    pincodeStatus,
    checkPincodeServiceability
  } = useCart();
  const { t } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [checkingPin, setCheckingPin] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = await applyCouponCode(couponInput);
    if (success) {
      setCouponInput('');
    }
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setCheckingPin(true);
    await checkPincodeServiceability(pincode);
    setCheckingPin(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 w-full sm:w-[500px] bg-[#f4f3ef] border-l border-black/5 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 p-6 bg-[#f4f3ef]">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold tracking-widest uppercase text-black">{t('cart.title')}</h2>
                <span className="bg-black text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                  {totalItems} {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'उत्पाद' : (totalItems === 1 ? 'item' : 'items')}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="text-black/55 hover:text-black transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Shipping Progress Bar */}
              {subtotal > 0 && (
                <div className="bg-white border border-black/5 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase font-bold text-black">
                    <Truck className="w-3.5 h-3.5 text-black" />
                    {shippingCharges === 0 ? (
                      <span>{t('cart.freeShipping')}</span>
                    ) : (
                      <span>
                        {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मुफ्त शिपिंग के लिए ₹' + (shippingSettings.freeShippingThreshold - subtotal).toLocaleString('en-IN') + ' और जोड़ें।' : 'Add ₹' + (shippingSettings.freeShippingThreshold - subtotal).toLocaleString('en-IN') + ' more for free shipping'}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black/35">
                    <X className="w-5 h-5" />
                  </div>
                  <p className="text-black/50 font-light tracking-wide text-xs">{t('cart.empty')}</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="bg-black hover:bg-transparent text-white hover:text-black border border-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'खरीदारी जारी रखें' : 'Continue Shopping'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.size}-${index}`}
                      className="flex gap-4 bg-white border border-black/5 p-4 rounded-2xl hover:shadow-sm transition-all shadow-xs"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 bg-[#fcfbf9] rounded-xl overflow-hidden flex-shrink-0 relative border border-black/5">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-black/45 block">
                                {item.product.brand}
                              </span>
                              <h3 className="text-xs font-extrabold text-black line-clamp-1">
                                {item.product.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.size)}
                              className="text-black/40 hover:text-red-600 transition-colors p-1"
                              aria-label="Remove Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-[10px] text-black/50 font-bold mt-1 uppercase tracking-wider">
                            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'साइज़: UK ' : 'Size: UK '}<span className="text-black font-extrabold">{item.size}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-black/10 rounded-full bg-white p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-black/75 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs text-black font-extrabold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-black/75 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-black">
                              ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.product.mrp > item.product.sellingPrice && (
                              <div className="text-[10px] text-black/40 line-through font-semibold">
                                ₹{(item.product.mrp * item.quantity).toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  {/* Pincode Checker */}
                  <div className="border-t border-black/5 pt-5 space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-black/60 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-black" /> {t('prod.pincode.title')}
                    </h4>
                    <form onSubmit={handleCheckPincode} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder={t('prod.pincode.placeholder')}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 border border-black/10 focus:border-black rounded-full px-4 py-2 text-xs outline-none bg-white transition-all text-black"
                      />
                      <button
                        type="submit"
                        disabled={checkingPin || pincode.length !== 6}
                        className="bg-black hover:bg-transparent text-white hover:text-black border border-black px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold disabled:opacity-50 transition-all"
                      >
                        {t('prod.pincode.check')}
                      </button>
                    </form>

                    {pincodeStatus.checked && (
                      <div
                        className={`text-xs p-3 rounded-xl flex items-start gap-2 border ${
                          pincodeStatus.serviceable
                            ? 'bg-teal-500/5 border-teal-500/10 text-teal-800'
                            : 'bg-red-500/5 border-red-500/10 text-red-800'
                        }`}
                      >
                        {pincodeStatus.serviceable ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-700" />
                            <div>
                              <p className="font-extrabold uppercase tracking-wider text-[10px]">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सेवा योग्य: ' : 'Serviceable to '}{pincodeStatus.state}</p>
                              <p className="text-[10px] opacity-80 mt-0.5 font-light">{t('prod.pincode.serviceable')} {pincodeStatus.days} {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कार्य दिवस' : 'working days'}.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-700" />
                            <span className="font-semibold">{t('prod.pincode.unserviceable')}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Promo Code Form */}
                  <div className="border-t border-black/5 pt-5 space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-black/60 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-black" /> {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'प्रमोशनल कूपन' : 'Promotional Coupon'}
                    </h4>
                    {coupon ? (
                      <div className="bg-white border border-black/5 rounded-2xl p-3 flex justify-between items-center shadow-xs">
                        <div>
                          <span className="text-xs font-extrabold text-black uppercase tracking-wider">{coupon.code}</span>
                          <span className="text-[10px] text-black/50 block font-medium">
                            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लागू: ' : 'Applied:{' }
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}% Off`
                              : `₹${coupon.discountValue} Off`}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-wider underline"
                        >
                          {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हटाएं' : 'Remove'}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('checkout.coupon.placeholder')}
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 border border-black/10 focus:border-black rounded-full px-4 py-2 text-xs outline-none bg-white transition-all text-black"
                        />
                        <button
                          type="submit"
                          disabled={!couponInput.trim()}
                          className="bg-black hover:bg-transparent text-white hover:text-black border border-black px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold disabled:opacity-50 transition-all"
                        >
                          {t('checkout.coupon.apply')}
                        </button>
                      </form>
                    )}

                    {couponError && (
                      <div className="text-xs text-red-600 flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> {couponError}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-black/5 p-6 space-y-4 shadow-xl">
                <div className="space-y-2 text-xs text-black/70 font-bold">
                  <div className="flex justify-between">
                    <span className="uppercase tracking-wider">{t('cart.subtotal')}</span>
                    <span className="text-black font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-black/45 italic pl-2 border-l border-black/10 font-medium">
                    <span>{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'शामिल जीएसटी (18%)' : 'Included GST (18%)'}</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-teal-800">
                      <span className="uppercase tracking-wider font-extrabold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कूपन छूट' : 'Coupon Discount'}</span>
                      <span className="font-extrabold">- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="uppercase tracking-wider">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'शिपिंग शुल्क' : 'Shipping Charges'}</span>
                    <span className="text-black font-extrabold">
                      {shippingCharges === 0 ? (
                        <span className="text-teal-800 underline font-extrabold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मुफ़्त' : 'FREE'}</span>
                      ) : (
                        `₹${shippingCharges}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-black/5 my-2 pt-2.5 flex justify-between text-sm font-extrabold text-black uppercase tracking-wider">
                    <span>{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कुल' : 'Total'}</span>
                    <span className="text-black text-base font-extrabold">₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="bg-black hover:bg-transparent text-white hover:text-black border border-black w-full text-center block py-4 text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                >
                  {t('cart.checkout')}
                </Link>

                <p className="text-[9px] text-center text-black/35 tracking-widest uppercase font-bold">
                  Inclusive of all taxes. Secured transactions processed in INR.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
