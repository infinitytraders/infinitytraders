'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { toggleWishlistAction, recordRecentlyViewedAction } from '@/app/actions';
import { Star, Truck, Check, Heart, HelpCircle, ArrowRight, Share2, Plus, Minus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductDetailClientProps {
  product: Product;
  recommendations: Product[];
  initialUser: any;
}

export default function ProductDetailClient({ product, recommendations, initialUser }: ProductDetailClientProps) {
  const { addToCart, pincode, setPincode, pincodeStatus, checkPincodeServiceability } = useCart();
  const router = useRouter();

  // Image Selection
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  // Size selection
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[0]);
  // Width selection
  const [selectedWidth, setSelectedWidth] = useState<string>('Standard');
  const [quantity, setQuantity] = useState(1);

  // States
  const [wishlisted, setWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'returns'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load wishlist status & record recently viewed
  useEffect(() => {
    if (initialUser) {
      setWishlisted(initialUser.wishlist.includes(product.id));
    }
    // Record in history
    recordRecentlyViewedAction(product.id);
  }, [product.id, initialUser]);

  const handleWishlistToggle = async () => {
    if (!initialUser) {
      router.push('/account?redirect=' + encodeURIComponent(`/product/${product.id}`));
      return;
    }
    const res = await toggleWishlistAction(product.id);
    if (res.success && res.wishlist) {
      setWishlisted(res.wishlist.includes(product.id));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode) return;
    setCheckingPin(true);
    await checkPincodeServiceability(pincode);
    setCheckingPin(false);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    router.push('/checkout');
  };

  const productGst = Math.round(product.sellingPrice - product.sellingPrice / 1.18);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumbs */}
      <nav className="text-xs uppercase tracking-widest text-white/40 flex items-center gap-2">
        <Link href="/" className="hover:text-accent-teal transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-accent-teal transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-accent-teal transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-white/70 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Thumbnails (desktop left list) */}
          <div className="hidden md:flex md:col-span-2 flex-col gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square w-full rounded-md bg-[#1f2833]/30 border overflow-hidden transition-colors ${
                  selectedImage === img ? 'border-accent-teal' : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="md:col-span-10 aspect-[4/5] bg-[#1f2833]/25 border border-white/5 rounded-lg overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 right-4 bg-accent-teal text-black text-xs font-bold px-3 py-1 rounded">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails (mobile bottom list) */}
          <div className="flex md:hidden gap-3 mt-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-20 rounded bg-[#1f2833]/30 border overflow-hidden ${
                  selectedImage === img ? 'border-accent-teal' : 'border-white/5'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Pricing & Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accent-teal font-semibold">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase mt-1">
              {product.name}
            </h1>
            <span className="text-[10px] text-white/40 tracking-wider block mt-1">SKU: {product.sku}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.averageRating)
                      ? 'text-accent-teal fill-accent-teal'
                      : 'text-white/20'
                  }`}
                />
              ))}
              <span className="text-xs text-white font-medium ml-1">{product.averageRating}</span>
            </div>
            <span className="text-xs text-white/50 border-l border-white/15 pl-4">
              {product.reviewsCount} customer reviews
            </span>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#1f2833]/15 border border-white/5 p-4 rounded-lg space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-accent-teal">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.sellingPrice && (
                <>
                  <span className="text-sm text-white/40 line-through">
                    MRP ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#10b981] font-semibold">
                    Save ₹{(product.mrp - product.sellingPrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-white/50 leading-tight">
              MRP inclusive of all Indian taxes. GST breakdown (18% value: ~₹{productGst.toLocaleString('en-IN')}) shown transparently in cart.
            </p>
          </div>

          {/* Sizing Grid (Indian sizes) */}
          {product.category === 'Footwear' || product.category === 'Slippers' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase font-semibold text-white/80">
                <span>Select Shoe Size (UK / Indian Standards)</span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-accent-teal hover:underline text-[10px] font-medium"
                >
                  Size Guide & Conversions
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center text-xs border rounded transition-colors ${
                      selectedSize === size
                        ? 'border-accent-teal bg-accent-teal text-background font-bold'
                        : 'border-white/10 text-white/80 hover:border-white/30'
                    }`}
                  >
                    UK {size}
                  </button>
                ))}
              </div>
            </div>
          ) : product.category === 'Apparel' ? (
            <div className="space-y-3">
              <div className="text-xs tracking-wider uppercase font-semibold text-white/80">
                Select Chest Size (Chest Inches)
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center text-xs border rounded transition-colors ${
                      selectedSize === size
                        ? 'border-accent-teal bg-accent-teal text-background font-bold'
                        : 'border-white/10 text-white/80 hover:border-white/30'
                    }`}
                  >
                    Size {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Width selection (shoes specific) */}
          {(product.category === 'Footwear' || product.category === 'Slippers') && (
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-white/80 block">
                Shoe Width Configuration
              </span>
              <div className="flex gap-2">
                {['Standard', 'Wide'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWidth(w)}
                    className={`px-4 py-1.5 text-xs border rounded uppercase tracking-widest ${
                      selectedWidth === w
                        ? 'border-accent-teal text-accent-teal bg-accent-teal/10 font-semibold'
                        : 'border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/80 block">Quantity</span>
            <div className="flex items-center border border-white/10 rounded w-28 overflow-hidden bg-white/5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="flex-1 text-center text-xs text-white font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {product.stockQuantity > 0 ? (
              <>
                <button
                  onClick={() => addToCart(product, quantity, selectedSize)}
                  className="flex-1 btn-primary py-3.5 text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-white hover:bg-white/90 text-background py-3.5 text-xs font-bold uppercase tracking-widest rounded transition-colors text-center"
                >
                  Buy It Now
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full bg-white/5 border border-white/10 text-white/30 py-3.5 text-xs uppercase tracking-widest font-bold rounded cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={handleWishlistToggle}
              className={`p-3.5 border rounded transition-colors flex items-center justify-center ${
                wishlisted
                  ? 'border-red-500/35 bg-red-500/10 text-red-400'
                  : 'border-white/10 text-white/70 hover:border-white/20 hover:text-white'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-400' : ''}`} />
            </button>
          </div>

          {/* Pincode Checker */}
          <div className="border-t border-white/5 pt-5 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/80 block flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-accent-teal" /> Check Availability & Delivery Speed
            </span>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
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
                className="btn-secondary px-4 py-2 text-xs uppercase tracking-widest font-semibold"
              >
                Check
              </button>
            </form>

            {pincodeStatus.checked && (
              <div
                className={`text-xs p-3 rounded flex items-start gap-2 border ${
                  pincodeStatus.serviceable
                    ? 'bg-[#10b981]/5 border-[#10b981]/25 text-[#10b981]'
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
              >
                {pincodeStatus.serviceable ? (
                  <div>
                    <p className="font-semibold">Estimated transit: {pincodeStatus.days} days</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Dispatched via premium express from Dhanbad HQ.</p>
                  </div>
                ) : (
                  <span>{pincodeStatus.error || 'Delivery unavailable to this pincode.'}</span>
                )}
              </div>
            )}
          </div>

          {/* Social Share & Brand disclosure */}
          <div className="flex justify-between items-center text-xs text-white/40 pt-4 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-accent-teal" /> 100% Genuine Distributor Stock
            </span>
            <button
              onClick={handleShare}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copied!' : 'Share Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs / Product Specification Details */}
      <div className="border-t border-white/5 pt-10">
        <div className="flex border-b border-white/5 gap-6">
          {[
            { id: 'desc', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'returns', label: 'Returns & Exchange' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs uppercase tracking-widest font-semibold transition-all relative ${
                activeTab === tab.id ? 'text-accent-teal' : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-teal" />
              )}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-white/70 font-light leading-relaxed max-w-4xl space-y-4">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p>{product.description}</p>
              <p>
                Engineered with high premium technical synthetic composition, the material holds structured contour layouts for support and flexibility. Inspired by structural mechanics of human geometry.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <table className="w-full text-xs uppercase tracking-wider text-white/80">
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 font-semibold text-white/40">Brand</td>
                  <td className="py-2.5">{product.brand}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 font-semibold text-white/40">SKU</td>
                  <td className="py-2.5">{product.sku}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 font-semibold text-white/40">Material</td>
                  <td className="py-2.5">{product.material}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 font-semibold text-white/40">Color</td>
                  <td className="py-2.5">{product.color}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 font-semibold text-white/40">Fit Width</td>
                  <td className="py-2.5">{product.width} Fit</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-3">
              <p>
                Infinity Traders offers a 7-day hassle-free exchange and return window for unworn items in original box packaging.
              </p>
              <p>
                Simply trigger a return request inside your Account Dashboard, or reach out to our Customer Support. Pickup is fully coordinated by our regional logistics partners in India.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Slider */}
      {recommendations.length > 0 && (
        <div className="border-t border-white/5 pt-12 space-y-8">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Recommendations</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-white">You May Also Like</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="group bg-[#141821]/45 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all duration-300"
              >
                <Link href={`/product/${rec.id}`} className="block relative aspect-[4/5] bg-white/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rec.images[0]}
                    alt={rec.name}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="btn-primary px-3 py-1.5 text-[9px] uppercase tracking-widest font-semibold rounded">
                      Details
                    </span>
                  </div>
                </Link>

                <div className="p-4 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-accent-teal font-semibold block">{rec.brand}</span>
                  <Link
                    href={`/product/${rec.id}`}
                    className="text-xs font-semibold text-white hover:text-accent-teal transition-colors line-clamp-1"
                  >
                    {rec.name}
                  </Link>
                  <span className="text-xs font-bold text-white block">₹{rec.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowSizeGuide(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative bg-[#141821] border border-white/10 rounded-lg p-6 sm:p-8 max-w-lg w-full overflow-y-auto max-h-[90vh] space-y-6 z-10">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm uppercase tracking-widest font-bold text-white">Shoe Size Conversion Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-white/60 hover:text-white text-xs uppercase tracking-wider font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-light text-white/70 leading-relaxed">
              <p>
                Infinity Traders uses <strong>UK / Indian Standard Shoe Sizes</strong>. Convert to US/EU equivalents or check foot lengths in Centimeters below:
              </p>

              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white font-semibold">
                    <th className="py-2">UK / India</th>
                    <th className="py-2">US (Men)</th>
                    <th className="py-2">EU Equivalent</th>
                    <th className="py-2">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  <tr>
                    <td className="py-2 font-bold text-accent-teal">UK 6</td>
                    <td className="py-2">US 7</td>
                    <td className="py-2">EU 40</td>
                    <td className="py-2">25.0 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-accent-teal">UK 7</td>
                    <td className="py-2">US 8</td>
                    <td className="py-2">EU 41</td>
                    <td className="py-2">25.8 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-accent-teal">UK 8</td>
                    <td className="py-2">US 9</td>
                    <td className="py-2">EU 42</td>
                    <td className="py-2">26.6 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-accent-teal">UK 9</td>
                    <td className="py-2">US 10</td>
                    <td className="py-2">EU 43</td>
                    <td className="py-2">27.5 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-accent-teal">UK 10</td>
                    <td className="py-2">US 11</td>
                    <td className="py-2">EU 44</td>
                    <td className="py-2">28.3 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-accent-teal">UK 11</td>
                    <td className="py-2">US 12</td>
                    <td className="py-2">EU 45</td>
                    <td className="py-2">29.1 cm</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-[#1f2833]/30 border border-white/5 p-3.5 rounded text-[11px] leading-relaxed">
                <span className="font-semibold text-white block mb-1">How to Measure:</span>
                Place your heel against a flat wall, draw a line at the longest toe, and measure distance in centimeters. Choose the corresponding size. Standard fit supports standard width configuration.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
