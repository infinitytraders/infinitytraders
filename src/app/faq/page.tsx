'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Are the shoes and apparel authentic?",
      answer: "Yes, Infinity Traders distributes only 100% authentic products. We source all footwear, activewear, and slides directly from official brand suppliers including Nike, Adidas, Puma, and Skechers."
    },
    {
      question: "What are your shipping rates and thresholds?",
      answer: "We charge a flat rate of ₹99 for orders under ₹999. If your order value totals ₹999 or more, shipping is free."
    },
    {
      question: "How long does it take for my order to arrive?",
      answer: "Delivery timelines range from 2 to 7 business days depending on the destination pincode. Local deliveries within Jharkhand take 1-2 business days, metros take 2-3 business days, and other regions take 4-7 business days."
    },
    {
      question: "What is your refund policy?",
      answer: "We strictly enforce a 'No Refund' policy. Replacements or returns are only processed within 24 hours of delivery if you receive a damaged product, incorrect size, or incorrect model. All tags must remain attached and the item must be unworn."
    },
    {
      question: "Is Cash on Delivery (COD) available?",
      answer: "Yes, Cash on Delivery is fully supported for all serviceable pincodes. You can check pincode serviceability before checking out."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <Link href="/" className="text-xs uppercase tracking-widest font-extrabold text-black/50 hover:text-black transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black mt-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-black/50 mt-1 uppercase font-bold tracking-widest">
            Answers & Customer Support
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-black/5 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center p-5 text-left text-xs font-extrabold uppercase tracking-wider text-black focus:outline-none select-none"
                >
                  <span>{faq.question}</span>
                  <span className="text-lg font-light leading-none">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-40 border-t border-black/5' : 'max-h-0'
                  }`}
                >
                  <p className="p-5 text-xs text-black/70 font-medium leading-relaxed bg-[#fafafa]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
