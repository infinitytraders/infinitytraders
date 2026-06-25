'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getSessionUser, logoutAction } from '@/app/actions';
import { ShoppingBag, User as UserIcon, Menu, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { cart, setCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch session on load and route change
  useEffect(() => {
    getSessionUser().then(u => setUser(u));
  }, [pathname]);

  // Track scroll position to change background opacity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
    window.location.reload();
  };

  const navLinks = [
    { label: t('nav.shop'), href: '/shop' },
    { label: t('home.newArrivals'), href: '/shop?filter=new' },
    { label: t('home.trending'), href: '/shop?filter=best' },
    { label: t('home. JharkhandDepot'), href: '/#brand-story' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0b0c10]/90 backdrop-blur-md border-b border-white/5 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-white/80 hover:text-accent-teal transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-white">
                INFINITY<span className="text-accent-teal">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] tracking-[0.3em] text-white/40 uppercase font-light pt-1.5 border-l border-white/20 pl-2">
                Traders
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase font-light premium-underline ${
                    pathname === link.href ? 'text-accent-teal' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user && user.role !== 'CUSTOMER' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs bg-accent-teal/10 border border-accent-teal/30 px-3 py-1 rounded text-accent-teal hover:bg-accent-teal/20 transition-colors uppercase tracking-widest font-semibold"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold border border-white/10 hover:border-accent-teal px-2 py-1 rounded text-white/80 hover:text-accent-teal transition-colors"
                title="Toggle Language / भाषा बदलें"
              >
                {language === 'en' ? 'हिन्दी' : 'EN'}
              </button>
              {user ? (
                <div className="relative group flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 text-white/75 hover:text-accent-teal transition-colors text-sm"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="hidden md:inline font-light tracking-wider text-xs">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1f2833]/95 border border-white/10 rounded-md py-2 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 backdrop-blur-md">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-xs text-white/75 hover:bg-white/5 hover:text-accent-teal tracking-widest uppercase"
                    >
                      Dashboard
                    </Link>
                    {user.role !== 'CUSTOMER' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-xs text-accent-teal hover:bg-white/5 tracking-widest uppercase"
                      >
                        Admin Control
                      </Link>
                    )}
                    <hr className="border-white/10 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs text-red-400 hover:bg-white/5 tracking-widest uppercase"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/account"
                  className="text-white/75 hover:text-accent-teal transition-colors"
                  aria-label="Login Account"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-white/75 hover:text-accent-teal transition-colors p-1"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-accent-teal text-background text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-between justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#0b0c10] border-r border-white/5 z-50 flex flex-col p-6 shadow-2xl justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <span className="text-xl font-bold tracking-widest text-white">
                    INFINITY<span className="text-accent-teal">.</span>
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base tracking-widest uppercase font-light ${
                        pathname === link.href ? 'text-accent-teal' : 'text-white/70'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {user && user.role !== 'CUSTOMER' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base tracking-widest uppercase font-semibold text-accent-teal flex items-center gap-2 border-t border-white/5 pt-4"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      {t('nav.admin')}
                    </Link>
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-xs text-white/50 tracking-wider">
                      Logged in as <span className="text-white">{user.name}</span>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary w-full text-center py-2 text-xs uppercase tracking-widest"
                    >
                      {t('nav.account')}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-center py-2 text-xs uppercase tracking-widest text-red-400 border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full text-center block py-2.5 text-xs uppercase tracking-widest"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
