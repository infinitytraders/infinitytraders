'use client';

import React from 'react';
import Link from 'next/link';

export default function ShippingPaymentsPage() {
  return (
    <div className="min-h-screen bg-[#f4f3ef] text-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <Link href="/" className="text-xs uppercase tracking-widest font-extrabold text-black/50 hover:text-black transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black mt-4">
            Shipping & Payments
          </h1>
          <p className="text-xs text-black/50 mt-1 uppercase font-bold tracking-widest">
            Logistics & Gateway Rules
          </p>
        </div>

        <div className="prose prose-sm prose-neutral max-w-none text-xs text-black/70 font-medium space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">1. Shipping Fees & Rates</h2>
            <p>
              We charge shipping rates between ₹150 and ₹500 depending upon the destination pincode and package dimensions. The exact rate will be dynamically calculated at checkout.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">2. Delivery Timelines</h2>
            <p>
              All standard orders are processed and dispatched within 24 hours. The standard delivery time is 4 to 5 business days across all serviceable pincodes in India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">3. Returns & Exchanges</h2>
            <p>
              As per our business terms, we enforce a strict <strong>No Return, Only Exchange</strong> policy. In the event of a size mismatch, wrong item delivery, or manufacturing defect, you must register an exchange request within 24 hours of delivery. Items must be unworn and in their original packaging.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">4. Integrated Payment Gateways</h2>
            <p>
              We support secure prepaid payment options powered by Razorpay. Customers can complete transactions using Credit/Debit Cards, UPI, or Net Banking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">5. Cash on Delivery (COD) Rules</h2>
            <p>
              Cash on Delivery (COD) is available for eligible pincodes. Customers opting for COD must confirm their active mobile number and shipping address prior to shipment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
