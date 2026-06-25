'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingCart, Star, CheckCircle, ShieldAlert, Award, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const { addToCart, pincode, setPincode, pincodeStatus, checkPincodeServiceability } = useCart();
  const [activeTab, setActiveTab] = useState<'new' | 'best' | 'trending'>('new');
  const [checkingPin, setCheckingPin] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredProducts = initialProducts.filter((p) => {
    if (activeTab === 'new') return p.isNewArrival;
    if (activeTab === 'best') return p.isBestSeller;
    if (activeTab === 'trending') return p.isTrending;
    return true;
  });

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    setCheckingPin(true);
    await checkPincodeServiceability(pincode);
    setCheckingPin(false);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div className="space-y-24 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-between overflow-hidden -mt-24 px-4 sm:px-6 lg:px-8">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-[#0b0c10]/50 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80"
            alt="Running athlete hero background"
            className="w-full h-full object-cover object-center filter grayscale brightness-50 contrast-125"
          />
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto w-full z-20 relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6 text-left">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold block"
            >
              Axicore Engineering & Natural Mechanics
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight uppercase"
            >
              Enjoy the Run <br />
              <span className="text-white/60 font-light">Elevate the Fit</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg text-white/70 max-w-xl font-light tracking-wide"
            >
              Premium athletic footwear, recovery sliders, and high-performance lifestyle gear engineered for natural foot motion.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link
                href="/shop"
                className="btn-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 rounded"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#brand-story"
                className="btn-secondary px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded"
              >
                Our Philosophy
              </a>
            </motion.div>
          </div>
        </div>

        {/* Curved decorative bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#0b0c10] z-20 concave-left concave-right opacity-30 pointer-events-none" />
      </section>

      {/* 2. PROMOTIONAL METRIC BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#1f2833]/15 border border-white/5 p-8 rounded-lg text-center backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-accent-teal block text-2xl sm:text-3xl font-extrabold tracking-wide">100%</span>
            <span className="text-xs uppercase tracking-widest text-white/50 font-light">GST Compliant Invoice</span>
          </div>
          <div className="space-y-1 border-l border-white/5">
            <span className="text-accent-teal block text-2xl sm:text-3xl font-extrabold tracking-wide">₹999</span>
            <span className="text-xs uppercase tracking-widest text-white/50 font-light">Free Shipping Threshold</span>
          </div>
          <div className="space-y-1 border-l border-white/5">
            <span className="text-accent-teal block text-2xl sm:text-3xl font-extrabold tracking-wide">7 Days</span>
            <span className="text-xs uppercase tracking-widest text-white/50 font-light">Hassle-free Exchange</span>
          </div>
          <div className="space-y-1 border-l border-white/5">
            <span className="text-accent-teal block text-2xl sm:text-3xl font-extrabold tracking-wide">PAN India</span>
            <span className="text-xs uppercase tracking-widest text-white/50 font-light">Express Delivery</span>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Discovery</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-white">Featured Collections</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Footwear',
              img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Footwear',
              desc: 'High-performance sneakers'
            },
            {
              name: 'Slippers & Slides',
              img: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Slippers',
              desc: 'Recovery slides & recovery comfort'
            },
            {
              name: 'Apparel',
              img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Apparel',
              desc: 'Ergonomic athletic sportswear'
            },
            {
              name: 'Accessories',
              img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Accessories',
              desc: 'Premium gears & items'
            }
          ].map((cat, idx) => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group relative h-80 rounded overflow-hidden border border-white/5 flex flex-col justify-end p-6 glass-panel-hover"
            >
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 filter brightness-75 contrast-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/95 via-[#0b0c10]/40 to-transparent" />
              </div>
              <div className="z-10 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-accent-teal font-semibold">
                  {cat.desc}
                </span>
                <h3 className="text-lg font-bold tracking-wider text-white uppercase group-hover:text-accent-teal transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BRAND PHILOSOPHY / STORY */}
      <section id="brand-story" className="bg-[#1f2833]/10 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">
              Infinity Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase">
              The Geometry of Movement
            </h2>
            <div className="space-y-4 text-white/70 font-light text-sm leading-relaxed tracking-wide">
              <p>
                Inspired by the minimalist architectural geometry and functional design of premium athletic gear, Infinity Traders serves as India’s distribution hub for high-performance footwear and sliders.
              </p>
              <p>
                Our signature curation focus is <strong>Natural Mechanics</strong>: ensuring that every sole behaves organically like an extension of the foot. Whether you are running on track or active in daily recovery, we deliver ergonomics that do not compromise on luxury aesthetic details.
              </p>
              <p className="border-l-2 border-accent-teal pl-4 italic text-white/90">
                "Life is not a sprint, nor a simple walk. It’s an active marathon of movement. Enjoy the run with perfect support."
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                className="btn-primary px-6 py-3 text-xs font-bold uppercase tracking-widest rounded"
              >
                Explore Active Gear
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-accent-teal/10 rounded filter blur-3xl pulse-glow z-0" />
            <div className="relative border border-white/10 rounded-lg overflow-hidden z-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80"
                alt="Movement mechanics running"
                className="w-full h-auto filter grayscale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. TABBED FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Curation</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-white">Featured Products</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-[#1f2833]/30 border border-white/5 p-1 rounded-md">
            {[
              { id: 'new', label: 'New Arrivals' },
              { id: 'best', label: 'Best Sellers' },
              { id: 'trending', label: 'Trending Now' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-[10px] sm:text-xs uppercase tracking-widest font-semibold transition-all rounded ${
                  activeTab === tab.id
                    ? 'bg-accent-teal text-background'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-[#141821]/45 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all duration-300"
            >
              {/* Product Image Link */}
              <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] bg-white/5 overflow-hidden">
                {product.stockQuantity <= 3 && product.stockQuantity > 0 && (
                  <span className="absolute top-3 left-3 bg-warning text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded z-10">
                    Low Stock
                  </span>
                )}
                {product.stockQuantity === 0 && (
                  <span className="absolute top-3 left-3 bg-danger text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded z-10">
                    Out of Stock
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 right-3 bg-accent-teal text-black text-[10px] font-extrabold px-2 py-0.5 rounded z-10">
                    {product.discountPercentage}% OFF
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="btn-primary px-4 py-2 text-[10px] uppercase tracking-widest font-semibold rounded">
                    View Details
                  </span>
                </div>
              </Link>

              {/* Product details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-accent-teal font-semibold">
                    <span>{product.brand}</span>
                    <span className="text-white/40">{product.category}</span>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="block text-base font-semibold text-white mt-1 hover:text-accent-teal transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-white/50 font-light line-clamp-2 mt-1.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-accent-teal fill-accent-teal" />
                      <span className="text-xs text-white font-medium">{product.averageRating}</span>
                      <span className="text-[10px] text-white/40">({product.reviewsCount})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-[11px] text-white/40 line-through block">
                          ₹{product.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.stockQuantity > 0 ? (
                    <button
                      onClick={() => addToCart(product, 1, product.sizes[0] || 8)}
                      className="w-full btn-secondary py-2 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 rounded"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Bag
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-white/5 border border-white/10 text-white/30 py-2 text-[10px] uppercase tracking-widest font-semibold rounded cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PINCODE CHECKER WIDGET */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1f2833]/10 border border-white/5 rounded-xl p-8 space-y-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/5 rounded-full filter blur-2xl pulse-glow" />
          
          <div className="text-center space-y-2 relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-white">
              Check Serviceability & Delivery Time
            </h3>
            <p className="text-xs text-white/60 font-light max-w-lg mx-auto">
              Infinity Traders ships high-performance footwear and recovery sliders across India from our distribution depot in Dhanbad, Jharkhand. Verify estimated delivery speed for your area below.
            </p>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter your 6-digit Indian Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 input-premium text-center tracking-widest text-sm"
            />
            <button
              type="submit"
              disabled={checkingPin || pincode.length !== 6}
              className="btn-primary py-3 px-6 text-xs uppercase tracking-widest font-bold disabled:opacity-50 disabled:pointer-events-none rounded"
            >
              Check Availability
            </button>
          </form>

          {pincodeStatus.checked && (
            <div className="max-w-md mx-auto relative z-10">
              <div
                className={`p-4 rounded-md border text-center flex flex-col items-center gap-2 ${
                  pincodeStatus.serviceable
                    ? 'bg-[#10b981]/5 border-[#10b981]/25 text-[#10b981]'
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
              >
                {pincodeStatus.serviceable ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-accent-teal" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider">Serviceable Destination</p>
                      <p className="text-xs opacity-90 mt-1">
                        Shipping Route: Dhanbad &rarr; {pincodeStatus.state}
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        Estimated Transit Time: {pincodeStatus.days} Working Days
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider">Unserviceable Area</p>
                      <p className="text-xs opacity-90 mt-1">
                        {pincodeStatus.error || 'Delivery not available to this location.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. CUSTOMER TRUST TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-white">Verified Athlete Experiences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Dr. Vivek Sengupta',
              city: 'Jamshedpur',
              rating: 5,
              title: 'Best sliders for recovery',
              quote: 'As a surgeon, I stand for hours. The CloudSlide comfort sandals are a game changer. The EVA foam feels exactly like running clouds, and the arch support is perfect. Incredible service!'
            },
            {
              name: 'Anjali Sharma',
              city: 'Ranchi',
              rating: 5,
              title: 'Remarkable running support',
              quote: 'My ENA AXICORE Apex running shoes arrived in just 2 days. The energy bounce-back is unlike any standard sports brand. Understated design, pure premium material. Recommend 100%.'
            },
            {
              name: 'Kabir Verma',
              city: 'Dhanbad',
              rating: 5,
              title: 'Top customer service & GST billing',
              quote: 'I purchased footwear for my corporate club. The checkout computed a transparent GST breakdown, generated a clean commercial invoice, and processed standard delivery within 24 hours. A first-rate distributor.'
            }
          ].map((rev, i) => (
            <div key={i} className="bg-[#141821]/40 border border-white/5 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-white">{rev.name}</h4>
                  <span className="text-[10px] text-white/50 font-light">{rev.city}, Jharkhand</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 text-accent-teal fill-accent-teal" />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <h5 className="text-xs uppercase tracking-wider font-semibold text-accent-teal">{rev.title}</h5>
                <p className="text-xs text-white/70 font-light leading-relaxed">"{rev.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. NEWSLETTER SUBSCRIBE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden py-16 px-6 sm:px-12 lg:px-24 bg-gradient-to-br from-[#1f2833]/40 to-[#0b0c10]/95 border border-white/5 text-center space-y-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          
          <span className="text-xs uppercase tracking-[0.4em] text-accent-teal font-semibold">Join the Club</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase max-w-xl mx-auto leading-tight">
            Subscribe to our News & Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-light max-w-lg mx-auto leading-relaxed">
            Register your email to receive notice on product launches, coupon promotions, and active-recovery tips from Infinity Traders.
          </p>

          {newsletterSubscribed ? (
            <div className="max-w-md mx-auto bg-[#10b981]/5 border border-[#10b981]/20 p-4 rounded-md flex items-center justify-between text-left text-[#10b981]">
              <span className="text-xs font-semibold tracking-wider uppercase">Thank you! You have subscribed successfully.</span>
              <CheckCircle className="w-5 h-5 text-accent-teal" />
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 input-premium text-xs"
              />
              <button
                type="submit"
                className="btn-primary py-3 px-6 text-[10px] uppercase tracking-widest font-bold rounded flex items-center justify-center gap-1.5"
              >
                Subscribe <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 9. FOOTER STATS */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-12 text-center text-xs text-white/40 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left pb-8 border-b border-white/5">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">About Infinity Traders</h4>
            <p className="text-xs font-light text-white/60 leading-relaxed max-w-xs">
              Based in Dhanbad, Jharkhand, Infinity Traders is an official multi-brand distributor specializing in premium, biomechanically-sound footwear, slides, apparel, and running gear.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Contact & Support</h4>
            <p className="text-xs font-light text-white/60 leading-relaxed">
              HQ: Bank More, Dhanbad, Jharkhand - 826001<br />
              Email: info@infinitytraders.com<br />
              Phone: +91 99999 99999
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Compliances</h4>
            <p className="text-xs font-light text-white/60 leading-relaxed">
              GSTIN: 20ABCDE1234F1Z5<br />
              HSN Code Footwear: Chapter 64<br />
              Indian Tax Invoice Compliant (CGST/SGST/IGST breakdown at checkout)
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-white/30 text-[10px] tracking-widest uppercase">
          <span>&copy; {new Date().getFullYear()} Infinity Traders. All Rights Reserved.</span>
          <span>Designed & Engineered in India</span>
        </div>
      </footer>
    </div>
  );
}
