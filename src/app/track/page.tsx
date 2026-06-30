import React, { Suspense } from 'react';
import TrackClient from '@/components/TrackClient';

export const metadata = {
  title: 'Track Your Order | Infinity Traders',
  description: 'Track the status and shipment delivery route of your premium footwear and active gear orders from Infinity Traders.',
};

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-[10px] text-black/50 font-bold bg-[#f4f3ef] min-h-[85vh]">
          Loading Order Logistics Data...
        </div>
      }
    >
      <TrackClient />
    </Suspense>
  );
}
