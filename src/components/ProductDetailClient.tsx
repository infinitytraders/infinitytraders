'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { toggleWishlistAction, recordRecentlyViewedAction } from '@/app/actions';
import { Star, Truck, Heart, Share2, Plus, Minus, ShieldAlert } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 bg-[#f4f3ef]">
      {/* Breadcrumbs */}
      <nav className="text-[10px] uppercase tracking-[0.2em] text-black/45 flex items-center gap-2">
        <Link href="/" className="hover:text-black font-semibold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black font-semibold transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-black font-semibold transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-black/80 font-bold line-clamp-1">{product.name}</span>
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
                className={`aspect-square w-full rounded-xl bg-white border overflow-hidden transition-all ${
                  selectedImage === img ? 'border-black ring-1 ring-black' : 'border-black/5 hover:border-black/20'
                }`}
              >
                <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="md:col-span-10 aspect-[4/5] bg-white border border-black/5 rounded-2xl overflow-hidden relative shadow-xs">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 right-4 bg-black text-white text-[9px] font-extrabold px-3 py-1 rounded-full z-10">
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
                className={`w-16 h-20 rounded-xl bg-white border overflow-hidden ${
                  selectedImage === img ? 'border-black ring-1 ring-black' : 'border-black/5'
                }`}
              >
                <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Pricing & Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-black/55 font-bold">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase mt-1">
              {product.name}
            </h1>
            <span className="text-[9px] text-black/40 tracking-wider block mt-1">SKU: {product.sku}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.averageRating)
                      ? 'text-black fill-black'
                      : 'text-black/10'
                  }`}
                />
              ))}
              <span className="text-xs text-black font-extrabold ml-1">{product.averageRating}</span>
            </div>
            <span className="text-xs text-black/40 border-l border-black/10 pl-4 font-medium">
              {product.reviewsCount} reviews
            </span>
          </div>

          {/* Pricing Box */}
          <div className="bg-white border border-black/5 p-5 rounded-2xl space-y-2.5 shadow-xs">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-black">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.sellingPrice && (
                <>
                  <span className="text-xs text-black/40 line-through font-medium">
                    MRP ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-teal-800 font-extrabold">
                    Save ₹{(product.mrp - product.sellingPrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-black/50 leading-relaxed font-light">
              MRP inclusive of all Indian taxes. GST breakdown (18% value: ~₹{productGst.toLocaleString('en-IN')}) shown transparently in cart.
            </p>
          </div>

          {/* Sizing Grid (Indian sizes) */}
          {product.category === 'Footwear' || product.category === 'Slippers' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase font-extrabold text-black/85">
                <span>Select Shoe Size (UK / India)</span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-black underline text-[9px] font-extrabold"
                >
                  Size Conversions
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-center text-xs border rounded-xl transition-all font-semibold ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 bg-white text-black hover:border-black/20'
                    }`}
                  >
                    UK {size}
                  </button>
                ))}
              </div>
            </div>
          ) : product.category === 'Apparel' ? (
            <div className="space-y-3">
              <div className="text-xs tracking-wider uppercase font-extrabold text-black/85">
                Select Chest Size
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-center text-xs border rounded-xl transition-all font-semibold ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 bg-white text-black hover:border-black/20'
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
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-extrabold text-black/85 block">
                Shoe Width Configuration
              </span>
              <div className="flex gap-2">
                {['Standard', 'Wide'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWidth(w)}
                    className={`px-5 py-2 text-xs border rounded-full uppercase tracking-widest font-bold transition-all ${
                      selectedWidth === w
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 bg-white text-black hover:border-black/20'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black/85 block">Quantity</span>
            <div className="flex items-center border border-black/10 rounded-full w-32 overflow-hidden bg-white shadow-xs p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-black/75 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="flex-1 text-center text-xs text-black font-extrabold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-black/75 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {product.stockQuantity > 0 ? (
              <>
                <button
                  onClick={() => addToCart(product, quantity, selectedSize)}
                  className="flex-1 bg-black hover:bg-transparent text-white hover:text-black border border-black py-4 text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-white hover:bg-black text-black hover:text-white border border-black/10 hover:border-black py-4 text-xs font-bold uppercase tracking-widest rounded-full transition-all text-center"
                >
                  Buy It Now
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full bg-black/5 border border-black/5 text-black/30 py-4 text-xs uppercase tracking-widest font-bold rounded-full cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={handleWishlistToggle}
              className={`p-4 border rounded-full transition-colors flex items-center justify-center ${
                wishlisted
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-black/10 bg-white text-black hover:border-black/25'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-600' : ''}`} />
            </button>
          </div>

          {/* Pincode Checker */}
          <div className="border-t border-black/5 pt-5 space-y-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black/85 block flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-black" /> Check Availability & Delivery Speed
            </span>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-white transition-all"
              />
              <button
                type="submit"
                disabled={checkingPin || pincode.length !== 6}
                className="bg-black hover:bg-transparent text-white hover:text-black border border-black px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold disabled:opacity-50 transition-all"
              >
                Check
              </button>
            </form>

            {pincodeStatus.checked && (
              <div
                className={`text-xs p-4 rounded-xl border flex items-start gap-2 ${
                  pincodeStatus.serviceable
                    ? 'bg-teal-500/5 border-teal-500/10 text-teal-800'
                    : 'bg-red-500/5 border-red-500/10 text-red-800'
                }`}
              >
                {pincodeStatus.serviceable ? (
                  <div>
                    <p className="font-extrabold uppercase tracking-wider text-[10px]">Estimated transit: {pincodeStatus.days} days</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Dispatched via premium express from Dhanbad HQ.</p>
                  </div>
                ) : (
                  <span className="font-semibold">{pincodeStatus.error || 'Delivery unavailable to this pincode.'}</span>
                )}
              </div>
            )}
          </div>

          {/* Social Share & Brand disclosure */}
          <div className="flex justify-between items-center text-xs text-black/40 pt-4 border-t border-black/5">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-black" /> 100% Genuine Distributor Stock
            </span>
            <button
              onClick={handleShare}
              className="hover:text-black font-semibold transition-colors flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copied!' : 'Share Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs / Product Specification Details */}
      <div className="border-t border-black/5 pt-10">
        <div className="flex border-b border-black/5 gap-6">
          {[
            { id: 'desc', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'returns', label: 'Returns & Exchange' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs uppercase tracking-widest font-extrabold transition-all relative ${
                activeTab === tab.id ? 'text-black' : 'text-black/40 hover:text-black'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-black/70 font-light leading-relaxed max-w-4xl space-y-4">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p>{product.description}</p>
              <p>
                Engineered with high premium technical synthetic composition, the material holds structured contour layouts for support and flexibility. Inspired by structural mechanics of human geometry.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <table className="w-full text-xs uppercase tracking-wider text-black/85">
              <tbody>
                <tr className="border-b border-black/5">
                  <td className="py-3.5 font-bold text-black/40">Brand</td>
                  <td className="py-3.5 font-medium">{product.brand}</td>
                </tr>
                <tr className="border-b border-black/5">
                  <td className="py-3.5 font-bold text-black/40">SKU</td>
                  <td className="py-3.5 font-medium">{product.sku}</td>
                </tr>
                <tr className="border-b border-black/5">
                  <td className="py-3.5 font-bold text-black/40">Material</td>
                  <td className="py-3.5 font-medium">{product.material}</td>
                </tr>
                <tr className="border-b border-black/5">
                  <td className="py-3.5 font-bold text-black/40">Color</td>
                  <td className="py-3.5 font-medium">{product.color}</td>
                </tr>
                <tr className="border-b border-black/5">
                  <td className="py-3.5 font-bold text-black/40">Fit Width</td>
                  <td className="py-3.5 font-medium">{product.width} Fit</td>
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
        <div className="border-t border-black/5 pt-12 space-y-8">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">Recommendations</span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider text-black uppercase">You May Also Like</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="group bg-white border border-black/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 shadow-xs"
              >
                <Link href={`/product/${rec.id}`} className="block relative aspect-[4/5] bg-white overflow-hidden border-b border-black/5">
                  <img
                    src={rec.images[0]}
                    alt={rec.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-black/45 font-bold block">{rec.brand}</span>
                    <Link
                      href={`/product/${rec.id}`}
                      className="text-sm font-extrabold text-black hover:underline transition-all line-clamp-1 mt-1"
                    >
                      {rec.name}
                    </Link>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-black/5">
                    <span className="text-sm font-extrabold text-black">₹{rec.sellingPrice.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] bg-black text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">Details</span>
                  </div>
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
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative bg-[#f4f3ef] border border-black/5 rounded-2xl p-6 sm:p-8 max-w-lg w-full overflow-y-auto max-h-[90vh] space-y-6 z-10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-black">Shoe Size Conversion Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-black/50 hover:text-black text-xs uppercase tracking-wider font-extrabold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-light text-black/70 leading-relaxed">
              <p>
                Infinity Traders uses <strong>UK / Indian Standard Shoe Sizes</strong>. Convert to US/EU equivalents or check foot lengths in Centimeters below:
              </p>

              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-black/10 text-black font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">UK / India</th>
                    <th className="py-2.5">US (Men)</th>
                    <th className="py-2.5">EU Equivalent</th>
                    <th className="py-2.5">Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px] font-medium text-black">
                  <tr>
                    <td className="py-2 font-bold text-black">UK 6</td>
                    <td className="py-2">US 7</td>
                    <td className="py-2">EU 40</td>
                    <td className="py-2">25.0 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-black">UK 7</td>
                    <td className="py-2">US 8</td>
                    <td className="py-2">EU 41</td>
                    <td className="py-2">25.8 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-black">UK 8</td>
                    <td className="py-2">US 9</td>
                    <td className="py-2">EU 42</td>
                    <td className="py-2">26.6 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-black">UK 9</td>
                    <td className="py-2">US 10</td>
                    <td className="py-2">EU 43</td>
                    <td className="py-2">27.5 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-black">UK 10</td>
                    <td className="py-2">US 11</td>
                    <td className="py-2">EU 44</td>
                    <td className="py-2">28.3 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-black">UK 11</td>
                    <td className="py-2">US 12</td>
                    <td className="py-2">EU 45</td>
                    <td className="py-2">29.1 cm</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-white border border-black/5 p-4 rounded-xl text-[11px] leading-relaxed text-black/85">
                <span className="font-bold text-black block mb-1">How to Measure:</span>
                Place your heel against a flat wall, draw a line at the longest toe, and measure distance in centimeters. Choose the corresponding size. Standard fit supports standard width configuration.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
