'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function CookieConsent() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already consented or declined
    const consent = localStorage.getItem('infinity_cookie_consent');
    if (!consent) {
      // Small delay on mount for a smoother entrance feel
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('infinity_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('infinity_cookie_consent', 'declined');
    setShowBanner(false);
  };

  // Determine active language for custom local translation
  const isHindi = t('home.newArrivals') === 'नए जूते (New Arrivals)';

  const titleText = isHindi ? 'कुकी सहमति' : 'Cookie Consent';
  const consentText = isHindi
    ? 'हम आपकी प्राथमिकताओं को याद रखने, शॉपिंग बैग को प्रबंधित करने और साइट ट्रैफ़िक का विश्लेषण करने के लिए आवश्यक कुकीज़ का उपयोग करते हैं।'
    : 'We use essential cookies to remember your preferences, manage your shopping bag, and analyze site traffic.';
  const acceptBtn = isHindi ? 'सभी स्वीकार करें' : 'Accept All';
  const declineBtn = isHindi ? 'अस्वीकार करें' : 'Decline';
  const policyLinkText = isHindi ? 'हमारी गोपनीयता नीति पढ़ें' : 'Read our Privacy Policy';

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-3rem)] bg-white/90 backdrop-blur-xl border border-black/10 rounded-3xl p-6 shadow-2xl"
        >
          {/* Header block */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-black/5 rounded-xl text-black">
                <Cookie className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-black">
                {titleText}
              </h3>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-black/40 hover:text-black transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description body */}
          <div className="mt-4 space-y-3">
            <p className="text-xs text-black/70 font-medium leading-relaxed">
              {consentText}{' '}
              <Link
                href="/privacy-policy"
                className="text-black font-bold underline hover:text-black/80 transition-colors"
              >
                {policyLinkText}
              </Link>
              .
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 bg-transparent hover:bg-black/5 text-black border border-black/10 rounded-xl py-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider transition-all"
            >
              {declineBtn}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 bg-black hover:bg-black/90 text-white rounded-xl py-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-xs"
            >
              {acceptBtn}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
