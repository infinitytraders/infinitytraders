'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

type Translations = Record<string, string>;

const dictionary: Record<Language, Translations> = {
  en: {
    // Nav / Global
    'nav.shop': 'Shop Catalog',
    'nav.account': 'My Account',
    'nav.admin': 'Staff Admin',
    'nav.cart': 'Shopping Bag',
    'nav.home': 'Home',
    'nav.language': 'Language / भाषा',

    // Home
    'home.hero.title': 'INFINITY ATHLETICS',
    'home.hero.subtitle': 'PREMIUM SPORTS FOOTWEAR FOR PEAK PERFORMANCE',
    'home.hero.cta': 'Shop the Collection',
    'home.brands.title': 'Distributing Certified Global Brands',
    'home.newArrivals': 'New Arrivals',
    'home.trending': 'Trending Collection',
    'home.whyTraders': 'Why Infinity Traders?',
    'home. JharkhandDepot': 'Dhanbad Logistics Hub',
    'home. JharkhandDepot.desc': 'Express tax-compliant shipping to all Indian states directly from Dhanbad, Jharkhand.',
    'home.verified': '100% Certified Footwear',
    'home.verified.desc': 'Authentic multi-brand slippers, apparel, and running shoes sourced directly from authorized manufacturers.',

    // Shop Catalog
    'shop.filters': 'Filters',
    'shop.sort.title': 'Sort Articles',
    'shop.sort.lowHigh': 'Price: Low to High',
    'shop.sort.highLow': 'Price: High to Low',
    'shop.sort.discount': 'Discount: Highest First',
    'shop.filter.brand': 'Select Brand',
    'shop.filter.category': 'Category',
    'shop.filter.color': 'Color',
    'shop.filter.material': 'Material',
    'shop.filter.size': 'UK Size',
    'shop.filter.price': 'Max Price (₹)',
    'shop.clear': 'Clear Filters',
    'shop.noProducts': 'No articles match your selection.',

    // Product Detail
    'prod.specification': 'Specifications',
    'prod.shipping': 'Shipping & Returns',
    'prod.sizing': 'Sizing Guide',
    'prod.pincode.title': 'Verify Delivery Pincode',
    'prod.pincode.placeholder': 'Enter 6-digit Pincode',
    'prod.pincode.check': 'Check Serviceability',
    'prod.pincode.serviceable': 'Estimated delivery in',
    'prod.pincode.unserviceable': 'Delivery currently unavailable to this code.',
    'prod.addToCart': 'Add to Shopping Bag',
    'prod.outOfStock': 'Out of Stock Size',
    'prod.wishlist.add': 'Add to Wishlist',
    'prod.wishlist.remove': 'Remove from Wishlist',
    'prod.specs.sku': 'SKU Code',
    'prod.specs.color': 'Color Way',
    'prod.specs.material': 'Material Composition',
    'prod.specs.width': 'Foot Width Fit',

    // Cart Drawer
    'cart.title': 'Your Shopping Bag',
    'cart.empty': 'Your bag is empty.',
    'cart.checkout': 'Proceed to Checkout',
    'cart.subtotal': 'Subtotal',
    'cart.freeShipping': 'You qualify for FREE shipping!',
    'cart.shippingNotice': 'Add items worth ₹1,499+ for free delivery.',

    // Checkout
    'checkout.title': 'Secure Checkout Gateway',
    'checkout.shipping': 'Shipping Address Details',
    'checkout.name': 'Customer Full Name',
    'checkout.email': 'Email Address',
    'checkout.mobile': '10-digit Indian Mobile',
    'checkout.street': 'Street / Locality',
    'checkout.city': 'City / Town',
    'checkout.state': 'State / Province',
    'checkout.pincode': 'Pincode',
    'checkout.payment': 'Select Payment Method',
    'checkout.summary': 'Order Billing Summary',
    'checkout.coupon.placeholder': 'Enter Coupon Code',
    'checkout.coupon.apply': 'Apply',
    'checkout.taxNotice': 'Includes GST / Tax charges dynamically calculated.',
    'checkout.placeOrder': 'Authorize Order',

    // Generic Buttons
    'btn.loading': 'Processing...',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save Changes'
  },
  hi: {
    // Nav / Global
    'nav.shop': 'शॉप कैटलॉग',
    'nav.account': 'मेरा खाता',
    'nav.admin': 'कर्मचारी एडमिन',
    'nav.cart': 'शॉपिंग बैग',
    'nav.home': 'होम',
    'nav.language': 'भाषा / Language',

    // Home
    'home.hero.title': 'इन्फिनिटी एथलेटिक्स',
    'home.hero.subtitle': 'सर्वोत्तम प्रदर्शन के लिए प्रीमियम स्पोर्ट्स जूते',
    'home.hero.cta': 'कलेक्शन खरीदें',
    'home.brands.title': 'प्रमाणित वैश्विक ब्रांड्स का वितरण',
    'home.newArrivals': 'नए जूते (New Arrivals)',
    'home.trending': 'ट्रेंडिंग कलेक्शन',
    'home.whyTraders': 'इन्फिनिटी ट्रेडर्स क्यों?',
    'home. JharkhandDepot': 'धनबाद लॉजिस्टिक्स हब',
    'home. JharkhandDepot.desc': 'धनबाद, झारखंड से सीधे सभी भारतीय राज्यों में एक्सप्रेस टैक्स-अनुपालक शिपिंग।',
    'home.verified': '100% प्रमाणित जूते',
    'home.verified.desc': 'अधिकृत निर्माताओं से सीधे प्राप्त प्रामाणिक मल्टी-ब्रांड चप्पल, परिधान और रनिंग जूते।',

    // Shop Catalog
    'shop.filters': 'फ़िल्टर',
    'shop.sort.title': 'सॉर्ट करें',
    'shop.sort.lowHigh': 'कीमत: कम से अधिक',
    'shop.sort.highLow': 'कीमत: अधिक से कम',
    'shop.sort.discount': 'छूट: सबसे ज्यादा पहले',
    'shop.filter.brand': 'ब्रांड चुनें',
    'shop.filter.category': 'श्रेणी (Category)',
    'shop.filter.color': 'रंग',
    'shop.filter.material': 'सामग्री (Material)',
    'shop.filter.size': 'यूके साइज',
    'shop.filter.price': 'अधिकतम कीमत (₹)',
    'shop.clear': 'फ़िल्टर साफ करें',
    'shop.noProducts': 'आपकी पसंद के अनुसार कोई आर्टिकल नहीं मिला।',

    // Product Detail
    'prod.specification': 'विशिष्टता (Specs)',
    'prod.shipping': 'शिपिंग और रिटर्न',
    'prod.sizing': 'साइज गाइड',
    'prod.pincode.title': 'डिलीवरी पिनकोड जांचें',
    'prod.pincode.placeholder': '6-अंकों का पिनकोड दर्ज करें',
    'prod.pincode.check': 'जांचें (Check)',
    'prod.pincode.serviceable': 'अनुमानित डिलीवरी समय:',
    'prod.pincode.unserviceable': 'इस कोड पर डिलीवरी फिलहाल अनुपलब्ध है।',
    'prod.addToCart': 'शॉपिंग बैग में डालें',
    'prod.outOfStock': 'साइज स्टॉक में नहीं है',
    'prod.wishlist.add': 'विशलिस्ट में जोड़ें',
    'prod.wishlist.remove': 'विशलिस्ट से हटाएं',
    'prod.specs.sku': 'एसकेयू कोड',
    'prod.specs.color': 'रंग का प्रकार',
    'prod.specs.material': 'सामग्री की संरचना',
    'prod.specs.width': 'पैर की चौड़ाई फिट',

    // Cart Drawer
    'cart.title': 'आपका शॉपिंग बैग',
    'cart.empty': 'आपका शॉपिंग बैग खाली है।',
    'cart.checkout': 'चेकआउट पर जाएं',
    'cart.subtotal': 'कुल मूल्य',
    'cart.freeShipping': 'आप मुफ्त शिपिंग के पात्र हैं!',
    'cart.shippingNotice': 'मुफ्त शिपिंग के लिए ₹1,499+ मूल्य के उत्पाद जोड़ें।',

    // Checkout
    'checkout.title': 'सुरक्षित चेकआउट गेटवे',
    'checkout.shipping': 'शिपिंग पता विवरण',
    'checkout.name': 'ग्राहक का पूरा नाम',
    'checkout.email': 'ईमेल पता',
    'checkout.mobile': '10-अंकों का भारतीय मोबाइल',
    'checkout.street': 'सड़क / मोहल्ला',
    'checkout.city': 'शहर / कस्बा',
    'checkout.state': 'राज्य / प्रांत',
    'checkout.pincode': 'पिनकोड',
    'checkout.payment': 'भुगतान विधि चुनें',
    'checkout.summary': 'ऑर्डर बिलिंग सारांश',
    'checkout.coupon.placeholder': 'कूपन कोड डालें',
    'checkout.coupon.apply': 'लागू करें',
    'checkout.taxNotice': 'इसमें गतिशील रूप से गणना की गई जीएसटी / टैक्स शुल्क शामिल हैं।',
    'checkout.placeOrder': 'ऑर्डर की पुष्टि करें',

    // Generic Buttons
    'btn.loading': 'प्रक्रिया जारी है...',
    'btn.cancel': 'रद्द करें',
    'btn.save': 'बदलाव सहेजें'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('infinity_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('infinity_lang', lang);
  };

  const t = (key: string): string => {
    return dictionary[language][key] || dictionary['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
