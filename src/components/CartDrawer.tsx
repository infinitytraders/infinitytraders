'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 w-full sm:w-[500px] bg-[#0b0c10] border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-wider uppercase text-white">Your Bag</h2>
                <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Shipping Progress Bar */}
              {subtotal > 0 && (
                <div className="bg-[#1f2833]/30 border border-white/5 rounded-md p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-light text-white/80">
                    <Truck className="w-4 h-4 text-accent-teal" />
                    {shippingCharges === 0 ? (
                      <span>Congrats! You qualify for <strong className="text-accent-teal">Free Shipping</strong></span>
                    ) : (
                      <span>
                        Add <strong>₹{shippingSettings.freeShippingThreshold - subtotal}</strong> more for free shipping
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-accent-teal h-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                    <X className="w-8 h-8" />
                  </div>
                  <p className="text-white/50 font-light tracking-wide">Your shopping cart is currently empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="btn-primary px-6 py-2.5 text-xs uppercase tracking-widest font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.size}-${index}`}
                      className="flex gap-4 bg-[#1f2833]/20 border border-white/5 p-3 rounded-md hover:border-white/10 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 bg-[#1f2833]/40 rounded-md overflow-hidden flex-shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                              <span className="text-[10px] uppercase tracking-widest font-semibold text-accent-teal">
                                {item.product.brand}
                              </span>
                              <h3 className="text-sm font-medium text-white line-clamp-1">
                                {item.product.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.size)}
                              className="text-white/40 hover:text-red-400 transition-colors p-1"
                              aria-label="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-[11px] text-white/50 font-light mt-1">
                            Size: <span className="text-white font-medium">UK {item.size}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-white/10 rounded overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs text-white font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-sm font-semibold text-white">
                              ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.product.mrp > item.product.sellingPrice && (
                              <div className="text-[10px] text-white/45 line-through">
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
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-white/80 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-accent-teal" /> Delivery Pincode Check
                    </h4>
                    <form onSubmit={handleCheckPincode} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 input-premium text-xs"
                      />
                      <button
                        type="submit"
                        disabled={checkingPin || pincode.length !== 6}
                        className="btn-secondary px-4 py-2 text-xs uppercase tracking-widest font-semibold disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Check
                      </button>
                    </form>

                    {pincodeStatus.checked && (
                      <div
                        className={`text-xs p-2.5 rounded flex items-start gap-2 border ${
                          pincodeStatus.serviceable
                            ? 'bg-[#10b981]/5 border-[#10b981]/25 text-[#10b981]'
                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                        }`}
                      >
                        {pincodeStatus.serviceable ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">Serviceable to {pincodeStatus.state}</p>
                              <p className="text-[10px] opacity-80 mt-0.5">Estimated delivery: {pincodeStatus.days} working days.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{pincodeStatus.error || 'Delivery unavailable to this location.'}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Promo Code Form */}
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-white/80 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-accent-teal" /> Promotional Coupon
                    </h4>
                    {coupon ? (
                      <div className="bg-[#1f2833]/40 border border-accent-teal/20 rounded p-3 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-accent-teal">{coupon.code}</span>
                          <span className="text-[10px] text-white/50 block">
                            Applied:{' '}
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}% Off`
                              : `₹${coupon.discountValue} Off`}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-400 hover:text-red-300 text-xs font-medium uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 input-premium text-xs"
                        />
                        <button
                          type="submit"
                          disabled={!couponInput.trim()}
                          className="btn-secondary px-4 py-2 text-xs uppercase tracking-widest font-semibold"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {couponError && (
                      <div className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> {couponError}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="bg-[#141821] border-t border-white/5 p-6 space-y-4">
                <div className="space-y-2 text-sm text-white/70 font-light">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/50 italic pl-2 border-l border-white/10">
                    <span>Included GST (18%)</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-accent-teal">
                      <span>Coupon Discount</span>
                      <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-white font-medium">
                      {shippingCharges === 0 ? (
                        <span className="text-accent-teal font-semibold">FREE</span>
                      ) : (
                        `₹${shippingCharges}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-white/5 my-2 pt-2 flex justify-between text-base font-semibold text-white">
                    <span className="uppercase tracking-wider">Total</span>
                    <span className="text-accent-teal text-lg">₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="btn-primary w-full text-center block py-3.5 text-xs font-bold uppercase tracking-widest rounded"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-[10px] text-center text-white/30 tracking-wider">
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
