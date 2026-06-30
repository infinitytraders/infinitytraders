'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingCart, Star, CheckCircle, ShieldAlert, Send } from 'lucide-react';
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
    <div className="space-y-24 pb-24 bg-[#f4f3ef]">
      {/* 1. HERO SECTION (ENA Style) */}
      <section className="relative h-[95vh] flex flex-col justify-end overflow-hidden -mt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/15 z-10" />
          <img
            src="/hero_runner.png"
            alt="Athletic runner hero"
            className="w-full h-full object-cover filter brightness-95 contrast-105"
            style={{ objectPosition: 'center 8%' }}
          />
        </div>

        {/* Hero Content - Minimal bottom centered overlay */}
        <div className="max-w-7xl mx-auto w-full z-20 relative text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-none">
              INFINITY ATHLETICS
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-light tracking-[0.25em] uppercase">
              Distributor of Natural Mechanics
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center gap-4 pt-2"
          >
            <Link
              href="/shop"
              className="bg-black text-white hover:bg-white hover:text-black border border-black/10 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Shop Collection
            </Link>
            <a
              href="#brand-story"
              className="bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Learn More
            </a>
          </motion.div>


        </div>
      </section>

      {/* 2. ABOUT / CONCEPT SECTION (ABOUT) */}
      <motion.section
        id="brand-story"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-4 text-center space-y-12 pt-8 overflow-hidden"
      >
        <div className="relative inline-block">
          {/* Overlay large outline text */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-6xl sm:text-9xl outline-text pointer-events-none select-none tracking-widest opacity-25">
            ABOUT
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-[0.15em] text-black uppercase relative z-10">
            Born of Jharkhand
          </h2>
        </div>

        <p className="text-sm sm:text-base text-black/75 font-light leading-loose max-w-2xl mx-auto tracking-wide">
          Infinity Traders reflects the timeless harmony between body and environment, a principle rooted in distributors of elite footwear. As India's distribution source for premium athletic brands, we deliver high-performance gear guided by Natural Mechanics: performance that moves in sync with the body, not against it.
        </p>

        {/* Pedestal Rock & Shoe Shot */}
        <div className="relative pt-6 max-w-md mx-auto flex flex-col items-center">
          {/* Shoe & Pedestal Image */}
          <img
            src="/premium_shoe.png"
            alt="Premium athletic shoe on pedestal"
            className="w-full rounded-2xl border border-black/5 hover:translate-y-[-8px] transition-transform duration-500 shadow-sm"
          />
        </div>
      </motion.section>

      {/* 3. BRAND PHILOSOPHY & DETAILS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center pt-8"
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold block">
              CURATED PREMIUM ATHLETICS
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-wider text-black uppercase">
              Engineered for Motion
            </h3>
          </div>
          <p className="text-sm text-black/70 font-light leading-loose tracking-wide">
            At the core of our curation lies high-performance engineering from the world's leading brands: Nike, Adidas, Puma, Skechers, and Reebok. Every article of footwear, apparel, and training accessory is hand-picked to deliver maximum energy return, ergonomic movement, and long-term durability. Experience motion that flows naturally: stable, efficient, and powerful.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="bg-black text-white hover:bg-transparent hover:text-black border border-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Explore Products
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-black/5 bg-white shadow-sm group">
          <img
            src="/shoe_sole.png"
            alt="High performance sole close up"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 filter grayscale"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </motion.section>

      {/* 4. PROMOTIONAL METRIC BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-black/5 p-8 rounded-2xl text-center shadow-xs">
          <div className="space-y-1">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">100%</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">GST Compliant Invoice</span>
          </div>
          <div className="space-y-1 border-l border-black/5">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">₹999</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Free Shipping Threshold</span>
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">7 Days</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Hassle-free Exchange</span>
          </div>
          <div className="space-y-1 border-t md:border-t-0 border-l border-black/5 pt-4 md:pt-0">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">PAN India</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Express Delivery</span>
          </div>
        </div>
      </motion.section>

      {/* 5. CATEGORIES SHOWCASE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">Collections</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">Browse Categories</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Footwear',
              img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Footwear',
              desc: 'High-performance running'
            },
            {
              name: 'Slippers & Slides',
              img: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Slippers',
              desc: 'Recovery slides'
            },
            {
              name: 'Apparel',
              img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Apparel',
              desc: 'Active comfort sportswear'
            },
            {
              name: 'Accessories',
              img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Accessories',
              desc: 'Training accessories'
            }
          ].map((cat) => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group relative h-96 rounded-2xl overflow-hidden border border-black/5 flex flex-col justify-end p-6 bg-white shadow-xs"
            >
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="z-10 space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-white/60 font-semibold">
                  {cat.desc}
                </span>
                <h3 className="text-base font-extrabold tracking-wider text-white uppercase group-hover:underline">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* 6. CURATED FEATURED PRODUCTS GRID */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-black/5 pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">Curation</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">Featured Products</h2>
          </div>

          {/* Filter Tabs (Capsules) */}
          <div className="flex gap-1.5 bg-white border border-black/5 p-1 rounded-full shadow-xs max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'new', label: 'New Arrivals' },
              { id: 'best', label: 'Best Sellers' },
              { id: 'trending', label: 'Trending' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold transition-all rounded-full whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-black/55 hover:text-black hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curated Products Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              key={product.id}
              className="group bg-white border border-black/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 shadow-xs"
            >
              {/* Product Image Link */}
              <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] bg-[#fcfbf9] overflow-hidden border-b border-black/5">
                {product.stockQuantity <= 3 && product.stockQuantity > 0 && (
                  <span className="absolute top-3 left-3 bg-[#d97706] text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
                    Low Stock
                  </span>
                )}
                {product.stockQuantity === 0 && (
                  <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
                    Out of Stock
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 right-3 bg-black text-white text-[8px] font-bold px-2.5 py-1 rounded-full z-10">
                    {product.discountPercentage}% OFF
                  </span>
                )}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              {/* Product details */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-black/45 font-bold">
                    <span>{product.brand}</span>
                    <span>{product.category}</span>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="block text-base font-extrabold text-black mt-1.5 hover:underline transition-all line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-black/60 font-light line-clamp-2 mt-1.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 text-black fill-black" />
                      <span className="text-[10px] text-black font-extrabold">{product.averageRating}</span>
                      <span className="text-[9px] text-black/50">({product.reviewsCount})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-black">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-[10px] text-black/40 line-through block font-medium">
                          ₹{product.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.stockQuantity > 0 ? (
                    <button
                      suppressHydrationWarning
                      onClick={() => addToCart(product, 1, product.sizes[0] || 8)}
                      className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-2.5 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-full transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Bag
                    </button>
                  ) : (
                    <button
                      suppressHydrationWarning
                      disabled
                      className="w-full bg-black/5 border border-black/5 text-black/30 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-full cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 7. PINCODE SERVICEABILITY CONTAINER */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white border border-black/5 rounded-2xl p-8 space-y-6 shadow-xs text-center">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold block">Shipping Depot</span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-wider text-black uppercase">
              Check Serviceability & Delivery Time
            </h3>
            <p className="text-xs text-black/60 font-light max-w-md mx-auto leading-relaxed">
              Infinity Traders ships high-performance footwear and recovery sliders across India from our distribution depot in Dhanbad, Jharkhand. Verify estimated delivery speed for your area below.
            </p>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              suppressHydrationWarning
              type="text"
              maxLength={6}
              placeholder="Enter your 6-digit Indian Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 border border-black/10 hover:border-black/25 focus:border-black rounded-full px-5 py-3 text-center tracking-widest text-xs outline-none bg-[#fdfdfd] transition-all"
            />
            <button
              suppressHydrationWarning
              type="submit"
              disabled={checkingPin || pincode.length !== 6}
              className="bg-black hover:bg-transparent text-white hover:text-black border border-black py-3 px-6 text-xs uppercase tracking-widest font-bold disabled:opacity-50 disabled:pointer-events-none rounded-full transition-all"
            >
              Check Availability
            </button>
          </form>

          {pincodeStatus.checked && (
            <div className="max-w-md mx-auto pt-2">
              <div
                className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 ${
                  pincodeStatus.serviceable
                    ? 'bg-teal-500/5 border-teal-500/10 text-teal-800'
                    : 'bg-red-500/5 border-red-500/10 text-red-800'
                }`}
              >
                {pincodeStatus.serviceable ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-teal-700" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider">Serviceable Destination</p>
                      <p className="text-[11px] opacity-90 mt-1">
                        Shipping Route: Dhanbad &rarr; {pincodeStatus.state}
                      </p>
                      <p className="text-[11px] font-bold mt-1">
                        Estimated Transit Time: {pincodeStatus.days} Working Days
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-700" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider">Unserviceable Area</p>
                      <p className="text-[11px] opacity-90 mt-1">
                        {pincodeStatus.error || 'Delivery not available to this location.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* 8. VERIFIED EXPERIENCES */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">Verified Athlete Experiences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Dr. Vivek Sengupta',
              city: 'Jamshedpur',
              rating: 5,
              title: 'Best slides for recovery',
              quote: 'As a surgeon, I stand for hours. The Adidas Adilette Comfort Slides are a game changer. The EVA foam feels exactly like walking on clouds, and the arch support is perfect. Incredible service!'
            },
            {
              name: 'Anjali Sharma',
              city: 'Ranchi',
              rating: 5,
              title: 'Remarkable running support',
              quote: 'My Nike Air Zoom Pegasus running shoes arrived in just 2 days. The energy bounce-back is unlike any standard sports brand. Understated design, pure premium material. Recommend 100%.'
            },
            {
              name: 'Kabir Verma',
              city: 'Dhanbad',
              rating: 5,
              title: 'Top customer service & GST billing',
              quote: 'I purchased footwear for my corporate club. The checkout computed a transparent GST breakdown, generated a clean commercial invoice, and processed standard delivery within 24 hours. A first-rate distributor.'
            }
          ].map((rev, i) => (
            <div key={i} className="bg-white border border-black/5 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-extrabold text-black uppercase">{rev.name}</h4>
                  <span className="text-[10px] text-black/50 font-light">{rev.city}, Jharkhand</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 text-black fill-black" />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-black">{rev.title}</h5>
                <p className="text-xs text-black/70 font-light leading-relaxed">"{rev.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 9. NEWSLETTER SUBSCRIBE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="relative rounded-2xl overflow-hidden py-16 px-6 sm:px-12 lg:px-24 bg-white border border-black/5 text-center space-y-6 shadow-xs">
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold block">Join the Club</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase max-w-xl mx-auto leading-tight">
            Subscribe to our News & Campaigns
          </h2>
          <p className="text-xs text-black/60 font-light max-w-md mx-auto leading-relaxed">
            Register your email to receive notice on product launches, coupon promotions, and active-recovery tips from Infinity Traders.
          </p>

          {newsletterSubscribed ? (
            <div className="max-w-md mx-auto bg-teal-500/5 border border-teal-500/10 p-4 rounded-xl flex items-center justify-between text-left text-teal-800">
              <span className="text-[10px] font-extrabold tracking-wider uppercase">Thank you! You have subscribed successfully.</span>
              <CheckCircle className="w-5 h-5 text-teal-700" />
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                suppressHydrationWarning
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 border border-black/10 hover:border-black/25 focus:border-black rounded-full px-5 py-3 text-xs outline-none bg-[#fdfdfd] transition-all"
              />
              <button
                suppressHydrationWarning
                type="submit"
                className="bg-black hover:bg-transparent text-white hover:text-black border border-black py-3 px-6 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all flex items-center justify-center gap-1.5"
              >
                Subscribe <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </motion.section>

      {/* 10. FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-black/5 pt-12 text-center text-xs text-black/45 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left pb-8 border-b border-black/5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-black">About Infinity Traders</h4>
            <p className="text-xs font-light text-black/75 leading-relaxed max-w-xs">
              Based in Dhanbad, Jharkhand, Infinity Traders is an official multi-brand distributor specializing in premium, biomechanically-sound footwear, slides, apparel, and running gear.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-black">Contact & Support</h4>
            <p className="text-xs font-light text-black/75 leading-relaxed">
              HQ: Bank More, Dhanbad, Jharkhand - 826001<br />
              Email: info@infinitytraders.com<br />
              Phone: +91 99999 99999
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-black">Compliances</h4>
            <p className="text-xs font-light text-black/75 leading-relaxed">
              GSTIN: 20ABCDE1234F1Z5<br />
              HSN Code Footwear: Chapter 64<br />
              Indian Tax Invoice Compliant (CGST/SGST/IGST breakdown at checkout)
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-black/35 text-[9px] tracking-widest uppercase">
          <span>&copy; {new Date().getFullYear()} Infinity Traders. All Rights Reserved.</span>
          <span>Designed & Engineered in India</span>
        </div>
      </footer>
    </div>
  );
}
