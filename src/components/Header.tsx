'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getSessionUser, logoutAction } from '@/app/actions';
import { ShoppingBag, User as UserIcon, Menu, X, ShieldAlert, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { cart, setCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
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
    { label: t('nav.home'), href: '/' },
    { label: t('nav.shop'), href: '/shop' },
    { label: t('home.newArrivals'), href: '/shop?filter=new' },
    { label: t('home.trending'), href: '/shop?filter=best' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-[#f4f3ef]/90 backdrop-blur-md border-b border-black/5 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            {/* 1. Brand Logo & Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-black/80 hover:text-black transition-colors"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <svg className="w-8 h-8 text-black" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 35 C15 35 15 65 30 65 C45 65 55 35 70 35 C85 35 85 65 70 65 C55 65 45 35 30 35 Z" 
                    stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="text-[12px] font-extrabold tracking-[0.2em] text-black uppercase">
                    INFINITY
                  </span>
                  <span className="text-[8px] font-light tracking-[0.25em] text-black/60 uppercase mt-0.5">
                    TRADERS
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Center Floating Capsule Navigation (Directly Inspired by ENA Athletics) */}
            <nav className="hidden lg:flex items-center bg-white/70 border border-black/5 rounded-full p-1 shadow-sm backdrop-blur-sm">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-[10px] tracking-widest uppercase font-semibold transition-all px-5 py-2 rounded-full ${
                      isActive
                        ? 'bg-black text-white shadow-xs'
                        : 'text-black/60 hover:text-black'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {user && user.role !== 'CUSTOMER' && (
                <Link
                  href="/admin"
                  className={`text-[10px] tracking-widest uppercase font-semibold transition-all px-5 py-2 rounded-full ${
                    pathname === '/admin' ? 'bg-black text-white' : 'text-accent-teal hover:bg-black/5'
                  }`}
                >
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            {/* 3. Right side Actions Dock */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="text-[10px] tracking-widest font-semibold text-black/60 hover:text-black transition-colors px-2 py-1 rounded"
              >
                {language === 'en' ? 'HI' : 'EN'}
              </button>

              {/* Search Icon */}
              <Link href="/shop" className="text-black/70 hover:text-black transition-colors" aria-label="Search">
                <Search className="w-4.5 h-4.5" />
              </Link>

              {/* Shopping Bag Button (Outlined Circle) */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-black/75 hover:text-black border border-black/10 hover:border-black/35 p-2 rounded-full transition-all flex items-center justify-center bg-white/50"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User login/signup capsules */}
              {user ? (
                <div className="relative group">
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 border border-black/10 hover:border-black/35 px-4.5 py-1.5 rounded-full text-black hover:text-black transition-all text-xs bg-white/50"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline font-semibold tracking-wider text-[10px] uppercase">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/5 rounded-md py-2 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 backdrop-blur-md">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-[10px] text-black/70 hover:bg-black/5 hover:text-black tracking-widest uppercase font-semibold"
                    >
                      Dashboard
                    </Link>
                    {user.role !== 'CUSTOMER' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-[10px] text-black/70 hover:bg-black/5 hover:text-black tracking-widest uppercase font-semibold"
                      >
                        Admin Control
                      </Link>
                    )}
                    <hr className="border-black/5 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-[10px] text-red-600 hover:bg-black/5 tracking-widest uppercase font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/account"
                    className="bg-black border border-black text-white hover:bg-transparent hover:text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/account?signup=true"
                    className="bg-white border border-black/10 hover:border-black text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Minimalist Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#f4f3ef] border-r border-black/5 z-50 flex flex-col p-6 shadow-2xl justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-black/5 pb-5">
                  <span className="text-sm font-black tracking-widest text-black uppercase">
                    INFINITY TRADERS
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-black/60 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-5 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xs tracking-widest uppercase font-semibold ${
                        pathname === link.href ? 'text-black' : 'text-black/50 hover:text-black'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {user && user.role !== 'CUSTOMER' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs tracking-widest uppercase font-semibold text-black flex items-center gap-2 border-t border-black/5 pt-4"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      {t('nav.admin')}
                    </Link>
                  )}
                </div>
              </div>

              <div className="border-t border-black/5 pt-5">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] text-black/50 tracking-wider">
                      Logged in as <span className="text-black font-semibold">{user.name}</span>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary w-full text-center py-2 text-[10px] uppercase tracking-widest font-bold"
                    >
                      {t('nav.account')}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-center py-2 text-[10px] uppercase tracking-widest text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors rounded-full font-bold"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary w-full text-center py-2.5 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Login
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary w-full text-center py-2.5 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
