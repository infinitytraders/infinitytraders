'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f4f3ef] text-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <Link href="/" className="text-xs uppercase tracking-widest font-extrabold text-black/50 hover:text-black transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black mt-4">
            Privacy Policy
          </h1>
          <p className="text-xs text-black/50 mt-1 uppercase font-bold tracking-widest">
            Data Collection & Protection Policy
          </p>
        </div>

        <div className="prose prose-sm prose-neutral max-w-none text-xs text-black/70 font-medium space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">1. What Information We Collect</h2>
            <p>
              When you create an account, purchase products, or subscribe to our newsletter, we collect details including your name, email address, mobile number, shipping address, and payment confirmation details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">2. Purpose of Data Use</h2>
            <p>
              Your data is utilized strictly to process your orders, calculate local pincode delivery timelines, deliver updates on tracking statuses, send newsletter subscription announcements, and maintain standard compliance audit records.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">3. Database Security & Storage</h2>
            <p>
              We protect accounts with secure passwords. Your records are stored in high-security, encrypted cloud databases. No payment details (credit card tokens, CVVs, UPI pins) are stored directly on our servers; all transaction routes process through the secured Razorpay gateway APIs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">4. Cookies and Session Tokens</h2>
            <p>
              We use lightweight browser session cookies to maintain your login status, preserve items added inside your shopping cart, and personalize your experience. No tracking cookies are shared with third-party advertising companies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
