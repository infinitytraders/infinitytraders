import React, { Suspense } from 'react';
import AccountClient from '@/components/AccountClient';

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center uppercase tracking-widest text-xs text-white/50 font-light">
          Loading Security Session...
        </div>
      }
    >
      <AccountClient />
    </Suspense>
  );
}
