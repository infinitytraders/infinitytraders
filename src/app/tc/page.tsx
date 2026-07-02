'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f4f3ef] text-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <Link href="/" className="text-xs uppercase tracking-widest font-extrabold text-black/50 hover:text-black transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black mt-4">
            Terms & Conditions
          </h1>
          <p className="text-xs text-black/50 mt-1 uppercase font-bold tracking-widest">
            Last Updated: July 2026
          </p>
        </div>

        <div className="prose prose-sm prose-neutral max-w-none text-xs text-black/70 font-medium space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">1. Welcome to Infinity Traders</h2>
            <p>
              These Terms & Conditions govern your use of the Infinity Traders website (referred to as "the website" or "the store") and the purchase of any products. By browsing, accessing, or placing an order on our platform, you accept these terms in full.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">2. Multi-Brand Distribution</h2>
            <p>
              Infinity Traders operates as an official distributor of premium sportswear, sneakers, active slides, and accessories in India. We supply authentic merchandise sourced directly from official brand suppliers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">3. Commercial Invoices & Tax Compliance</h2>
            <p>
              All purchases processed on our storefront generate a transparent GST tax invoice. Prices shown are subject to the standard 18% CGST/SGST or IGST breakdown computed during checkout. Customers can supply their registered GSTIN details for business tax inputs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">4. No Refund Policy</h2>
            <p className="text-red-700 font-bold">
              We strictly enforce a "No Refund" policy on all successfully processed and shipped orders. In the event of a manufacturing defect or wrong size/product shipment, returns or replacements are accepted within 24 hours of delivery. The item must be unused, in its original packaging, and with all tags intact.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">5. Jurisdictional Authority</h2>
            <p>
              Any disputes, controversies, or claims arising out of or in connection with Infinity Traders shall be subject to the exclusive jurisdiction of the courts located in Dhanbad, Jharkhand, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
