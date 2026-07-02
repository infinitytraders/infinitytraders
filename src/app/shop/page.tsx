import { Metadata } from 'next';
import React, { Suspense } from 'react';
import ShopClient from '@/components/ShopClient';

export const metadata: Metadata = {
  title: 'Shop Premium Footwear, Activewear & Sportswear | Infinity Traders',
  description: "Browse modern performance running shoes, athletic apparel, and recovery slides at Infinity Traders. Dhanbad's premium multi-brand distributor serving India.",
  keywords: 'running shoes India, purchase sneakers online, sport slide sandles, activewear apparel, Infinity Traders catalog',
  alternates: {
    canonical: 'https://infinitytraders.shop/shop',
  },
  openGraph: {
    title: 'Shop Premium Footwear & Sportswear | Infinity Traders',
    description: "Dhanbad's premium multi-brand catalog. Order activewear, slides, and running shoes online.",
    url: 'https://infinitytraders.shop/shop',
    type: 'website',
    images: [
      {
        url: 'https://infinitytraders.shop/categories/sneakers.jpg',
        width: 1200,
        height: 630,
        alt: 'Infinity Traders Premium Catalog Banner',
      },
    ],
  },
};

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-[10px] text-black/50 font-bold bg-[#f4f3ef]">
        Loading catalog...
      </div>
    }>
      <ShopClient />
    </Suspense>
  );
}
