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
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">1. Shipping Fees & Thresholds</h2>
            <p>
              We charge a flat shipping rate of ₹99 on all standard orders below the free-shipping threshold. Standard orders totaling ₹999 or more qualify automatically for free courier delivery across India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">2. Pincode Serviceability</h2>
            <p>
              Delivery availability is determined dynamically using the customer's 6-digit postal pincode. Timelines are computed based on regions:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1 font-bold">
              <li>Metro Cities: 2 - 3 business days</li>
              <li>Jharkhand (Local): 1 - 2 business days</li>
              <li>Rest of India: 4 - 7 business days</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">3. Integrated Payment Gateways</h2>
            <p>
              We support standard prepaid payment options powered by Razorpay. Customers can complete transactions securely using credit cards, debit cards, UPI, or Net Banking options.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">4. Cash on Delivery (COD) Rules</h2>
            <p>
              For serviceable pincodes, Cash on Delivery is offered at checkout. Customers opting for COD must confirm their active mobile number and address before dispatch.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
