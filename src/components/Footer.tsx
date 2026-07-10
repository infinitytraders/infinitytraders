'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, ExternalLink } from 'lucide-react';
import { subscribeNewsletterAction } from '@/app/actions';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFirstName, setNewsletterFirstName] = useState('');
  const [newsletterLastName, setNewsletterLastName] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Don't show footer on admin dashboard or invoice pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/invoice')) {
    return null;
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await subscribeNewsletterAction(
        newsletterFirstName,
        newsletterLastName,
        newsletterEmail
      );
      if (res.success) {
        setNewsletterSubscribed(true);
        setNewsletterEmail('');
        setNewsletterFirstName('');
        setNewsletterLastName('');
      } else {
        alert(res.error || 'Failed to subscribe.');
      }
    } catch (err) {
      alert('Subscription failed. Please try again.');
    }
  };

  return (
    <footer className="w-full bg-[#ededed] text-black border-t border-black/[0.06] mt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 sm:gap-12 text-left pb-16 border-b border-black/[0.06]">
          
          {/* Logo Column */}
          <div className="md:col-span-2">
            <div className="text-4xl font-light text-black tracking-tight leading-none uppercase select-none">
              INFINITY<br /><span className="font-extrabold">TRADERS</span>
            </div>
          </div>

          {/* Column 1: Links */}
          <div className="md:col-span-2 flex flex-col gap-3 text-xs text-black/60 font-medium">
            <Link href="/contact" className="hover:text-black transition-colors">Contact us</Link>
            <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
          </div>

          {/* Column 2: Address & Socials */}
          <div className="md:col-span-3 flex flex-col gap-6 text-xs">
            {/* Location Block */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-black/45 font-bold uppercase tracking-wider text-[9px]">
                <MapPin className="w-3.5 h-3.5 text-black" />
                <span>Store Location</span>
              </div>
              <div className="text-black/70 font-semibold leading-relaxed">
                Putki Chirudih,<br />
                Opposite Navneet Hotel,<br />
                Dhanbad, Jharkhand
              </div>
              <a 
                href="https://maps.app.goo.gl/mBEQXescY9F2eqqU8?g_st=com.google.maps.preview.copy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-black hover:text-black/60 transition-colors border-b border-black pb-0.5 mt-1"
              >
                <span>View on Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Socials Block */}
            <div className="space-y-2 pt-2 border-t border-black/5">
              <span className="text-black/45 font-bold uppercase tracking-wider text-[9px] block">Connect With Us</span>
              <div className="flex flex-wrap gap-2.5">
                <a 
                  href="https://www.instagram.com/infinity_traders_dhanbad2?igsh=dHY2NXhpdm1meWF2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 hover:bg-black hover:text-white text-black font-extrabold text-[9px] uppercase tracking-wider rounded-full transition-all border border-black/5 hover:border-black"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://youtube.com/@infinitytraders2?si=l3rqMDvSv6PDFLAj" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 hover:bg-black hover:text-white text-black font-extrabold text-[9px] uppercase tracking-wider rounded-full transition-all border border-black/5 hover:border-black"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                  <span>Youtube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Legal & QA */}
          <div className="md:col-span-2 flex flex-col gap-3 text-xs text-black/60 font-medium">
            <Link href="/tc" className="hover:text-black transition-colors">T&C</Link>
            <Link href="/shipping-payments" className="hover:text-black transition-colors">Shipping & Payments</Link>
            <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/contact#faq" className="hover:text-black transition-colors">FAQ</Link>
          </div>

          {/* Column 4: Newsletter Form */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-base font-semibold text-[#1a1a1a] tracking-tight">Newsletter</h4>
            <p className="text-xs text-black/50 font-normal">Let's stay in touch for early updates</p>
            
            {newsletterSubscribed ? (
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'धन्यवाद! आपने सफलतापूर्वक सदस्यता ले ली है।' : 'Thank you! You have subscribed successfully.'}
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="First Name *" 
                    value={newsletterFirstName} 
                    onChange={(e) => setNewsletterFirstName(e.target.value)} 
                    required 
                    className="border-b border-black/10 focus:border-black bg-transparent outline-none py-1.5 text-xs w-full text-black placeholder-black/30 transition-colors" 
                    suppressHydrationWarning={true}
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name *" 
                    value={newsletterLastName} 
                    onChange={(e) => setNewsletterLastName(e.target.value)} 
                    required 
                    className="border-b border-black/10 focus:border-black bg-transparent outline-none py-1.5 text-xs w-full text-black placeholder-black/30 transition-colors" 
                    suppressHydrationWarning={true}
                  />
                </div>
                <input 
                  type="email" 
                  placeholder="Email *" 
                  value={newsletterEmail} 
                  onChange={(e) => setNewsletterEmail(e.target.value)} 
                  required 
                  className="border-b border-black/10 focus:border-black bg-transparent outline-none py-1.5 text-xs w-full text-black placeholder-black/30 transition-colors" 
                  suppressHydrationWarning={true}
                />
                <button 
                  type="submit" 
                  className="border border-black px-6 py-1.5 rounded-full text-xs font-semibold hover:bg-black hover:text-white transition-all text-black mt-2 bg-transparent"
                  suppressHydrationWarning={true}
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[10px] text-black/45 font-medium tracking-wide">
          <div></div>
          <div>&copy; {new Date().getFullYear()} infinity traders | All rights reserved. <a href="https://www.zawrindustries.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Designed and developed by Zawr Industries</a></div>
        </div>
      </div>
    </footer>
  );
}
