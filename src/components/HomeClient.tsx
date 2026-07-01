'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ShoppingCart, Star, CheckCircle, ShieldAlert, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const { addToCart, pincode, setPincode, pincodeStatus, checkPincodeServiceability } = useCart();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'new' | 'best' | 'trending'>('new');
  const [checkingPin, setCheckingPin] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [activeIndex, setActiveIndex] = useState(1); // Default to clothes (index 1)
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowWidth(window.innerWidth);
    };
    setIsMobile(window.innerWidth < 768);
    setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getProductLayout = (slideId: string, isCenter: boolean) => {
    const containerWidth = isMobile ? windowWidth - 32 : Math.min(windowWidth - 32, 1200);
    const stoneWidth = isMobile ? containerWidth * 1.00 : containerWidth * 0.96;
    const stoneHeight = stoneWidth / 1.5;
    
    const containerHeight = isMobile ? 420 : 540;
    const stoneCenterY = containerHeight / 2 + containerHeight * -0.04;
    const stoneTop = stoneCenterY - stoneHeight / 2;

    const productBaseWidth = isMobile ? containerWidth * 0.66 : containerWidth * 0.54;

    let scaleRatio = 0.75;
    let bottomPadding = 0.02;
    let aspectRatio = 0.5;

    if (slideId === 'shoes') {
      scaleRatio = isCenter ? 0.70 : 0.40;
      bottomPadding = isMobile ? 0.18 : 0.14;
      aspectRatio = 0.5;
    } else if (slideId === 'clothes') {
      scaleRatio = isCenter ? 0.85 : 0.52;
      bottomPadding = isMobile ? 0.30 : 0.25;
      aspectRatio = 0.43;
    } else if (slideId === 'accessories') {
      scaleRatio = isCenter ? 0.72 : 0.42;
      bottomPadding = isMobile ? 0.24 : 0.19;
      aspectRatio = 0.385;
    }

    const baseWidth = productBaseWidth;
    const baseHeight = baseWidth * aspectRatio;

    const scaledWidth = baseWidth * scaleRatio;
    const scaledHeight = scaledWidth * aspectRatio;

    const flatTopY = stoneTop + stoneHeight * 0.52;
    const yCenter = flatTopY - scaledHeight / 2 + scaledHeight * bottomPadding;

    const groundY = stoneTop + stoneHeight * 0.90;
    const ySideCenter = groundY - scaledHeight / 2 + scaledHeight * bottomPadding;

    return {
      width: baseWidth,
      height: baseHeight,
      scaleRatio,
      yCenter,
      ySideCenter
    };
  };

  const swiperSlides = [
    {
      id: 'shoes',
      title: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'दौड़ने के लिए जूते' : 'Shoes for your run',
      descLines: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? [
        'इंजीनियर रनिंग जूते',
        'गतिशील कुशन सपोर्ट',
        'हवादार तकनीक मेश',
        'सर्वोत्तम ऊर्जा वापसी'
      ] : [
        'Engineered running shoes',
        'Dynamic cushion support',
        'Breathable tech mesh',
        'Optimal energy return'
      ],
      img: '/swiper-shoe.png',
      link: '/shop?category=Footwear'
    },
    {
      id: 'clothes',
      title: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'वर्कआउट के लिए कपड़े' : 'Clothes for your workout',
      descLines: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? [
        'सक्रिय कम्फर्ट स्पोर्ट्सवियर',
        'पसीना सोखने वाली तकनीक',
        'लचीला फिटिंग मटीरियल',
        'दैनिक प्रशिक्षण प्रदर्शन'
      ] : [
        'Premium active comfort apparel',
        'Sweat-wicking technology',
        'Ultra-stretch fitting fabric',
        'Daily training performance'
      ],
      img: '/swiper-clothes.png',
      link: '/shop?category=Apparel'
    },
    {
      id: 'accessories',
      title: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'ट्रेनिंग के लिए एक्सेसरीज' : 'Accessories for your training',
      descLines: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? [
        'आवश्यक प्रशिक्षण गियर',
        'प्रीमियम एक्टिव वियरेबल्स',
        'टिकाऊ निर्माण सामग्री',
        'प्रदर्शन ट्रैकिंग सहायता'
      ] : [
        'Essential training gear',
        'Premium active wearables',
        'Durable construction material',
        'Performance tracking assistance'
      ],
      img: '/swiper-accessories.png',
      link: '/shop?category=Accessories'
    }
  ];

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
      <section className="relative h-screen -mt-24 flex flex-col justify-end overflow-hidden pb-28 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/15 z-10" />
          <img
            src="/hero_runner.png"
            alt="Athletic runners hero"
            className="w-full h-full object-cover filter brightness-95 contrast-105"
            style={{ objectPosition: 'center 35%' }}
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
              {t('home.hero.title')}
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-light tracking-[0.25em] uppercase">
              {t('home.hero.subtitle')}
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
              {t('home.hero.cta')}
            </Link>
            <a
              href="#brand-story"
              className="bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अधिक जानें' : 'Learn More'}
            </a>
          </motion.div>


        </div>
      </section>

      {/* 2. ABOUT / CONCEPT SECTION (ABOUT) */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] text-black overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              {/* Overlay large outline text */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-6xl sm:text-9xl outline-text pointer-events-none select-none tracking-widest opacity-25">
                {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'परिचय' : 'ABOUT'}
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-[0.15em] text-black uppercase relative z-10">
                {t('home.whyTraders')}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-black/75 font-light leading-loose max-w-2xl mx-auto tracking-wide">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'इन्फिनिटी ट्रेडर्स शरीर और पर्यावरण के बीच शाश्वत सामंजस्य को दर्शाता है, एक ऐसा सिद्धांत जो विशिष्ट जूतों के वितरकों में निहित है। प्रीमियम एथलेटिक ब्रांडों के लिए भारत के वितरण स्रोत के रूप में, हम प्राकृतिक यांत्रिकी द्वारा निर्देशित उच्च-प्रदर्शन गियर प्रदान करते हैं: प्रदर्शन जो शरीर के साथ तालमेल बिठाता है, उसके खिलाफ नहीं।' : 'Infinity Traders reflects the timeless harmony between body and environment, a principle rooted in distributors of elite footwear. As India\'s distribution source for premium athletic brands, we deliver high-performance gear guided by Natural Mechanics: performance that moves in sync with the body, not against it.'}
            </p>
          </div>

          {/* Centered Minimalist Swiper Info */}
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-4 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 flex flex-col items-center"
              >
                {/* Category Badge & Slide Count */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-black/40">
                    {activeIndex === 0 ? '01 / FOOTWEAR' : activeIndex === 1 ? '02 / APPAREL' : '03 / TRAINING GEAR'}
                  </span>
                  <div className="h-[1px] w-8 bg-black/10" />
                  <span className="text-[10px] font-bold tracking-widest text-black/40">
                    {activeIndex + 1} OF 3
                  </span>
                </div>

                {/* Slide Title */}
                <h3 className="text-2xl sm:text-4xl font-extrabold text-black uppercase tracking-wider leading-none">
                  {swiperSlides[activeIndex].title}
                </h3>

                {/* Centered inline features list */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-xs sm:text-sm text-black/60 font-light tracking-wide pt-1">
                  {swiperSlides[activeIndex].descLines.map((line, idx) => (
                    <span key={idx} className="flex items-center gap-2">
                      {idx > 0 && <span className="text-black/20 font-light">•</span>}
                      {line}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3D Barrel Swiper Container (Centered & Full Width) */}
          <div className="relative w-full max-w-6xl h-[420px] sm:h-[540px] flex items-center justify-center overflow-visible mx-auto pt-4" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            
            {/* Stationary Pedestal Stone Background (Scaled up and shifted down) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
              <motion.img
                src="/stone.png"
                alt="Stone background pedestal"
                className="w-[100%] sm:w-[96%] h-auto max-h-[100%] object-contain mt-[-4%] z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              />
            </div>

            {/* Slides representation */}
            {swiperSlides.map((slide, index) => {
              // Calculate offset relative to activeIndex (handles looping for 3 items)
              const offset = (index - activeIndex + 3) % 3;
              
              // We want standard offsets: 0 is Center, 1 is Right, 2 is Left
              const isCenter = offset === 0;
              const isRight = offset === 1;
              const isLeft = offset === 2;

              const layout = getProductLayout(slide.id, isCenter);
              const containerHeight = isMobile ? 420 : 540;
              const targetY = isCenter ? layout.yCenter : layout.ySideCenter;
              const yOffset = targetY - containerHeight / 2;

              let xVal = '0px';
              let rotateY = 0;
              let opacity = 1.0;
              let zIndex = 20;
              let zDepth = 0;

              if (isLeft) {
                xVal = isMobile ? 'calc(-50% - 155px)' : 'calc(-50% - 490px)'; // Flank far left to use gaps
                rotateY = 0;
                opacity = isMobile ? 0 : 0.45; // Hidden on mobile to prevent clutter/overflow
                zIndex = 10;
                zDepth = isMobile ? -100 : -50;
              } else if (isRight) {
                xVal = isMobile ? 'calc(-50% + 155px)' : 'calc(-50% + 490px)'; // Flank far right to use gaps
                rotateY = 0;
                opacity = isMobile ? 0 : 0.45; // Hidden on mobile to prevent clutter/overflow
                zIndex = 10;
                zDepth = isMobile ? -100 : -50;
              } else {
                // Center
                xVal = '-50%';
                rotateY = 0;
                opacity = 1.0;
                zIndex = 30;
                zDepth = 50;
              }

              const yVal = `calc(-50% + ${yOffset}px)`;

              return (
                <motion.div
                  key={slide.id}
                  className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center cursor-pointer select-none"
                  style={{ 
                    width: layout.width, 
                    height: layout.height, 
                    transformStyle: 'preserve-3d', 
                    pointerEvents: (!isCenter && isMobile) ? 'none' : 'auto' 
                  }}
                  animate={{
                    x: xVal,
                    y: yVal,
                    scale: layout.scaleRatio,
                    opacity,
                    rotateY,
                    z: zDepth
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    if (!isCenter && !isMobile) {
                      setActiveIndex(index);
                    }
                  }}
                >
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className={`w-full h-full object-contain select-none pointer-events-none ${
                      isCenter 
                        ? 'drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)]' 
                        : 'drop-shadow-[0_10px_15px_rgba(0,0,0,0.06)]'
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Minimalist Buy Now button centered below the stone pedestal */}
          <div className="flex justify-center pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={swiperSlides[activeIndex].link}
                  className="bg-black hover:bg-transparent text-white hover:text-black border border-black px-10 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm"
                >
                  {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अभी खरीदें' : 'Buy now'}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Swipe Indicator Dots */}
          <div className="flex gap-2.5 justify-center mt-8">
            {swiperSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 transition-all rounded-full ${
                  index === activeIndex ? 'w-8 bg-black' : 'w-2 bg-black/15'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

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
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'क्यूरेटेड प्रीमियम एथलेटिक्स' : 'CURATED PREMIUM ATHLETICS'}
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-wider text-black uppercase">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'गति के लिए इंजीनियर' : 'Engineered for Motion'}
            </h3>
          </div>
          <p className="text-sm text-black/70 font-light leading-loose tracking-wide">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हमारे क्यूरेशन के केंद्र में दुनिया के अग्रणी ब्रांडों: नाइके, एडिडास, प्यूमा, स्केचर्स और रीबॉक से उच्च प्रदर्शन वाली इंजीनियरिंग है। जूतों, परिधानों और प्रशिक्षण के सामानों की प्रत्येक वस्तु को अधिकतम ऊर्जा वापसी, एर्गोनोमिक गतिशीलता और दीर्घकालिक स्थायित्व प्रदान करने के लिए चुना गया है।' : 'At the core of our curation lies high-performance engineering from the world\'s leading brands: Nike, Adidas, Puma, Skechers, and Reebok. Every article of footwear, apparel, and training accessory is hand-picked to deliver maximum energy return, ergonomic movement, and long-term durability.'}
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="bg-black text-white hover:bg-transparent hover:text-black border border-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'उत्पाद देखें' : 'Explore Products'}
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
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'जीएसटी अनुपालन चालान' : 'GST Compliant Invoice'}</span>
          </div>
          <div className="space-y-1 border-l border-black/5">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">₹999</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मुफ़्त शिपिंग सीमा' : 'Free Shipping Threshold'}</span>
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">7 Days</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'परेशानी मुक्त विनिमय' : 'Hassle-free Exchange'}</span>
          </div>
          <div className="space-y-1 border-t md:border-t-0 border-l border-black/5 pt-4 md:pt-0">
            <span className="text-black block text-2xl sm:text-3xl font-extrabold tracking-wide">PAN India</span>
            <span className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एक्सप्रेस वितरण' : 'Express Delivery'}</span>
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
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'संग्रह' : 'Collections'}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'श्रेणियां ब्राउज़ करें' : 'Browse Categories'}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'जूते (Footwear)' : 'Footwear',
              img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Footwear',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'उच्च प्रदर्शन रनिंग' : 'High-performance running'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'स्लीपर्स और स्लाइड्स' : 'Slippers & Slides',
              img: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Slippers',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'रिकवरी स्लाइड्स' : 'Recovery slides'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'परिधान (Apparel)' : 'Apparel',
              img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Apparel',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सक्रिय आराम स्पोर्ट्सवियर' : 'Active comfort sportswear'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सहायक उपकरण' : 'Accessories',
              img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
              link: '/shop?category=Accessories',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'प्रशिक्षण सहायक उपकरण' : 'Training accessories'
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
            <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'क्यूरेशन' : 'Curation'}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'विशेष उत्पाद' : 'Featured Products'}</h2>
          </div>

          {/* Filter Tabs (Capsules) */}
          <div className="flex gap-1.5 bg-white border border-black/5 p-1 rounded-full shadow-xs max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'new', label: t('home.newArrivals') },
              { id: 'best', label: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'बेस्ट सेलर्स' : 'Best Sellers' },
              { id: 'trending', label: t('home.trending') }
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
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कम स्टॉक' : 'Low Stock'}
                  </span>
                )}
                {product.stockQuantity === 0 && (
                  <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'आउट ऑफ स्टॉक' : 'Out of Stock'}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 right-3 bg-black text-white text-[8px] font-bold px-2.5 py-1 rounded-full z-10">
                    {product.discountPercentage}% {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'छूट' : 'OFF'}
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
                      <ShoppingCart className="w-3.5 h-3.5" /> {t('prod.addToCart')}
                    </button>
                  ) : (
                    <button
                      suppressHydrationWarning
                      disabled
                      className="w-full bg-black/5 border border-black/5 text-black/30 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-full cursor-not-allowed"
                    >
                      {t('prod.outOfStock')}
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
              {t('prod.pincode.title')}
            </h3>
            <p className="text-xs text-black/60 font-light max-w-md mx-auto leading-relaxed">
              {t('home. JharkhandDepot.desc')}
            </p>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              suppressHydrationWarning
              type="text"
              maxLength={6}
              placeholder={t('prod.pincode.placeholder')}
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
              {t('prod.pincode.check')}
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
                      <p className="text-xs font-extrabold uppercase tracking-wider">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सेवा योग्य गंतव्य' : 'Serviceable Destination'}</p>
                      <p className="text-[11px] opacity-90 mt-1">
                        {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'शिपिंग मार्ग' : 'Shipping Route'}: Dhanbad &rarr; {pincodeStatus.state}
                      </p>
                      <p className="text-[11px] font-bold mt-1">
                        {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अनुमानित पारगमन समय' : 'Estimated Transit Time'}: {pincodeStatus.days} {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कार्य दिवस' : 'Working Days'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-700" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'असेवा योग्य क्षेत्र' : 'Unserviceable Area'}</p>
                      <p className="text-[11px] opacity-90 mt-1">
                        {pincodeStatus.error || (t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'इस स्थान पर डिलीवरी उपलब्ध नहीं है।' : 'Delivery not available to this location.')}
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
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'समीक्षाएं' : 'Reviews'}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सत्यापित एथलीट अनुभव' : 'Verified Athlete Experiences'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Dr. Vivek Sengupta',
              city: 'Jamshedpur',
              rating: 5,
              title: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'रिकवरी के लिए बेस्ट स्लाइड्स' : 'Best slides for recovery',
              quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एक सर्जन के रूप में, मैं घंटों खड़ा रहता हूँ। एडिडास एडिलेट कम्फर्ट स्लाइड्स बहुत बेहतरीन हैं। ईवीए फोम बिल्कुल बादलों पर चलने जैसा महसूस होता है।' : 'As a surgeon, I stand for hours. The Adidas Adilette Comfort Slides are a game changer. The EVA foam feels exactly like walking on clouds, and the arch support is perfect. Incredible service!'
            },
            {
              name: 'Anjali Sharma',
              city: 'Ranchi',
              rating: 5,
              title: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'उल्लेखनीय रनिंग सपोर्ट' : 'Remarkable running support',
              quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मेरे नाइके एयर ज़ूम पेगासस रनिंग जूते सिर्फ २ दिनों में आ गए। ऊर्जा वापसी किसी भी सामान्य स्पोर्ट्स ब्रांड से अलग है।' : 'My Nike Air Zoom Pegasus running shoes arrived in just 2 days. The energy bounce-back is unlike any standard sports brand. Understated design, pure premium material. Recommend 100%.'
            },
            {
              name: 'Kabir Verma',
              city: 'Dhanbad',
              rating: 5,
              title: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'शीर्ष ग्राहक सेवा और जीएसटी बिलिंग' : 'Top customer service & GST billing',
              quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मैंने अपने कॉर्पोरेट क्लब के लिए जूते खरीदे। चेकआउट ने एक पारदर्शी जीएसटी विवरण की गणना की, एक साफ चालान तैयार किया, और २४ घंटों के भीतर डिलीवरी की।' : 'I purchased footwear for my corporate club. The checkout computed a transparent GST breakdown, generated a clean commercial invoice, and processed standard delivery within 24 hours. A first-rate distributor.'
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
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold block">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'क्लब में शामिल हों' : 'Join the Club'}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase max-w-xl mx-auto leading-tight">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हमारे समाचार और अभियानों की सदस्यता लें' : 'Subscribe to our News & Campaigns'}
          </h2>
          <p className="text-xs text-black/60 font-light max-w-md mx-auto leading-relaxed">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'इन्फिनिटी ट्रेडर्स से उत्पाद लॉन्च, कूपन प्रचार और सक्रिय-रिकवरी युक्तियों पर सूचना प्राप्त करने के लिए अपना ईमेल पंजीकृत करें।' : 'Register your email to receive notice on product launches, coupon promotions, and active-recovery tips from Infinity Traders.'}
          </p>

          {newsletterSubscribed ? (
            <div className="max-w-md mx-auto bg-teal-500/5 border border-teal-500/10 p-4 rounded-xl flex items-center justify-between text-left text-teal-800">
              <span className="text-[10px] font-extrabold tracking-wider uppercase">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'धन्यवाद! आपने सफलतापूर्वक सदस्यता ले ली है।' : 'Thank you! You have subscribed successfully.'}</span>
              <CheckCircle className="w-5 h-5 text-teal-700" />
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                suppressHydrationWarning
                type="email"
                required
                placeholder={t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अपना ईमेल पता दर्ज करें' : 'Enter your email address'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 border border-black/10 hover:border-black/25 focus:border-black rounded-full px-5 py-3 text-xs outline-none bg-[#fdfdfd] transition-all"
              />
              <button
                suppressHydrationWarning
                type="submit"
                className="bg-black hover:bg-transparent text-white hover:text-black border border-black py-3 px-6 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all flex items-center justify-center gap-1.5"
              >
                {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सदस्यता लें' : 'Subscribe'} <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </motion.section>

      {/* 10. FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-black/5 pt-12 text-center text-xs text-black/45 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left pb-8 border-b border-black/5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-black">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'इन्फिनिटी ट्रेडर्स के बारे में' : 'About Infinity Traders'}</h4>
            <p className="text-xs font-light text-black/75 leading-relaxed max-w-xs">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'धनबाद, झारखंड में स्थित, इन्फिनिटी ट्रेडर्स एक आधिकारिक मल्टी-ब्रांड वितरक है जो प्रीमियम जूतों, स्लाइड्स, परिधान और रनिंग गियर में विशेषज्ञता रखता है।' : 'Based in Dhanbad, Jharkhand, Infinity Traders is an official multi-brand distributor specializing in premium, biomechanically-sound footwear, slides, apparel, and running gear.'}
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-black">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'संपर्क और सहायता' : 'Contact & Support'}</h4>
            <p className="text-xs font-light text-black/75 leading-relaxed">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मुख्यालय: बैंक मोड़, धनबाद, झारखंड - ८२६००१' : 'HQ: Bank More, Dhanbad, Jharkhand - 826001'}<br />
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'ईमेल' : 'Email'}: info@infinitytraders.com<br />
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'फ़ोन' : 'Phone'}: +91 99999 99999
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-black">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अनुपालन' : 'Compliances'}</h4>
            <p className="text-xs font-light text-black/75 leading-relaxed">
              GSTIN: 20ABCDE1234F1Z5<br />
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एचएसएन कोड जूते' : 'HSN Code Footwear'}: Chapter 64<br />
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'भारतीय कर चालान अनुपालन (चेकआउट पर सीजीएसटी/एसजीएसटी/आईजीएसटी विवरण)' : 'Indian Tax Invoice Compliant (CGST/SGST/IGST breakdown at checkout)'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-black/35 text-[9px] tracking-widest uppercase">
          <span>&copy; {new Date().getFullYear()} Infinity Traders. {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सर्वाधिकार सुरक्षित।' : 'All Rights Reserved.'}</span>
          <span>{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'भारत में डिज़ाइन और निर्मित' : 'Designed & Engineered in India'}</span>
        </div>
      </footer>
    </div>
  );
}
