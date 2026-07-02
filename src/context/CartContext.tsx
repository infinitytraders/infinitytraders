'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon } from '@/lib/db';
import { applyCouponAction, checkPincodeAction, getSettingsAction } from '@/app/actions';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string | number;
}

interface CartContextType {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity: number, size: string | number) => void;
  removeFromCart: (productId: string, size: string | number) => void;
  updateQuantity: (productId: string, size: string | number, quantity: number) => void;
  clearCart: () => void;
  
  // Coupon
  coupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Financials
  subtotal: number;
  gstAmount: number;
  shippingCharges: number;
  finalAmount: number;
  freeShippingProgress: number;
  shippingSettings: { standardShippingFee: number; freeShippingThreshold: number };

  // Pincode check
  pincode: string;
  setPincode: (pin: string) => void;
  pincodeStatus: { checked: boolean; serviceable: boolean; days?: number; state?: string; error?: string };
  checkPincodeServiceability: (pin: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [shippingSettings, setShippingSettings] = useState({ standardShippingFee: 99, freeShippingThreshold: 999 });

  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    serviceable: boolean;
    days?: number;
    state?: string;
    error?: string;
  }>({ checked: false, serviceable: false });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('infinity_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }

    // Load shipping settings from DB
    getSettingsAction().then(settings => {
      if (settings) {
        setShippingSettings(settings);
      }
    });
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('infinity_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity: number, size: string | number) => {
    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && item.size === size
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity, size });
    }

    saveCart(newCart);
    setCartOpen(true); // Auto-open cart drawer for smooth shopping feedback
  };

  const removeFromCart = (productId: string, size: string | number) => {
    const newCart = cart.filter(item => !(item.product.id === productId && item.size === size));
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, size: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const newCart = cart.map(item =>
      item.product.id === productId && item.size === size ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  // Re-calculate coupon discount when cart subtotal changes
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  useEffect(() => {
    if (coupon) {
      if (subtotal < coupon.minOrderValue) {
        setCoupon(null);
        setCouponDiscount(0);
        setCouponError(`Coupon removed. Minimum order value is ₹${coupon.minOrderValue}.`);
      } else {
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discount = coupon.discountValue;
        }
        setCouponDiscount(discount);
        setCouponError(null);
      }
    }
  }, [subtotal, coupon]);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    const res = await applyCouponAction(code, subtotal);
    if (res.success && res.coupon && res.discountValue !== undefined) {
      setCoupon(res.coupon);
      setCouponDiscount(res.discountValue);
      return true;
    } else {
      setCouponError(res.error || 'Failed to apply coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  const checkPincodeServiceability = async (pin: string) => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setPincodeStatus({ checked: true, serviceable: false, error: 'Invalid pincode format. Must be 6 digits.' });
      return;
    }
    const res = await checkPincodeAction(pin);
    if (res.serviceable) {
      setPincodeStatus({
        checked: true,
        serviceable: true,
        days: res.estimatedDays,
        state: res.state
      });
    } else {
      setPincodeStatus({
        checked: true,
        serviceable: false,
        error: res.error || 'Unserviceable pincode.'
      });
    }
  };

  // Calculations
  const getShippingForPincode = (pin: string): number => {
    if (!pin || pin.length !== 6) return 150; // default local shipping fee
    
    // Local Jharkhand / Dhanbad starts with 82 (e.g. 826001, 828116)
    if (pin.startsWith('82')) return 150;
    
    // Rest of Jharkhand / Bihar starts with 8
    if (pin.startsWith('8')) return 200;
    
    const firstDigit = pin[0];
    switch (firstDigit) {
      case '1':
      case '2': // North India (DL, HR, PB, UP, UA)
        return 250;
      case '3':
      case '4': // West & Central India (MH, GJ, MP, RJ, CG)
        return 300;
      case '5':
      case '6': // South India (KA, AP, TN, KL, TS)
        return 350;
      case '7': // East & North-East (WB, OR, NE states, Sikkim)
        return 400;
      case '9': // Army / remote / special regions
        return 500;
      default:
        return 250;
    }
  };

  const shippingCharges = subtotal === 0 ? 0 : getShippingForPincode(pincode);
  
  // 18% GST calculation (included in selling price as per Indian standard retail display, but shown as breakdown)
  // Selling Price = Base Price + GST (18%)
  // Base Price = Selling Price / 1.18
  // GST Amount = Selling Price - Base Price
  const gstAmount = Math.round(subtotal - subtotal / 1.18);
  
  const finalAmount = Math.max(0, subtotal - couponDiscount + shippingCharges);
  
  const freeShippingProgress = 0; // Disabled as shipping charges always apply based on pincode now

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        
        coupon,
        couponDiscount,
        couponError,
        applyCouponCode,
        removeCoupon,

        subtotal,
        gstAmount,
        shippingCharges,
        finalAmount,
        freeShippingProgress,
        shippingSettings,

        pincode,
        setPincode,
        pincodeStatus,
        checkPincodeServiceability
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
