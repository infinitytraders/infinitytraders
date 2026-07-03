'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ShoppingCart, Star, CheckCircle, ShieldAlert, Send, ChevronLeft, ChevronRight, MapPin, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { subscribeNewsletterAction } from '@/app/actions';

interface HomeClientProps {
  initialProducts: Product[];
}

const ALL_BRANDS = ['Nike', 'Adidas', 'Puma', 'Skechers', 'Reebok', 'Under Armour', 'Jordan', 'Fila', 'Asics'];

const BRAND_LOGO_MAPPING: Record<string, string> = {
  'Adidas': '/brands-logos/brand-1.svg',
  'Nike': '/brands-logos/brand-2.svg',
  'Puma': '/brands-logos/brand-3.svg',
  'Skechers': '/brands-logos/brand-4.svg',
  'Reebok': '/brands-logos/brand-5.svg',
  'Under Armour': '/brands-logos/brand-6.svg',
  'Jordan': '/brands-logos/brand-7.svg',
  'Fila': '/brands-logos/brand-8.svg',
  'Asics': '/brands-logos/brand-9.svg'
};

interface RecommendationProduct {
  name: string;
  brand: string;
  price: string;
  image: string;
  link: string;
  isReal: boolean;
}

interface QuestionConfig {
  title: string;
  question: string;
  options: string[];
  recommendations: Record<string, RecommendationProduct[]>;
}

const RECOMMENDATION_CONFIGS: Record<string, QuestionConfig> = {
  'running-shoes': {
    title: 'Running Shoes Matcher',
    question: 'What is your daily running range?',
    options: ['1500m to 3km', '3km to 5km', '5km to 10km', 'Super running shoes'],
    recommendations: {
      '1500m to 3km': [
        {
          name: 'Nike Air Zoom Pegasus Running Shoe',
          brand: 'Nike',
          price: '₹9,999',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          link: '/product/prod_1',
          isReal: true
        },
        {
          name: 'Reebok Floatride Energy 5',
          brand: 'Reebok',
          price: '₹7,999',
          image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80',
          link: '/shop?category=Footwear',
          isReal: false
        }
      ],
      '3km to 5km': [
        {
          name: 'Nike Air Zoom Pegasus Running Shoe',
          brand: 'Nike',
          price: '₹9,999',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          link: '/product/prod_1',
          isReal: true
        },
        {
          name: 'Adidas Ultraboost Light',
          brand: 'Adidas',
          price: '₹14,999',
          image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
          link: '/shop?category=Footwear',
          isReal: false
        }
      ],
      '5km to 10km': [
        {
          name: 'Nike Air Zoom Pegasus Running Shoe',
          brand: 'Nike',
          price: '₹9,999',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          link: '/product/prod_1',
          isReal: true
        },
        {
          name: 'Asics Gel-Kayano 30 Premium',
          brand: 'Asics',
          price: '₹13,999',
          image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80',
          link: '/shop?category=Footwear',
          isReal: false
        }
      ],
      'Super running shoes': [
        {
          name: 'Nike Vaporfly 3 Racing Shoe',
          brand: 'Nike',
          price: '₹19,999',
          image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
          link: '/shop?category=Footwear',
          isReal: false
        },
        {
          name: 'Adidas Adizero Adios Pro 3',
          brand: 'Adidas',
          price: '₹18,999',
          image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
          link: '/shop?category=Footwear',
          isReal: false
        }
      ]
    }
  },
  'casuals': {
    title: 'Casual Shoes Matcher',
    question: 'Select your preferred brand:',
    options: ALL_BRANDS,
    recommendations: {}
  },
  'daily-wear': {
    title: 'Daily Wear Matcher',
    question: 'Select your preferred brand:',
    options: ALL_BRANDS,
    recommendations: {}
  },
  'sliders': {
    title: 'Sliders Matcher',
    question: 'Select your preferred brand:',
    options: ALL_BRANDS,
    recommendations: {}
  },
  't-shirts': {
    title: 'T-Shirts Matcher',
    question: 'Which collar style do you prefer?',
    options: ['Round Neck', 'Polo'],
    recommendations: {
      'Round Neck': [
        {
          name: 'GO RUN Breathable Training Tee',
          brand: 'Skechers',
          price: '₹1,699',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
          link: '/product/prod_4',
          isReal: true
        }
      ],
      'Polo': [
        {
          name: 'Adidas Club Tennis Polo',
          brand: 'Adidas',
          price: '₹2,499',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
          link: '/shop?category=Apparel',
          isReal: false
        }
      ]
    }
  },
  'halfpants': {
    title: 'Halfpants Matcher',
    question: 'Select your preferred brand:',
    options: ALL_BRANDS,
    recommendations: {}
  },
  'lowers': {
    title: 'Lowers Matcher',
    question: 'Select your preferred brand:',
    options: ALL_BRANDS,
    recommendations: {}
  },
  'sando': {
    title: 'Sando Matcher',
    question: 'Select your preferred brand:',
    options: ALL_BRANDS,
    recommendations: {}
  }
};

function getRecommendationsForBrand(category: string, brand: string): RecommendationProduct[] {
  if (category === 'running-shoes') {
    return RECOMMENDATION_CONFIGS['running-shoes'].recommendations[brand] || [];
  }
  if (category === 't-shirts') {
    return RECOMMENDATION_CONFIGS['t-shirts'].recommendations[brand] || [];
  }

  // Footwear categories: casuals, daily-wear, sliders
  if (category === 'casuals' || category === 'daily-wear' || category === 'sliders') {
    if (brand === 'Adidas') {
      return [{
        name: 'Adilette Comfort Slides',
        brand: 'Adidas',
        price: '₹1,999',
        image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
        link: '/product/prod_2',
        isReal: true
      }];
    }
    if (brand === 'Nike') {
      return [{
        name: 'Nike Air Zoom Pegasus Running Shoe',
        brand: 'Nike',
        price: '₹9,999',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        link: '/product/prod_1',
        isReal: true
      }];
    }
    if (brand === 'Puma') {
      return [{
        name: 'Puma Leadcat Slides',
        brand: 'Puma',
        price: '₹1,799',
        image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
        link: '/shop?category=Footwear&brand=Puma',
        isReal: false
      }];
    }
    if (brand === 'Skechers') {
      return [{
        name: 'Skechers Uno Stand On Air',
        brand: 'Skechers',
        price: '₹6,499',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        link: '/shop?category=Footwear&brand=Skechers',
        isReal: false
      }];
    }
    if (brand === 'Reebok') {
      return [{
        name: 'Reebok Floatride Energy Trainer',
        brand: 'Reebok',
        price: '₹7,999',
        image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80',
        link: '/shop?category=Footwear&brand=Reebok',
        isReal: false
      }];
    }
    return [{
      name: `${brand} Premium Athletics Footwear`,
      brand: brand,
      price: '₹8,999',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
      link: `/shop?category=Footwear&brand=${encodeURIComponent(brand)}`,
      isReal: false
    }];
  }

  // Apparel categories: halfpants, lowers, sando
  if (category === 'halfpants') {
    if (brand === 'Nike') {
      return [{
        name: 'Nike Dri-FIT Flex Training Shorts',
        brand: 'Nike',
        price: '₹1,499',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
        link: '/product/prod_6',
        isReal: true
      }];
    }
    return [{
      name: `${brand} Active Training Shorts`,
      brand: brand,
      price: '₹1,899',
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
      link: `/shop?category=Apparel&brand=${encodeURIComponent(brand)}`,
      isReal: false
    }];
  }

  if (category === 'lowers') {
    if (brand === 'Puma') {
      return [{
        name: 'Puma Active Tech Fleece Trousers',
        brand: 'Puma',
        price: '₹2,799',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
        link: '/product/prod_3',
        isReal: true
      }];
    }
    return [{
      name: `${brand} Warm Tech Training Pants`,
      brand: brand,
      price: '₹2,999',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
      link: `/shop?category=Apparel&brand=${encodeURIComponent(brand)}`,
      isReal: false
    }];
  }

  if (category === 'sando') {
    if (brand === 'Adidas') {
      return [{
        name: 'Adidas Primeknit Sando Vest',
        brand: 'Adidas',
        price: '₹4,499',
        image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=600&q=80',
        link: '/product/prod_7',
        isReal: true
      }];
    }
    return [{
      name: `${brand} Breathable Active Tank`,
      brand: brand,
      price: '₹1,599',
      image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=600&q=80',
      link: `/shop?category=Apparel&brand=${encodeURIComponent(brand)}`,
      isReal: false
    }];
  }

  return [];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const { addToCart, pincode, setPincode, pincodeStatus, checkPincodeServiceability, addCompleteGearCombo } = useCart();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'new' | 'best' | 'trending'>('new');
  const [checkingPin, setCheckingPin] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFirstName, setNewsletterFirstName] = useState('');
  const [newsletterLastName, setNewsletterLastName] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [recommendationModal, setRecommendationModal] = useState<{
    isOpen: boolean;
    category: string;
    step: 'question' | 'loading' | 'results';
    selectedOption: string | null;
  }>({
    isOpen: false,
    category: '',
    step: 'question',
    selectedOption: null
  });

  const handleCategoryClick = (id: string) => {
    setRecommendationModal({
      isOpen: true,
      category: id,
      step: 'question',
      selectedOption: null
    });
  };

  const [activeIndex, setActiveIndex] = useState(1); // Default to clothes (index 1)
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = target.scrollLeft / (target.scrollWidth - target.clientWidth);
    setScrollProgress(isNaN(progress) ? 0 : progress);
  };

  const handlePrevReview = () => {
    if (reviewsRef.current) {
      const cardWidth = reviewsRef.current.firstElementChild?.clientWidth || 300;
      reviewsRef.current.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    }
  };

  const handleNextReview = () => {
    if (reviewsRef.current) {
      const cardWidth = reviewsRef.current.firstElementChild?.clientWidth || 300;
      reviewsRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await subscribeNewsletterAction(
        newsletterFirstName,
        newsletterLastName,
        newsletterEmail
      );
      if (res.success) {
        setNewsletterSubscribed(true);
        setNewsletterEmail('');
        setNewsletterFirstName('');
        setNewsletterLastName('');
      } else {
        alert(res.error || 'Failed to subscribe.');
      }
    } catch (err) {
      alert('Subscription failed. Please try again.');
    }
  };

  return (
    <div className="space-y-24 pb-0 bg-[#f4f3ef]">
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
                suppressHydrationWarning={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. BRAND LOGOS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10 text-center"
      >
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-black/50 font-bold block">
            {t('home.exploreBrands')}
          </span>
        </div>

        <div className="w-full mix-blend-multiply">
          <div className="relative w-full overflow-hidden mask-gradient py-4">
            <div className="flex animate-marquee gap-16 sm:gap-24 items-center whitespace-nowrap">
              {[
                { name: 'Adidas', logo: '/brands-logos/brand-1.svg' },
                { name: 'Nike', logo: '/brands-logos/brand-2.svg' },
                { name: 'Puma', logo: '/brands-logos/brand-3.svg' },
                { name: 'Skechers', logo: '/brands-logos/brand-4.svg' },
                { name: 'Reebok', logo: '/brands-logos/brand-5.svg' },
                { name: 'Under Armour', logo: '/brands-logos/brand-6.svg' },
                { name: 'Jordan', logo: '/brands-logos/brand-7.svg' },
                { name: 'Fila', logo: '/brands-logos/brand-8.svg' },
                { name: 'Asics', logo: '/brands-logos/brand-9.svg' },
                // Duplicate once for seamless infinite scrolling loop
                { name: 'Adidas', logo: '/brands-logos/brand-1.svg' },
                { name: 'Nike', logo: '/brands-logos/brand-2.svg' },
                { name: 'Puma', logo: '/brands-logos/brand-3.svg' },
                { name: 'Skechers', logo: '/brands-logos/brand-4.svg' },
                { name: 'Reebok', logo: '/brands-logos/brand-5.svg' },
                { name: 'Under Armour', logo: '/brands-logos/brand-6.svg' },
                { name: 'Jordan', logo: '/brands-logos/brand-7.svg' },
                { name: 'Fila', logo: '/brands-logos/brand-8.svg' },
                { name: 'Asics', logo: '/brands-logos/brand-9.svg' },
              ].map((brand, idx) => (
                <Link
                  key={`${brand.name}-${idx}`}
                  href={`/shop?brand=${brand.name}`}
                  className="w-[160px] sm:w-[200px] h-16 sm:h-22 flex items-center justify-center hover:scale-110 transition-all duration-300 group shrink-0"
                >
                  <img
                    src={`${brand.logo}?v=3`}
                    alt={`${brand.name} logo`}
                    className="max-w-full max-h-full object-contain mix-blend-multiply opacity-75 group-hover:opacity-100 transition-all duration-300"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* INFINITE PERFORMANCE BANNER SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden group shadow-xs">
          {/* Background image with hover zoom effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: "url('/image-runner.png')" }}
          />
          {/* Dark Overlay for text legibility */}
          <div className="absolute inset-0 bg-black/15 transition-opacity duration-300 group-hover:opacity-20" />
          
          {/* Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-wide uppercase select-none drop-shadow-md">
              Infinite Performance
            </h2>
          </div>
        </div>
      </motion.section>

      {/* 4. PROMOTIONAL METRIC BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
          <div className="space-y-1">
            <Counter value={100} suffix="%" />
            <span className="text-xs sm:text-sm text-black/60 tracking-normal font-semibold mt-1 block">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'असली उत्पाद' : 'Genuine Products'}
            </span>
          </div>
          <div className="space-y-1">
            <Counter value={5} suffix="K+" />
            <span className="text-xs sm:text-sm text-black/60 tracking-normal font-semibold mt-1 block">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'खुश ग्राहक' : 'Happy Customers'}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-black block text-4xl sm:text-5xl font-extrabold tracking-wide">PAN</span>
            <span className="text-xs sm:text-sm text-black/60 tracking-normal font-semibold mt-1 block">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'भारत' : 'India'}
            </span>
          </div>
          <div className="space-y-1">
            <Counter value={7} suffix=" D" />
            <span className="text-xs sm:text-sm text-black/60 tracking-normal font-semibold mt-1 block">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'डिलिवरी' : 'Delivery'}
            </span>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
          {[
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'रनिंग शूज़ (Running Shoes)' : 'Running Shoes',
              img: '/categories/Running shoes.png',
              link: '/shop?category=Footwear&q=running',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'प्रदर्शन दौड़ना' : 'Performance running'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एयर सागा (Air Saga)' : 'Air Saga',
              img: '/categories/Air Saga.png',
              link: '/shop?category=Footwear&q=saga',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'प्रीमियम दौड़ना' : 'Premium running'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'स्नीकर्स (Sneakers)' : 'Sneakers',
              img: '/categories/Sneakers.png',
              link: '/shop?category=Footwear&q=sneaker',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'स्ट्रीट लाइफस्टाइल' : 'Street lifestyle'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लोअर्स (Lowers)' : 'Lowers',
              img: '/categories/Lowers.png',
              link: '/shop?category=Apparel&q=lower',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सक्रिय ट्रैकवियर' : 'Active trackwear'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'टी-शर्ट (T-shirts)' : 'T-shirts',
              img: '/categories/T-shirts.png',
              link: '/shop?category=Apparel&q=shirt',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एथलेटिक एक्टिववियर' : 'Athletic activewear'
            },
            {
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'रनिंग किट (Running Kit)' : 'Running Kit',
              img: '/categories/running kit.png',
              link: '/shop?category=Accessories&q=kit',
              desc: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'आवश्यक सहायक उपकरण' : 'Essential accessories'
            }
          ].map((cat) => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group relative h-56 sm:h-96 rounded-2xl overflow-hidden border border-black/5 flex flex-col justify-end p-4 sm:p-6 bg-white shadow-xs"
            >
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="z-10 space-y-1">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/60 font-semibold">
                  {cat.desc}
                </span>
                <h3 className="text-xs sm:text-base font-extrabold tracking-wider text-white uppercase group-hover:underline">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* 5.5 WHAT WE SELL SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8"
      >
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'उत्पाद श्रेणियां' : 'Our Range'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight uppercase">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हम क्या बेचते हैं' : 'What We Sell'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            {
              id: 'running-shoes',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'रनिंग शूज़' : 'Running shoes',
              img: '/what-we-sell/running-shoes.png'
            },
            {
              id: 'casuals',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कैजुअल जूते' : 'Casuals',
              img: '/what-we-sell/Casuals.png'
            },
            {
              id: 'daily-wear',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'डेली वियर' : 'Daily wear',
              img: '/what-we-sell/Daily-ware.png'
            },
            {
              id: 'sliders',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'स्लाइडर्स' : 'Sliders',
              img: '/what-we-sell/sliders.png'
            },
            {
              id: 't-shirts',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'टी-शर्ट' : 'T Shirts',
              img: '/what-we-sell/t-shirts.png'
            },
            {
              id: 'halfpants',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हाफ पैंट' : 'Halfpants',
              img: '/what-we-sell/halfpants.png'
            },
            {
              id: 'lowers',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लोअर्स' : 'Lowers',
              img: '/what-we-sell/lowers.png'
            },
            {
              id: 'sando',
              name: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सैंडो' : 'Sando',
              img: '/what-we-sell/sando.png'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleCategoryClick(item.id)}
              className="flex flex-col items-center justify-center p-2 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden mb-4">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-black/80 group-hover:text-black transition-colors text-center">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 6.5 COMPLETE GEAR BANNER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="w-full flex flex-col md:flex-row items-center gap-12 md:gap-6">
          
          {/* Left Column: Interactive Runner Diagram */}
          <div className="w-full md:w-[60%] lg:w-[65%] relative group mix-blend-multiply">
            <div className="relative w-full aspect-[3/2] select-none">
              {/* Main Runner Image */}
              <img 
                src="/runner.png" 
                alt="Premium Running Gear" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
              
              {/* Interactive SVG Lines and Dots */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                {/* T-shirt line */}
                <path 
                  d="M 12 16 C 24 16, 35 22, 46 34" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="0.15" 
                  strokeOpacity="0.35"
                />
                <circle cx="46" cy="34" r="0.45" fill="black" />

                {/* Lowers line */}
                <path 
                  d="M 9 51 C 18 51, 28 53, 39 55" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="0.15" 
                  strokeOpacity="0.35"
                />
                <circle cx="39" cy="55" r="0.45" fill="black" />

                {/* Running Shoes line */}
                <path 
                  d="M 83 66 C 80 66, 77 76, 76 88" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="0.15" 
                  strokeOpacity="0.35"
                />
                <circle cx="76" cy="88" r="0.45" fill="black" />
              </svg>

              {/* Interactive Hotspot Links */}
              {/* 1. T-shirts */}
              <Link 
                href="/shop?category=Apparel" 
                className="absolute top-[13.5%] left-[4.5%] text-[9px] sm:text-xs font-bold text-black uppercase tracking-wider hover:opacity-60 transition-opacity"
                title="Shop T-shirts"
              >
                T-shirts
              </Link>

              {/* 2. Lowers */}
              <Link 
                href="/shop?category=Apparel" 
                className="absolute top-[48.5%] left-[2.5%] text-[9px] sm:text-xs font-bold text-black uppercase tracking-wider hover:opacity-60 transition-opacity"
                title="Shop Lowers"
              >
                Lowers
              </Link>

              {/* 3. Running Shoes */}
              <Link 
                href="/shop?category=Footwear" 
                className="absolute top-[63.5%] left-[84%] text-[9px] sm:text-xs font-bold text-black uppercase tracking-wider hover:opacity-60 transition-opacity"
                title="Shop Running Shoes"
              >
                Running Shoes
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Typography */}
          <div className="w-full md:w-[40%] lg:w-[35%] flex items-center justify-start md:pl-8 lg:pl-16">
            <div className="space-y-4 max-w-sm">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-tight text-black uppercase">
                Get your<br />
                complete<br />
                gear for<br />
                infinite<br />
                experience
              </h2>
              <button
                onClick={() => {
                  const prod1 = initialProducts.find(p => p.id === 'prod_1');
                  const prod3 = initialProducts.find(p => p.id === 'prod_3');
                  const prod4 = initialProducts.find(p => p.id === 'prod_4');
                  if (prod1 && prod3 && prod4) {
                    addCompleteGearCombo(prod1, prod3, prod4);
                  }
                }}
                className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-black/45 hover:text-black transition-colors pt-2 group text-left"
              >
                View Combos
                <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </button>
            </div>
          </div>

        </div>
      </section>

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
                suppressHydrationWarning={true}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curated Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-8">
          {filteredProducts.map((product) => (
            <div
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
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-black/45 font-bold">
                    <span>{product.brand}</span>
                    <span className="hidden sm:inline">{product.category}</span>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="block text-xs sm:text-base font-extrabold text-black mt-1 hover:underline transition-all line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="hidden sm:block text-xs text-black/60 font-light line-clamp-2 mt-1.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-black/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-full">
                      <Star className="w-3.5 h-3.5 text-black fill-black" />
                      <span className="text-[10px] text-black font-extrabold">{product.averageRating}</span>
                      <span className="text-[9px] text-black/50">({product.reviewsCount})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-black">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-[8px] sm:text-[10px] text-black/40 line-through block font-medium">
                          ₹{product.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.stockQuantity > 0 ? (
                    <button
                      suppressHydrationWarning
                      onClick={() => addToCart(product, 1, product.sizes[0] || (product.category === 'Footwear' ? 8 : 'M'))}
                      className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-2 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-full transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> {t('prod.addToCart')}
                    </button>
                  ) : (
                    <button
                      suppressHydrationWarning
                      disabled
                      className="w-full bg-black/5 border border-black/5 text-black/30 py-2 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold rounded-full cursor-not-allowed"
                    >
                      {t('prod.outOfStock')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 7. PINCODE SERVICEABILITY CONTAINER */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-[#faf9f5] border border-black/[0.04] rounded-3xl p-10 sm:p-14 space-y-8 shadow-xs text-center">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-black/40 font-bold block">Shipping Depot</span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-black leading-tight uppercase">
              {t('prod.pincode.title')}
            </h3>
            <p className="text-xs sm:text-sm text-black/60 font-light max-w-md mx-auto leading-relaxed">
              {t('home. JharkhandDepot.desc')}
            </p>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              suppressHydrationWarning
              type="text"
              maxLength={6}
              placeholder={t('prod.pincode.placeholder')}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 border border-black/10 hover:border-black/20 focus:border-black rounded-full px-6 py-4 text-center tracking-widest text-sm font-semibold outline-none bg-white transition-all shadow-xs"
            />
            <button
              suppressHydrationWarning
              type="submit"
              disabled={checkingPin || pincode.length !== 6}
              className="bg-black hover:bg-[#1a1a1a] text-white py-4 px-8 text-xs uppercase tracking-widest font-bold disabled:opacity-50 disabled:pointer-events-none rounded-full transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 shadow-xs"
            >
              {checkingPin ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('prod.pincode.check')
              )}
            </button>
          </form>

          {pincodeStatus.checked && (
            <div className="max-w-lg mx-auto pt-2">
              <div
                className={`p-5 rounded-2xl border flex items-start gap-4 text-left transition-all ${
                  pincodeStatus.serviceable
                    ? 'bg-emerald-500/[0.03] border-emerald-500/10 text-emerald-950'
                    : 'bg-rose-500/[0.03] border-rose-500/10 text-rose-950'
                }`}
              >
                {pincodeStatus.serviceable ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सेवा योग्य गंतव्य' : 'Serviceable Destination'}</p>
                      <p className="text-xs text-emerald-950/70 mt-1 font-medium">
                        {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'शिपिंग मार्ग' : 'Shipping Route'}: Dhanbad &rarr; {pincodeStatus.state}
                      </p>
                      <p className="text-xs text-emerald-950 mt-1 font-bold">
                        {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अनुमानित पारगमन समय' : 'Estimated Transit Time'}: {pincodeStatus.days} {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'कार्य दिवस' : 'Working Days'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-rose-800">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'असेवा योग्य क्षेत्र' : 'Unserviceable Area'}</p>
                      <p className="text-xs text-rose-950/70 mt-1 font-medium">
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 overflow-hidden"
      >
        <div className="text-center">
          <h2 suppressHydrationWarning className="text-3xl sm:text-4xl font-light text-black tracking-tight uppercase">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? (
              <>हमारे ग्राहकों की <strong className="font-black text-black">समीक्षाएं</strong></>
            ) : (
              <>Reviews from <strong className="font-black text-black">customers</strong></>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Quote & Slider Controls */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-[120px] font-serif text-black/10 block leading-none -ml-2 -mb-8 select-none">“</span>
            <h3 suppressHydrationWarning className="text-[26px] font-semibold text-[#1a1a1a] tracking-tight leading-snug max-w-[240px]">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हमारे ग्राहक क्या कह रहे हैं' : 'What our customers are saying'}
            </h3>
            
            {/* Slider Controls */}
            <div className="flex items-center gap-3 pt-6 w-full max-w-[260px]">
              <button
                onClick={handlePrevReview}
                disabled={scrollProgress <= 0.02}
                className="text-black hover:text-black/70 disabled:opacity-30 disabled:pointer-events-none transition-all text-xl font-light"
                aria-label="Previous review"
                suppressHydrationWarning={true}
              >
                ←
              </button>
              
              {/* Progress Line */}
              <div className="h-[2px] bg-black/10 flex-1 relative rounded-full overflow-hidden">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-black rounded-full"
                  animate={{ 
                    width: `${15 + scrollProgress * 85}%` 
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <button
                onClick={handleNextReview}
                disabled={scrollProgress >= 0.98}
                className="text-black hover:text-black/70 disabled:opacity-30 disabled:pointer-events-none transition-all text-xl font-light"
                aria-label="Next review"
                suppressHydrationWarning={true}
              >
                →
              </button>
            </div>
          </div>

          {/* Right Column: Testimony Speech Bubble Swiper */}
          <div className="lg:col-span-8 overflow-hidden w-full relative">
            <div
              ref={reviewsRef}
              onScroll={handleScroll}
              className="flex gap-6 w-full overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                {
                  name: 'Dr. Vivek Sengupta',
                  city: 'Jamshedpur',
                  avatar: '/profile-icon men.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एक सर्जन के रूप में, मैं घंटों खड़ा रहता हूँ। एडिडास एडिलेट कम्फर्ट स्लाइड्स बहुत बेहतरीन हैं। ईवीए फोम बिल्कुल बादलों पर चलने जैसा महसूस होता है।' : 'As a surgeon, I stand for hours. The Adidas Adilette Comfort Slides are a game changer. The EVA foam feels exactly like walking on clouds, and the arch support is perfect. Incredible service!'
                },
                {
                  name: 'Anjali Sharma',
                  city: 'Ranchi',
                  avatar: '/profile-icon women.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मेरे नाइके एयर ज़ूम पेगासस रनिंग जूते सिर्फ २ दिनों में आ गए। ऊर्जा वापसी किसी भी सामान्य स्पोर्ट्स ब्रांड से अलग है।' : 'My Nike Air Zoom Pegasus running shoes arrived in just 2 days. The energy bounce-back is unlike any standard sports brand. Understated design, pure premium material. Recommend 100%.'
                },
                {
                  name: 'Kabir Verma',
                  city: 'Dhanbad',
                  avatar: '/profile-icon men.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मैंने अपने कॉर्पोरेट क्लब के लिए जूते खरीदे। चेकआउट ने एक पारदर्शी जीएसटी विवरण की गणना की, एक साफ चालान तैयार किया, और २४ घंटों के भीतर डिलीवरी की।' : 'I purchased footwear for my corporate club. The checkout computed a transparent GST breakdown, generated a clean commercial invoice, and processed standard delivery within 24 hours. A first-rate distributor.'
                },
                {
                  name: 'Jasmeet Singh',
                  city: 'Chandigarh',
                  avatar: '/profile-icon men.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'प्यूमा नाइट्रो रनिंग शूज अविश्वसनीय रूप से हल्के और तेज हैं। गीली सड़कों पर भी ग्रिप शानदार है। अगले ही दिन डिलीवरी हो गई।' : 'The Puma Nitro running shoes are incredibly lightweight and fast. The grip is outstanding on wet roads. Ordered in the morning and it was delivered the next day. Exceptional service!'
                },
                {
                  name: 'Priyanka Sen',
                  city: 'Kolkata',
                  avatar: '/profile-icon women.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'मेरे दैनिक टहलने के लिए स्केचर्स मैक्स कुशनिंग जूते सबसे अच्छे हैं। आराम का स्तर बेजोड़ है। त्वरित ग्राहक सेवा के साथ सत्यापित उत्पाद।' : 'Skechers Max Cushioning shoes are the absolute best for my daily walks. The level of comfort is unmatched. Verified product with quick customer service. Will buy again soon!'
                },
                {
                  name: 'Rohan Malhotra',
                  city: 'New Delhi',
                  avatar: '/profile-icon men.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'आधिकारिक स्पोर्ट्स गियर की अद्भुत श्रृंखला। आकार गाइड बहुत सटीक हैं और मुझे सही फिट चुनने में मदद की। भारत में अब तक का सबसे अच्छा ऑनलाइन शॉपिंग अनुभव।' : 'Incredible range of official sports gear. The sizing guides are very accurate and helped me pick the perfect fit. Best online shopping experience so far in India.'
                },
                {
                  name: 'Aarav Mehta',
                  city: 'Mumbai',
                  avatar: '/profile-icon men.png',
                  quote: t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'प्रीमियम पैकेजिंग और प्रामाणिक ब्रांड प्रमाणपत्र से अत्यधिक प्रभावित। स्लाइड्स बेहद आरामदायक हैं। सक्रिय स्पोर्ट्सवियर के लिए एक शीर्ष पायदान का स्टोर।' : 'Highly impressed with the premium packaging and authentic brand certificate. The slides are extremely comfortable. A top-tier store for active sportswear.'
                }
              ].map((rev, i) => (
                <div 
                  key={i} 
                  className="w-full md:w-[calc(50%-12px)] flex-shrink-0 space-y-6 select-none snap-start"
                >
                  {/* Speech Bubble Card */}
                  <div className="bg-white border border-black/[0.03] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)] relative">
                    <p className="text-[14px] text-black/85 font-medium leading-relaxed">
                      "{rev.quote}"
                    </p>
                    
                    {/* Stars */}
                    <div className="flex gap-0.5 mt-6">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 text-[#4a4a4a] fill-[#4a4a4a]" />
                      ))}
                    </div>

                    {/* Speech Bubble Pointer */}
                    <div className="absolute -bottom-2.5 left-10 w-5 h-5 bg-white border-r border-b border-black/[0.03] rotate-45" />
                  </div>

                  {/* Customer Identity below card */}
                  <div className="flex items-center gap-3 pl-6 pt-2">
                    <img 
                      src={rev.avatar} 
                      alt={rev.name}
                      className="w-11 h-11 rounded-full object-cover border border-black/5"
                    />
                    <div>
                      <h4 className="text-[13px] font-bold text-black leading-tight">{rev.name}</h4>
                      <p className="text-[11px] text-black/50 font-semibold mt-0.5">{rev.city}, India</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 8. RECOMMENDATION MODAL POPUP */}
      <AnimatePresence>
        {recommendationModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#f4f3ef] border border-black/5 rounded-3xl p-6 sm:p-10 max-w-xl w-full relative shadow-xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setRecommendationModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-black/60 hover:text-black transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {(() => {
                const config = RECOMMENDATION_CONFIGS[recommendationModal.category];
                if (!config) return null;

                if (recommendationModal.step === 'question') {
                  return (
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-black/50 font-bold block">
                          Interactive Guide
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                          {config.title}
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-black">
                        {config.question}
                      </p>
                      {(() => {
                        const isBrandQuestion = config.options.every(opt => BRAND_LOGO_MAPPING[opt] !== undefined);
                        return (
                          <div className={isBrandQuestion ? "grid grid-cols-3 gap-3" : "grid grid-cols-1 gap-2.5"}>
                            {config.options.map((opt) => {
                              const logoSrc = BRAND_LOGO_MAPPING[opt];
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setRecommendationModal(prev => ({ ...prev, selectedOption: opt, step: 'loading' }));
                                    setTimeout(() => {
                                      setRecommendationModal(prev => ({ ...prev, step: 'results' }));
                                    }, 1200);
                                  }}
                                  className={`w-full flex items-center justify-center rounded-2xl border border-black/5 bg-white/60 hover:bg-white transition-all duration-300 hover:border-black/15 shadow-2xs hover:shadow-xs active:scale-[0.98] ${
                                    isBrandQuestion ? 'h-20 sm:h-24 p-3 sm:p-5' : 'p-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-black'
                                  }`}
                                >
                                  {isBrandQuestion && logoSrc ? (
                                    <img 
                                      src={logoSrc} 
                                      alt={opt} 
                                      className="max-w-full max-h-full object-contain mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity" 
                                    />
                                  ) : (
                                    opt
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  );
                }

                if (recommendationModal.step === 'loading') {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                      <p className="text-xs uppercase tracking-widest font-extrabold text-black/60">
                        Finding your perfect match...
                      </p>
                    </div>
                  );
                }

                if (recommendationModal.step === 'results') {
                  const products = getRecommendationsForBrand(recommendationModal.category, recommendationModal.selectedOption || '');
                  return (
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-black/50 font-bold block">
                          Recommended For You
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight leading-tight">
                          Best Fits for: {recommendationModal.selectedOption}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.map((p, idx) => (
                          <Link
                            key={idx}
                            href={p.link}
                            onClick={() => setRecommendationModal(prev => ({ ...prev, isOpen: false }))}
                            className="flex flex-col p-4 bg-white border border-black/[0.04] rounded-2xl group hover:border-black/10 transition-colors shadow-2xs"
                          >
                            <div className="w-full aspect-square flex items-center justify-center overflow-hidden mb-3 bg-[#faf9f5] rounded-xl p-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="space-y-1 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-black/45 font-bold block">
                                  {p.brand}
                                </span>
                                <h4 className="text-xs font-bold text-black uppercase tracking-tight line-clamp-2 group-hover:text-black/75 transition-colors">
                                  {p.name}
                                </h4>
                              </div>
                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-xs font-black text-black">
                                  {p.price}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-black/45 group-hover:text-black transition-colors flex items-center gap-1">
                                  {p.isReal ? 'Buy Now' : 'Explore'} &rarr;
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button
                          onClick={() => setRecommendationModal(prev => ({ ...prev, step: 'question', selectedOption: null }))}
                          className="flex-1 text-center py-3 rounded-xl border border-black/10 hover:border-black text-[10px] font-extrabold uppercase tracking-widest text-black transition-colors bg-transparent active:scale-[0.99]"
                        >
                          Start Over
                        </button>
                        <button
                          onClick={() => setRecommendationModal(prev => ({ ...prev, isOpen: false }))}
                          className="flex-1 text-center py-3 rounded-xl bg-black text-white hover:bg-black/90 text-[10px] font-extrabold uppercase tracking-widest transition-colors active:scale-[0.99]"
                        >
                          Close Guide
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

interface CounterProps {
  value: number;
  duration?: number;
  suffix?: string;
}

function Counter({ value, duration = 1.5, suffix = "" }: CounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: false, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const node = nodeRef.current;
      if (!node) return;

      const controls = animate(0, value, {
        duration: duration,
        ease: [0.16, 1, 0.3, 1], // Clean, premium ease out curve
        onUpdate(latestValue) {
          node.textContent = Math.round(latestValue).toString() + suffix;
        },
      });

      return () => controls.stop();
    } else {
      const node = nodeRef.current;
      if (node) {
        node.textContent = "0" + suffix;
      }
    }
  }, [isInView, value, duration, suffix]);

  return <span ref={nodeRef} className="text-black block text-4xl sm:text-5xl font-extrabold tracking-wide">0{suffix}</span>;
}
