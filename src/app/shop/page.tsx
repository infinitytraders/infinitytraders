'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Product } from '@/lib/db';
import { getProductsAction } from '@/app/actions';
import { useCart } from '@/context/CartContext';
import { Star, Search, SlidersHorizontal, Grid, X, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

function ShopContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<number | 'All'>('All');
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
      if (catParam) {
        setSelectedCategory(catParam);
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
  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const brands = ['All', ...new Set(products.map((p) => p.brand))];
  // Gather all unique sizes and sort them
  const allSizes = [
    'All',
    ...Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b),
  ].filter(s => s !== 0); // Remove 0 size

  // Filter and Sort Engine
  useEffect(() => {
    let result = [...products];

    // Search Query (Typo-tolerant/Substring check)
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

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Brand Filter
    if (selectedBrand !== 'All') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Size Filter
    if (selectedSize !== 'All') {
      result = result.filter((p) => p.sizes.includes(Number(selectedSize)));
    }

    // Price Filter
    result = result.filter((p) => p.sellingPrice <= maxPrice);

    // Sorting Engine
    if (sortBy === 'newest') {
      // Seed products have isNewArrival, we sort new arrivals first
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-white uppercase">
            Product Catalog
          </h1>
          <p className="text-xs text-white/50 font-light mt-1 uppercase tracking-wider">
            Showing {filteredProducts.length} of {products.length} active articles
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search by name, SKU, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-premium pl-10 py-2 text-xs"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowFiltersMobile(true)}
            className="lg:hidden btn-secondary p-2.5 rounded flex items-center gap-1.5 text-xs uppercase font-semibold tracking-wider"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-[#141821]/30 border border-white/5 p-6 rounded-lg sticky top-28">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent-teal" /> Filters
            </h2>
            <button
              onClick={clearFilters}
              className="text-[10px] text-accent-teal hover:text-white transition-colors uppercase tracking-wider font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Category</h3>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-xs py-1 transition-colors uppercase tracking-wider font-light ${
                    selectedCategory === cat ? 'text-accent-teal font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Brand</h3>
            <div className="flex flex-col gap-1.5">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`text-left text-xs py-1 transition-colors uppercase tracking-wider font-light ${
                    selectedBrand === b ? 'text-accent-teal font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Indian shoe size</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {allSizes.map((size) => (
                <button
                  key={size.toString()}
                  onClick={() => setSelectedSize(size as any)}
                  className={`py-1.5 text-center text-xs border rounded transition-colors ${
                    selectedSize === size
                      ? 'border-accent-teal bg-accent-teal text-background font-semibold'
                      : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {size === 'All' ? 'All' : `UK ${size}`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-semibold text-white/70">
              <span>Max Price</span>
              <span className="text-accent-teal">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={500}
              max={15000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent-teal bg-white/10 rounded h-1 cursor-pointer"
            />
          </div>

          {/* Sorting Option */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#141821] border border-white/10 rounded p-2 text-xs text-white/80 focus:border-accent-teal focus:outline-none"
            >
              <option value="newest">New Arrivals</option>
              <option value="best-selling">Best Sellers</option>
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* PRODUCTS LIST GRID */}
        <main className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#141821]/20 border border-white/5 h-96 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#141821]/15 border border-white/5 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                <Grid className="w-8 h-8" />
              </div>
              <p className="text-white/50 font-light tracking-wide">No articles matches your selected filter criteria.</p>
              <button
                onClick={clearFilters}
                className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-widest font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-[#141821]/45 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all duration-300"
                >
                  <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] bg-white/5 overflow-hidden">
                    {product.stockQuantity <= 3 && product.stockQuantity > 0 && (
                      <span className="absolute top-3 left-3 bg-warning text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded z-10 animate-pulse">
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="btn-primary px-4 py-2 text-[10px] uppercase tracking-widest font-semibold rounded">
                        View Details
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-accent-teal font-semibold">
                        <span>{product.brand}</span>
                        <span className="text-white/40">{product.category}</span>
                      </div>
                      <Link
                        href={`/product/${product.id}`}
                        className="block text-sm font-semibold text-white mt-1 hover:text-accent-teal transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-white/50 font-light line-clamp-2 mt-1.5 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-accent-teal fill-accent-teal" />
                          <span className="text-[11px] text-white font-medium">{product.averageRating}</span>
                          <span className="text-[9px] text-white/40">({product.reviewsCount})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                          {product.mrp > product.sellingPrice && (
                            <span className="text-[10px] text-white/40 line-through block">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {product.stockQuantity > 0 ? (
                        <button
                          onClick={() => addToCart(product, 1, product.sizes[0] || 8)}
                          className="w-full btn-secondary py-2 text-[9px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 rounded"
                        >
                          <ShoppingCart className="w-3 h-3" /> Add to Bag
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-white/5 border border-white/10 text-white/30 py-2 text-[9px] uppercase tracking-widest font-semibold rounded cursor-not-allowed"
                        >
                          Out of Stock
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
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setShowFiltersMobile(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-[#0b0c10] border-l border-white/5 p-6 flex flex-col justify-between overflow-y-auto z-10 space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-accent-teal" /> Filters
                </h2>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div className="space-y-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Category</h3>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 border rounded uppercase tracking-wider transition-colors ${
                        selectedCategory === cat
                          ? 'border-accent-teal text-accent-teal font-semibold'
                          : 'border-white/10 text-white/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Brand */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Brand</h3>
                <div className="flex flex-wrap gap-1.5">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`text-xs px-3 py-1.5 border rounded uppercase tracking-wider transition-colors ${
                        selectedBrand === b
                          ? 'border-accent-teal text-accent-teal font-semibold'
                          : 'border-white/10 text-white/60'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Size */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Indian shoe size</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {allSizes.map((size) => (
                    <button
                      key={size.toString()}
                      onClick={() => setSelectedSize(size as any)}
                      className={`py-1.5 text-center text-xs border rounded transition-colors ${
                        selectedSize === size
                          ? 'border-accent-teal bg-accent-teal text-background font-semibold'
                          : 'border-white/10 text-white/70'
                      }`}
                    >
                      {size === 'All' ? 'All' : `UK ${size}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-semibold text-white/70">
                  <span>Max Price</span>
                  <span className="text-accent-teal">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={15000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-accent-teal bg-white/10 rounded h-1 cursor-pointer"
                />
              </div>

              {/* Mobile Sorting */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#141821] border border-white/10 rounded p-2.5 text-xs text-white"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="best-selling">Best Sellers</option>
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/5 pt-4">
              <button
                onClick={clearFilters}
                className="flex-1 btn-secondary py-2.5 text-[10px] uppercase tracking-widest font-semibold text-center"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="flex-1 btn-primary py-2.5 text-[10px] uppercase tracking-widest font-semibold text-center rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-xs text-white/50 font-light">
        Loading catalog...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
