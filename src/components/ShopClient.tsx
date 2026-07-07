'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Product } from '@/lib/db';
import { getProductsAction } from '@/app/actions';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Star, Search, SlidersHorizontal, Grid, X, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getHexFromColorName, getColorsArray } from '@/lib/colors';
import { motion, AnimatePresence } from 'framer-motion';


function normalizeBrandName(brand: string): string {
  if (!brand) return '';
  const b = brand.trim().toLowerCase();
  if (b === 'adidas') return 'Adidas';
  if (b === 'puma') return 'Puma';
  if (b === 'skechers') return 'Skechers';
  if (b === 'new balance' || b === 'newbalance') return 'New Balance';
  if (b === 'sega') return 'Sega';
  if (b === 'nike') return 'Nike';
  if (b === 'reebok') return 'Reebok';
  if (b === 'under armour') return 'Under Armour';
  if (b === 'jordan') return 'Jordan';
  if (b === 'fila') return 'Fila';
  if (b === 'asics') return 'Asics';
  return brand.trim().charAt(0).toUpperCase() + brand.trim().slice(1);
}

function normalizeCategoryName(cat: string): string {
  if (!cat) return '';
  const c = cat.trim().toLowerCase();
  if (c === 'footwear') return 'Footwear';
  if (c === 'slippers') return 'Slippers';
  if (c === 'apparel') return 'Apparel';
  if (c === 'accessories') return 'Accessories';
  if (c === 'sneakers' || c === 'casuals' || c === 'training shoes' || c === 'training-shoes') return 'Training Shoes';
  if (c === 'air saga' || c === 'air sega') return 'Air Sega';
  if (c === 't-shirts' || c === 'gym wear' || c === 'gymwear') return 'Gym Wear';
  if (c === 'halfpants' || c === 'tracksuit') return 'Tracksuit';
  return cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1);
}

export default function ShopClient() {
  const { addToCart } = useCart();
  const { t, tp, tc } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const getCatLabel = (cat: string) => {
    if (cat === 'All') return t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सभी' : 'All';
    return tc(cat);
  };

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string | number | 'All'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Initial load
  useEffect(() => {
    getProductsAction().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);

      // Handle URL pre-filters
      const catParam = searchParams.get('category');
      setSelectedCategory(catParam || 'All');

      const brandParam = searchParams.get('brand');
      setSelectedBrand(brandParam || 'All');

      const queryParam = searchParams.get('q');
      if (queryParam) {
        setSearchQuery(queryParam);
      }

      const filterParam = searchParams.get('filter');
      if (filterParam === 'new') {
        setSortBy('newest');
      } else if (filterParam === 'best') {
        setSortBy('best-selling');
      }
    });
  }, [searchParams]);

  // Extract unique options for filters
  const categories = ['All', ...new Set(products.map((p) => normalizeCategoryName(p.category)))];
  const brands = ['All', ...new Set(products.map((p) => normalizeBrandName(p.brand)))];
  const clothesOrder = ['S', 'M', 'L', 'XL', 'XXL'];
  const allSizes = [
    'All',
    ...Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => {
      const aVal = String(a);
      const bVal = String(b);
      const aIsNum = !isNaN(Number(aVal));
      const bIsNum = !isNaN(Number(bVal));

      if (aIsNum && bIsNum) {
        return Number(aVal) - Number(bVal);
      }
      if (aIsNum) return -1;
      if (bIsNum) return 1;

      const aIdx = clothesOrder.indexOf(aVal.toUpperCase());
      const bIdx = clothesOrder.indexOf(bVal.toUpperCase());
      
      if (aIdx !== -1 && bIdx !== -1) {
        return aIdx - bIdx;
      }
      return aVal.localeCompare(bVal);
    }),
  ].filter(s => s !== 0);

  // Filter and Sort Engine
  useEffect(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((p) => normalizeCategoryName(p.category) === selectedCategory);
    }

    if (selectedBrand !== 'All') {
      result = result.filter((p) => normalizeBrandName(p.brand) === selectedBrand);
    }

    if (selectedSize !== 'All') {
      result = result.filter((p) => 
        p.sizes.some(s => String(s).toLowerCase() === String(selectedSize).toLowerCase())
      );
    }

    result = result.filter((p) => p.sellingPrice <= maxPrice);

    if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'best-selling') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedSize, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedSize('All');
    setMaxPrice(15000);
    setSortBy('newest');
    router.replace('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#f4f3ef]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-black uppercase">
            {t('nav.shop')}
          </h1>
          <p className="text-[10px] text-black/50 font-bold mt-1 uppercase tracking-widest">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? `${products.length} सक्रिय लेखों में से ${filteredProducts.length} दिखाए जा रहे हैं` : `Showing ${filteredProducts.length} of ${products.length} active articles`}
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder={t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'नाम, SKU, ब्रांड द्वारा खोजें...' : 'Search by name, SKU, brand...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-black/10 focus:border-black rounded-full pl-10 pr-4 py-2.5 text-xs outline-none bg-white transition-all text-black"
            />
            <Search className="w-4 h-4 text-black/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowFiltersMobile(true)}
            className="lg:hidden bg-white border border-black/10 text-black px-4 py-2.5 rounded-full flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" /> {t('shop.filters')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white border border-black/5 p-6 rounded-2xl sticky top-28 shadow-xs">
          <div className="flex justify-between items-center border-b border-black/5 pb-4">
            <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-black flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-black" /> {t('shop.filters')}
            </h2>
            <button
              onClick={clearFilters}
              className="text-[9px] text-black hover:underline transition-all uppercase tracking-widest font-extrabold"
            >
              {t('shop.clear')}
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.filter.category')}</h3>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-xs py-1 transition-all uppercase tracking-wider font-semibold ${
                    selectedCategory === cat ? 'text-black font-extrabold underline' : 'text-black/60 hover:text-black'
                  }`}
                >
                  {getCatLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 border-t border-black/5 pt-4">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.filter.brand')}</h3>
            <div className="flex flex-col gap-1">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`text-left text-xs py-1 transition-all uppercase tracking-wider font-semibold ${
                    selectedBrand === b ? 'text-black font-extrabold underline' : 'text-black/60 hover:text-black'
                  }`}
                >
                  {b === 'All' && t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सभी' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3 border-t border-black/5 pt-4">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.filter.size')}</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {allSizes.map((size) => (
                <button
                  key={size.toString()}
                  onClick={() => setSelectedSize(size as any)}
                  className={`py-2 text-center text-[10px] border rounded-xl font-bold transition-all ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-black/10 bg-white text-black hover:border-black/25'
                  }`}
                >
                  {size === 'All' ? (t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सभी' : 'ALL') : size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 border-t border-black/5 pt-4">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-black/45">
              <span>{t('shop.filter.price')}</span>
              <span className="text-black font-extrabold">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={500}
              max={15000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black bg-black/10 rounded h-1 cursor-pointer"
            />
          </div>

          {/* Sorting Option */}
          <div className="space-y-3 border-t border-black/5 pt-4">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.sort.title')}</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#fdfdfd] border border-black/10 rounded-xl p-2.5 text-xs text-black font-semibold focus:border-black focus:outline-none"
            >
              <option value="newest">{t('home.newArrivals')}</option>
              <option value="best-selling">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'बेस्ट सेलर्स' : 'Best Sellers'}</option>
              <option value="popularity">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लोकप्रियता' : 'Popularity'}</option>
              <option value="price-low">{t('shop.sort.lowHigh')}</option>
              <option value="price-high">{t('shop.sort.highLow')}</option>
            </select>
          </div>
        </aside>

        {/* PRODUCTS LIST GRID */}
        <main className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-black/5 h-96 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-black/5 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black/35">
                <Grid className="w-8 h-8" />
              </div>
              <p className="text-black/50 font-light tracking-wide">{t('shop.noProducts')}</p>
              <button
                onClick={clearFilters}
                className="bg-black hover:bg-transparent text-white hover:text-black border border-black py-2.5 px-6 rounded-full text-xs uppercase tracking-widest font-bold transition-all"
              >
                {t('shop.clear')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white border border-black/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 shadow-xs"
                >
                  <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] bg-white overflow-hidden border-b border-black/5">
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

                  <div className="p-3 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-black/45 font-bold">
                        <span>{normalizeBrandName(product.brand)}</span>
                        <span>{tc(normalizeCategoryName(product.category))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <Link
                          href={`/product/${product.id}`}
                          className="block text-xs sm:text-sm font-extrabold text-black hover:underline transition-colors line-clamp-1 flex-1"
                        >
                          {tp(product.id, 'name', product.name)}
                        </Link>
                        {product.color && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {getColorsArray(product.color).map((col, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-inner"
                                style={{
                                  backgroundColor: col.startsWith('#') ? col : getHexFromColorName(col)
                                }}
                                title={col}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="hidden sm:block text-[11px] text-black/60 font-light line-clamp-2 mt-1.5 leading-relaxed">
                        {tp(product.id, 'desc', product.description)}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-black/5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 bg-black/5 px-1.5 sm:px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 text-black fill-black" />
                          <span className="text-[9px] sm:text-[10px] text-black font-extrabold">{product.averageRating}</span>
                          <span className="text-[8px] sm:text-[9px] text-black/50">({product.reviewsCount})</span>
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
                          onClick={() => addToCart(product, 1, product.sizes[0] || (['Footwear', 'Slippers', 'Running Shoes', 'Air Sega', 'Air Saga', 'Sneakers'].includes(product.category) ? 8 : 'M'))}
                          className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-2 sm:py-2.5 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 sm:gap-1.5 rounded-full transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> {t('prod.addToCart')}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-black/5 border border-black/5 text-black/30 py-2 sm:py-2.5 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold rounded-full cursor-not-allowed"
                        >
                          {t('prod.outOfStock')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTERS SIDE PANEL */}
      <AnimatePresence>
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiltersMobile(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] h-full bg-[#f4f3ef] border-l border-black/5 p-6 flex flex-col justify-between overflow-y-auto z-10 space-y-6 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-black flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-black" /> Filters
                  </h2>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="text-black/50 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Category */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.filter.category')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[10px] px-3.5 py-1.5 border rounded-full uppercase tracking-wider transition-colors font-bold ${
                          selectedCategory === cat
                            ? 'border-black bg-black text-white'
                            : 'border-black/10 bg-white text-black hover:border-black/25'
                        }`}
                      >
                        {getCatLabel(cat)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Brand */}
                <div className="space-y-2 border-t border-black/5 pt-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.filter.brand')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b)}
                        className={`text-[10px] px-3.5 py-1.5 border rounded-full uppercase tracking-wider transition-colors font-bold ${
                          selectedBrand === b
                            ? 'border-black bg-black text-white'
                            : 'border-black/10 bg-white text-black hover:border-black/25'
                        }`}
                      >
                        {b === 'All' && t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सभी' : b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Size */}
                <div className="space-y-3 border-t border-black/5 pt-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.filter.size')}</h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {allSizes.map((size) => (
                      <button
                        key={size.toString()}
                        onClick={() => setSelectedSize(size as any)}
                        className={`py-2.5 text-center text-[10px] border rounded-xl font-bold transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-black/10 bg-white text-black hover:border-black/25'
                        }`}
                      >
                        {size === 'All' ? (t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सभी' : 'ALL') : size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="space-y-3 border-t border-black/5 pt-4">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-black/45">
                    <span>{t('shop.filter.price')}</span>
                    <span className="text-black font-extrabold">₹{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={15000}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-black bg-black/10 rounded h-1 cursor-pointer"
                  />
                </div>

                {/* Mobile Sorting */}
                <div className="space-y-3 border-t border-black/5 pt-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-black/45">{t('shop.sort.title')}</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-[#fdfdfd] border border-black/10 rounded-xl p-2.5 text-xs text-black font-semibold focus:border-black focus:outline-none"
                  >
                    <option value="newest">{t('home.newArrivals')}</option>
                    <option value="best-selling">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'बेस्ट सेलर्स' : 'Best Sellers'}</option>
                    <option value="popularity">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लोकप्रियता' : 'Popularity'}</option>
                    <option value="price-low">{t('shop.sort.lowHigh')}</option>
                    <option value="price-high">{t('shop.sort.highLow')}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 border-t border-black/5 pt-4">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-white hover:bg-black/5 border border-black/15 text-black py-3 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all text-center"
                >
                  {t('shop.clear')}
                </button>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="flex-1 bg-black hover:bg-transparent text-white hover:text-black border border-black py-3 text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all text-center"
                >
                  {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लागू करें' : 'Apply'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

