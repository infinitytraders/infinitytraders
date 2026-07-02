'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

type Translations = Record<string, string>;

const dictionary: Record<Language, Translations> = {
  en: {
    // Nav / Global
    'nav.shop': 'Shop',
    'nav.contact': 'Contact',
    'nav.account': 'My Account',
    'nav.admin': 'Staff Admin',
    'nav.cart': 'Shopping Bag',
    'nav.home': 'Home',
    'nav.track': 'Track Order',
    'nav.language': 'Language / भाषा',

    // Home
    'home.hero.title': 'INFINITY ATHLETICS',
    'home.hero.subtitle': 'PREMIUM SPORTS FOOTWEAR FOR PEAK PERFORMANCE',
    'home.hero.cta': 'Shop the Collection',
    'home.brands.title': 'Distributing Certified Global Brands',
    'home.exploreBrands': 'Explore from brands',
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
    'prod.shipping': 'Shipping Details',
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
    'btn.save': 'Save Changes',

    // Products metadata
    'prod.name.prod_1': 'Air Zoom Pegasus Running Shoe',
    'prod.desc.prod_1': 'Featuring a responsive zoom air unit and a highly breathable engineering mesh upper. Engineered to support your active stride with premium lightweight cushioning.',
    'prod.color.prod_1': 'Crimson Red',
    'prod.material.prod_1': 'Tech Mesh & EVA Foam',

    'prod.name.prod_2': 'Adilette Comfort Slides',
    'prod.desc.prod_2': 'Classic lightweight sliders featuring a contoured footbed and quick-drying bandage upper. Perfect recovery footwear after an intense workout session.',
    'prod.color.prod_2': 'Core Black',
    'prod.material.prod_2': 'Recycled EVA Foam',

    'prod.name.prod_3': 'Active Tech Fleece Trousers',
    'prod.desc.prod_3': 'Designed with warm tech fleece material and tapered cuffs. These training trousers offer excellent warmth and mobility without adding extra bulk.',
    'prod.color.prod_3': 'Charcoal Grey',
    'prod.material.prod_3': 'Fleece Knit Polyester',

    'prod.name.prod_4': 'GO RUN Breathable Training Tee',
    'prod.desc.prod_4': 'A breathable, lightweight t-shirt built for running. Features high stretch and sweat-wicking properties to keep you cool and dry.',
    'prod.color.prod_4': 'Slate Blue',
    'prod.material.prod_4': 'Poly-Spandex Tech Mesh',

    'prod.name.prod_5': 'Cushioned Crew Athletic Socks',
    'prod.desc.prod_5': 'Pack of 3 premium combed cotton athletic socks. Full foot cushioning provides impact absorption and blister protection.',
    'prod.color.prod_5': 'White / Grey',
    'prod.material.prod_5': 'Premium Combed Cotton',

    'prod.name.prod_6': 'Dri-FIT Flex Training Shorts',
    'prod.desc.prod_6': 'High-performance training shorts featuring Nike Dri-FIT technology. Provides absolute flexibility, sweat management, and a comfortable secure fit.',
    'prod.color.prod_6': 'Black / Metallic',
    'prod.material.prod_6': 'Recycled Polyester',

    'prod.name.prod_7': 'Primeknit Running Kit',
    'prod.desc.prod_7': 'Complete high-performance training bundle comprising premium running compression pants and a cooling active sando vest.',
    'prod.color.prod_7': 'Black Accent',
    'prod.material.prod_7': 'Primeknit Seamless fabric',

    'prod.name.prod_8': 'Striker Football Active Jersey',
    'prod.desc.prod_8': 'DryCELL sweat-wicking lightweight football jersey. Styled with club details, high ventilation zones, and ergonomic lines.',
    'prod.color.prod_8': 'Red / White',
    'prod.material.prod_8': 'DryCELL Polyester Knit',

    'prod.name.prod_9': 'Ultimate Shoe Cleaner Kit',
    'prod.desc.prod_9': 'All-in-one athletic shoe care cleaner. Comes with a foaming cleaning solution, a premium soft hog bristle brush, and a microfiber cloth.',
    'prod.color.prod_9': 'Clear / White',
    'prod.material.prod_9': 'Natural Cleaning Solution',

    'prod.category.Footwear': 'Footwear',
    'prod.category.Slippers': 'Slippers & Slides',
    'prod.category.Apparel': 'Apparel',
    'prod.category.Accessories': 'Accessories'
  },
  hi: {
    // Nav / Global
    'nav.shop': 'शॉप',
    'nav.contact': 'संपर्क',
    'nav.account': 'मेरा खाता',
    'nav.admin': 'कर्मचारी एडमिन',
    'nav.cart': 'शॉपिंग बैग',
    'nav.home': 'होम',
    'nav.track': 'ऑर्डर ट्रैक करें',
    'nav.language': 'भाषा / Language',

    // Home
    'home.hero.title': 'इन्फिनिटी एथलेटिक्स',
    'home.hero.subtitle': 'सर्वोत्तम प्रदर्शन के लिए प्रीमियम स्पोर्ट्स जूते',
    'home.hero.cta': 'कलेक्शन खरीदें',
    'home.brands.title': 'प्रमाणित वैश्विक ब्रांड्स का वितरण',
    'home.exploreBrands': 'ब्रांड्स से खोजें',
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
    'prod.shipping': 'शिपिंग विवरण',
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
    'btn.save': 'बदलाव सहेजें',

    // Products metadata
    'prod.name.prod_1': 'एयर ज़ूम पेगासस रनिंग शू (Air Zoom Pegasus)',
    'prod.desc.prod_1': 'एक प्रतिक्रियाशील ज़ूम एयर यूनिट और एक अत्यधिक सांस लेने योग्य इंजीनियरिंग मेश अपर की विशेषता। प्रीमियम हल्के कुशनिंग के साथ आपके सक्रिय कदम का समर्थन करने के लिए इंजीनियर किया गया।',
    'prod.color.prod_1': 'क्रिमसन रेड (गहरा लाल)',
    'prod.material.prod_1': 'टेक मेश और ईवीए फोम',

    'prod.name.prod_2': 'एडिलेट कंफर्ट स्लाइड्स (Adilette Comfort)',
    'prod.desc.prod_2': 'समोच्च फुटबेड और जल्दी सूखने वाले पट्टी वाले ऊपरी हिस्से की विशेषता वाले क्लासिक हल्के स्लाइडर्स। एक गहन कसरत सत्र के बाद पैर की रिकवरी के लिए बिल्कुल सही जूते।',
    'prod.color.prod_2': 'कोर ब्लैक (काला)',
    'prod.material.prod_2': 'रीसाइक्लिंग ईवीए फोम',

    'prod.name.prod_3': 'एक्टिव टेक फ्लीस पतलून (Tech Fleece Trousers)',
    'prod.desc.prod_3': 'गर्म तकनीकी फ्लीस सामग्री और पतला कफ के साथ डिज़ाइन किया गया। ये प्रशिक्षण पतलून बिना किसी अतिरिक्त वजन के उत्कृष्ट गर्मी और गतिशीलता प्रदान करते हैं।',
    'prod.color.prod_3': 'चारकोल ग्रे',
    'prod.material.prod_3': 'फ्लीस निट पॉलिएस्टर',

    'prod.name.prod_4': 'गो रन ब्रीदबल ट्रेनिंग टी (GO RUN Training Tee)',
    'prod.desc.prod_4': 'दौड़ने के लिए बनाई गई एक सांस लेने योग्य, हल्की टी-शर्ट। आपको ठंडा और सूखा रखने के लिए उच्च खिंचाव और पसीना सोखने वाले गुणों से युक्त।',
    'prod.color.prod_4': 'स्लेट ब्लू (नीला)',
    'prod.material.prod_4': 'पॉली-स्पैंडेक्स टेक मेश',

    'prod.name.prod_5': 'कुशन क्रू एथलेटिक मोज़े (Athletic Socks)',
    'prod.desc.prod_5': '3 प्रीमियम कॉम्बेड कॉटन एथलेटिक मोज़े का पैक। पूर्ण पैर का कुशनिंग प्रभाव अवसूचन और छाला सुरक्षा प्रदान करता है।',
    'prod.color.prod_5': 'सफेद / ग्रे',
    'prod.material.prod_5': 'प्रीमियम कॉम्बेड कॉटन',

    'prod.name.prod_6': 'ड्राई-फिट फ्लेक्स ट्रेनिंग शॉर्ट्स (Dri-FIT Shorts)',
    'prod.desc.prod_6': 'नाइके ड्राई-फिट तकनीक की विशेषता वाले उच्च प्रदर्शन प्रशिक्षण शॉर्ट्स। पूर्ण लचीलापन, पसीना प्रबंधन और एक आरामदायक सुरक्षित फिट प्रदान करता.है।',
    'prod.color.prod_6': 'ब्लैक / मैटेलिक (काला)',
    'prod.material.prod_6': 'पुनर्नवीनीकरण पॉलिएस्टर',

    'prod.name.prod_7': 'प्राइमनिट रनिंग किट (Primeknit Kit)',
    'prod.desc.prod_7': 'प्रीमियम रनिंग कम्प्रेशन पैंट और कूलिंग एक्टिव सैंडो वेस्ट से युक्त संपूर्ण हाई-परफॉर्मेंस ट्रेनिंग बंडल।',
    'prod.color.prod_7': 'ब्लैक एक्सेंट (काला)',
    'prod.material.prod_7': 'प्राइमनिट सीमलेस फैब्रिक',

    'prod.name.prod_8': 'स्ट्राइकर फुटबॉल एक्टिव जर्सी (Active Jersey)',
    'prod.desc.prod_8': 'ड्राईसेल पसीना सोखने वाली हल्की फुटबॉल जर्सी। क्लब विवरण, उच्च वेंटिलेशन ज़ोन और एर्गोनोमिक लाइनों के साथ स्टाइल किया गया।',
    'prod.color.prod_8': 'लाल / सफेद',
    'prod.material.prod_8': 'ड्राईसेल पॉलिएस्टर निट',

    'prod.name.prod_9': 'अल्टीमेट शू क्लीनर किट (Cleaner Kit)',
    'prod.desc.prod_9': 'सभी-एक-साथ एथलेटिक जूता देखभाल क्लीनर। एक फोमिंग सफाई समाधान, एक प्रीमियम सॉफ्ट हॉग ब्रिस्टल ब्रश और एक माइक्रोफाइबर कपड़े के साथ आता है।',
    'prod.color.prod_9': 'पारदर्शी / सफेद',
    'prod.material.prod_9': 'प्राकृतिक सफाई समाधान',

    'prod.category.Footwear': 'जूते (Footwear)',
    'prod.category.Slippers': 'स्लीपर्स और स्लाइड्स',
    'prod.category.Apparel': 'परिधान (Apparel)',
    'prod.category.Accessories': 'सहायक उपकरण'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tp: (productId: string, field: 'name' | 'desc' | 'color' | 'material', fallback: string) => string;
  tc: (category: string) => string;
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

  const tp = (productId: string, field: 'name' | 'desc' | 'color' | 'material', fallback: string): string => {
    const key = `prod.${field}.${productId}`;
    const val = t(key);
    return val === key ? fallback : val;
  };

  const tc = (category: string): string => {
    const key = `prod.category.${category}`;
    const val = t(key);
    return val === key ? category : val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tp, tc }}>
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
