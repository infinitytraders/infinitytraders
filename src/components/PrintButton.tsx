'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-black hover:bg-transparent text-white hover:text-black border border-black rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all uppercase tracking-widest"
    >
      <Printer className="w-3.5 h-3.5" /> Print / Save PDF
    </button>
  );
}
