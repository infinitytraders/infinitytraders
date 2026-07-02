'use server';

import { db, Product, Order, User, Coupon, PincodeServiceability, AuditLog, NewsletterSubscriber } from '@/lib/db';
import { cookies } from 'next/headers';
import { 
  sendOrderConfirmationEmail, 
  sendOrderStatusUpdateEmail, 
  sendNewsletterWelcomeEmail, 
  sendContactQueryEmail,
  sendOtpEmail
} from '@/lib/email';

// --- SESSION UTILITIES ---
export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('infinity_session');
    if (!session || !session.value) return null;
    const userData = JSON.parse(session.value);
    // Refresh user from db to get latest details (like addresses, wishlist)
    const user = await db.getUserById(userData.id);
    return user || null;
  } catch (error) {
    return null;
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('infinity_session');
}

// --- AUTHENTICATION ACTIONS ---
export async function loginAction(
  identifier: string, // Email or Mobile
  password?: string,
  isOtp: boolean = false
): Promise<{ success: boolean; error?: string; user?: Omit<User, 'passwordHash'> }> {
  try {
    let user: User | null = null;
    if (identifier.includes('@')) {
      user = await db.getUserByEmail(identifier);
    } else {
      user = await db.getUserByMobile(identifier);
    }

    if (!user) {
      // If it is OTP login, register customer automatically if they don't exist
      if (isOtp) {
        user = await db.createUser({
          email: identifier.includes('@') ? identifier : `${identifier}@customer.com`,
          mobile: identifier.includes('@') ? '9999999999' : identifier,
          passwordHash: 'otp_user_pwd',
          name: identifier.split('@')[0],
          role: 'CUSTOMER'
        });
        await db.createAuditLog(user.id, user.email, 'USER_REGISTER_OTP', `User registered via OTP with identifier: ${identifier}`);
      } else {
        return { success: false, error: 'Account not found. Please register or use OTP.' };
      }
    }

    if (!isOtp && password && user.passwordHash !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    // Save session
    const cookieStore = await cookies();
    cookieStore.set('infinity_session', JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    await db.createAuditLog(user.id, user.email, 'USER_LOGIN', `Logged in successfully. OTP: ${isOtp}`);

    const { passwordHash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error: any) {
    return { success: false, error: error.message || 'Login failed.' };
  }
}

export async function registerAction(data: {
  name: string;
  email: string;
  mobile: string;
  password?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const existingEmail = await db.getUserByEmail(data.email);
    if (existingEmail) return { success: false, error: 'Email already registered.' };

    const existingMobile = await db.getUserByMobile(data.mobile);
    if (existingMobile) return { success: false, error: 'Mobile number already registered.' };

    const newUser = await db.createUser({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      passwordHash: data.password || 'password123',
      role: 'CUSTOMER'
    });

    await db.createAuditLog(newUser.id, newUser.email, 'USER_REGISTER', `Created account with email: ${data.email}`);

    // Log in automatically
    return await loginAction(newUser.email, data.password || 'password123', false);
  } catch (error: any) {
    return { success: false, error: error.message || 'Registration failed.' };
  }
}

// --- PRODUCT ACTIONS ---
export async function getProductsAction(): Promise<Product[]> {
  return await db.getProducts();
}

export async function getProductByIdAction(id: string): Promise<Product | null> {
  return await db.getProductById(id);
}

export async function createProductAction(
  productData: Omit<Product, 'id' | 'averageRating' | 'reviewsCount'>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const product = await db.createProduct(productData);
    await db.createAuditLog(currentUser.id, currentUser.email, 'PRODUCT_CREATE', `Created product ${product.name} (SKU: ${product.sku})`);
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create product.' };
  }
}

export async function updateProductAction(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const product = await db.updateProduct(id, updates);
    if (!product) return { success: false, error: 'Product not found.' };

    await db.createAuditLog(currentUser.id, currentUser.email, 'PRODUCT_UPDATE', `Updated product ${product.name} (SKU: ${product.sku})`);
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product.' };
  }
}

export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const product = await db.getProductById(id);
    if (!product) return { success: false, error: 'Product not found.' };

    const success = await db.deleteProduct(id);
    if (success) {
      await db.createAuditLog(currentUser.id, currentUser.email, 'PRODUCT_DELETE', `Deleted product ${product.name} (SKU: ${product.sku})`);
      return { success: true };
    }
    return { success: false, error: 'Delete failed.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product.' };
  }
}

export async function bulkUploadProductsAction(productsArray: any[]): Promise<{ success: boolean; count: number; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER')) {
    return { success: false, count: 0, error: 'Unauthorized.' };
  }

  try {
    let count = 0;
    for (const p of productsArray) {
      if (!p.name || !p.sku || !p.sellingPrice) continue;
      await db.createProduct({
        sku: p.sku,
        brand: p.brand || 'Infinity Brand',
        category: p.category || 'Footwear',
        name: p.name,
        description: p.description || '',
        mrp: Number(p.mrp) || Number(p.sellingPrice) * 1.2,
        sellingPrice: Number(p.sellingPrice),
        discountPercentage: Number(p.discountPercentage) || 0,
        stockQuantity: Number(p.stockQuantity) || 10,
        color: p.color || 'Black',
        material: p.material || 'Synthetic',
        width: p.width || 'Standard',
        sizes: Array.isArray(p.sizes) ? p.sizes : [7, 8, 9, 10],
        images: Array.isArray(p.images) ? p.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
        isNewArrival: !!p.isNewArrival,
        isBestSeller: !!p.isBestSeller,
        isTrending: !!p.isTrending
      });
      count++;
    }
    await db.createAuditLog(currentUser.id, currentUser.email, 'PRODUCT_BULK_UPLOAD', `Uploaded ${count} products via bulk tool.`);
    return { success: true, count };
  } catch (error: any) {
    return { success: false, count: 0, error: error.message || 'Bulk upload failed.' };
  }
}

// --- PINCODE ACTIONS ---
export async function checkPincodeAction(pincode: string): Promise<{ serviceable: boolean; estimatedDays?: number; state?: string; error?: string }> {
  try {
    const item = await db.checkPincode(pincode);
    if (item && item.serviceable) {
      return { serviceable: true, estimatedDays: item.estimatedDays, state: item.state };
    }
    // Simple simulated serviceability for standard Indian pincodes if not explicitly defined
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      // Seed default serviceability for demo convenience
      return { serviceable: true, estimatedDays: 4, state: 'India (Standard Route)' };
    }
    return { serviceable: false, error: 'Delivery unavailable to this pincode.' };
  } catch (error) {
    return { serviceable: false, error: 'Failed to verify pincode.' };
  }
}

export async function getPincodesAction(): Promise<{ success: boolean; pincodes?: PincodeServiceability[]; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER' && currentUser.role !== 'CUSTOMER_SUPPORT')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const pincodes = await db.getPincodes();
    return { success: true, pincodes };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch pincodes.' };
  }
}

export async function addOrUpdatePincodeAction(
  pincode: string,
  serviceability: Omit<PincodeServiceability, 'pincode'>
): Promise<{ success: boolean; pincode?: PincodeServiceability; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const item = await db.addOrUpdatePincode(pincode, serviceability);
    await db.createAuditLog(
      currentUser.id,
      currentUser.email,
      'PINCODE_MANAGE',
      `Set pincode ${pincode} serviceability: serviceable=${serviceability.serviceable}, days=${serviceability.estimatedDays}, state=${serviceability.state}`
    );
    return { success: true, pincode: item };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update pincode.' };
  }
}

export async function deletePincodeAction(pincode: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'STORE_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const success = await db.deletePincode(pincode);
    if (success) {
      await db.createAuditLog(
        currentUser.id,
        currentUser.email,
        'PINCODE_DELETE',
        `Deleted pincode ${pincode} from serviceability database`
      );
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete pincode.' };
  }
}

// --- COUPON ACTIONS ---
export async function applyCouponAction(
  code: string,
  cartTotal: number,
  categoryRestriction?: string
): Promise<{ success: boolean; discountValue?: number; coupon?: Coupon; error?: string }> {
  try {
    const coupon = await db.getCouponByCode(code);
    if (!coupon) return { success: false, error: 'Invalid or inactive coupon code.' };

    if (cartTotal < coupon.minOrderValue) {
      return { success: false, error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}.` };
    }

    if (coupon.categoryRestriction && categoryRestriction && coupon.categoryRestriction.toLowerCase() !== categoryRestriction.toLowerCase()) {
      return { success: false, error: `This coupon is only valid for the ${coupon.categoryRestriction} category.` };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((cartTotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    return { success: true, discountValue: discount, coupon };
  } catch (error) {
    return { success: false, error: 'Failed to validate coupon.' };
  }
}

export async function getCouponsAction(): Promise<Coupon[]> {
  return await db.getCoupons();
}

export async function createCouponAction(coupon: Omit<Coupon, 'id'>): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'MARKETING_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const newCoupon = await db.createCoupon(coupon);
    await db.createAuditLog(currentUser.id, currentUser.email, 'COUPON_CREATE', `Created coupon code: ${newCoupon.code}`);
    return { success: true, coupon: newCoupon };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCouponAction(id: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'MARKETING_MANAGER')) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const success = await db.deleteCoupon(id);
    if (success) {
      await db.createAuditLog(currentUser.id, currentUser.email, 'COUPON_DELETE', `Deleted coupon ID: ${id}`);
      return { success: true };
    }
    return { success: false, error: 'Coupon not found.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- ORDER ACTIONS ---
export async function createOrderAction(orderData: {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: any[];
  orderValue: number;
  gstAmount: number;
  shippingCharges: number;
  couponApplied?: string;
  finalAmount: number;
  paymentMethod: 'COD' | 'RAZORPAY';
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const user = await getSessionUser();
    const newOrder = await db.createOrder({
      ...orderData,
      paymentMethod: orderData.paymentMethod
    });

    if (user) {
      // Add address to user profile if not exists
      const addressExists = user.addresses.some(
        a => a.pincode === orderData.shippingAddress.pincode && a.street === orderData.shippingAddress.street
      );
      if (!addressExists) {
        const updatedAddresses = [
          ...user.addresses,
          {
            id: `addr_${Date.now()}`,
            street: orderData.shippingAddress.street,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            pincode: orderData.shippingAddress.pincode,
            isDefault: user.addresses.length === 0
          }
        ];
        await db.updateUser(user.id, { addresses: updatedAddresses });
      }
      await db.createAuditLog(user.id, user.email, 'ORDER_CREATE', `Created order: ${newOrder.id} for amount ₹${newOrder.finalAmount}`);
    } else {
      await db.createAuditLog('guest', orderData.customerEmail, 'ORDER_CREATE_GUEST', `Guest created order: ${newOrder.id} for amount ₹${newOrder.finalAmount}`);
    }

    try {
      await sendOrderConfirmationEmail(newOrder);
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr);
    }

    return { success: true, order: newOrder };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to place order.' };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  updates: Partial<Order>
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role === 'CUSTOMER') {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const order = await db.updateOrder(orderId, updates);
    if (!order) return { success: false, error: 'Order not found.' };

    await db.createAuditLog(
      currentUser.id,
      currentUser.email,
      'ORDER_STATUS_UPDATE',
      `Updated order ${orderId}: status=${order.orderStatus}, tracking=${order.trackingNumber || 'N/A'}`
    );

    if (updates.orderStatus === 'DISPATCHED' || updates.orderStatus === 'DELIVERED') {
      try {
        await sendOrderStatusUpdateEmail(order);
      } catch (emailErr) {
        console.error('Failed to send order status update email:', emailErr);
      }
    }

    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update order.' };
  }
}

export async function getOrdersAction(): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const allOrders = await db.getOrders();
    if (user.role === 'CUSTOMER') {
      const customerOrders = allOrders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
      return { success: true, orders: customerOrders };
    }

    // Admins and managers can view all orders
    return { success: true, orders: allOrders };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function trackOrderAction(
  orderId: string,
  emailOrMobile: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    if (!orderId || !emailOrMobile) {
      return { success: false, error: 'Order ID and Email/Mobile are required.' };
    }

    const order = await db.getOrderById(orderId.trim());
    if (!order) {
      return { success: false, error: 'Order not found. Check Order ID.' };
    }

    const inputClean = emailOrMobile.trim().toLowerCase();
    const orderEmailClean = order.customerEmail.toLowerCase();
    const orderMobileClean = order.customerMobile.replace(/\D/g, '');
    const inputMobileClean = inputClean.replace(/\D/g, '');

    const emailMatch = orderEmailClean === inputClean;
    const mobileMatch = orderMobileClean === inputMobileClean && inputMobileClean.length >= 10;

    if (!emailMatch && !mobileMatch) {
      return { success: false, error: 'Contact details do not match this order.' };
    }

    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error looking up order.' };
  }
}

// --- USER PROFILE & WISHLIST ACTIONS ---
export async function toggleWishlistAction(productId: string): Promise<{ success: boolean; wishlist?: string[]; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Login required to modify wishlist.' };

    const wishlist = [...user.wishlist];
    const index = wishlist.indexOf(productId);
    if (index === -1) {
      wishlist.push(productId);
    } else {
      wishlist.splice(index, 1);
    }

    await db.updateUser(user.id, { wishlist });
    return { success: true, wishlist };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordRecentlyViewedAction(productId: string): Promise<void> {
  try {
    const user = await getSessionUser();
    if (!user) return;

    let recentlyViewed = [...user.recentlyViewed];
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    recentlyViewed.unshift(productId);
    recentlyViewed = recentlyViewed.slice(0, 6); // Keep last 6 products

    await db.updateUser(user.id, { recentlyViewed });
  } catch (error) {
    // Fail silently for tracking
  }
}

// --- SETTINGS ACTIONS ---
export async function getSettingsAction() {
  return await db.getSettings();
}

export async function updateSettingsAction(updates: { standardShippingFee: number; freeShippingThreshold: number }) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const settings = await db.updateSettings(updates);
    await db.createAuditLog(currentUser.id, currentUser.email, 'SETTINGS_UPDATE', `Updated shipping settings: standard=${updates.standardShippingFee}, freeThreshold=${updates.freeShippingThreshold}`);
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- AUDIT LOG ACTIONS ---
export async function getAuditLogsAction(): Promise<{ success: boolean; logs?: AuditLog[]; error?: string }> {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized.' };
  }
  try {
    const logs = await db.getAuditLogs();
    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- ANALYTICS DASHBOARD METRICS ---
export async function getDashboardMetricsAction(): Promise<{
  success: boolean;
  metrics?: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{ name: string; brand: string; count: number; revenue: number }>;
    newCustomersCount: number;
    conversionRate: number;
    lowStockProducts: Product[];
    outOfStockCount: number;
  };
  error?: string;
}> {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role === 'CUSTOMER') {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const orders = await db.getOrders();
    const products = await db.getProducts();
    const users = await db.getUsers();

    // 1. Total Revenue (delivered or dispatched or pending paid orders)
    const paidOrders = orders.filter(o => o.paymentStatus === 'PAID' || o.orderStatus === 'DELIVERED' || o.orderStatus === 'DISPATCHED');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    // 2. Monthly Revenue (orders created in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = paidOrders
      .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.finalAmount, 0);

    // 3. Average Order Value
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // 4. Low stock products & out of stock count
    const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5);
    const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

    // 5. Top selling products
    const productSalesMap: Record<string, { name: string; brand: string; count: number; revenue: number }> = {};
    for (const order of paidOrders) {
      for (const item of order.items) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.name, brand: item.brand, count: 0, revenue: 0 };
        }
        productSalesMap[item.productId].count += item.quantity;
        productSalesMap[item.productId].revenue += item.price * item.quantity;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 6. Customers count (registered customers)
    const newCustomersCount = users.filter(u => u.role === 'CUSTOMER').length;

    // 7. Conversion Rate (Simulated metric based on visitor-to-order ratio)
    const conversionRate = orders.length > 0 ? Number(((orders.length / (orders.length * 12 + 140)) * 100).toFixed(1)) : 2.5;

    return {
      success: true,
      metrics: {
        totalRevenue,
        monthlyRevenue,
        totalOrders: orders.length,
        averageOrderValue,
        topProducts,
        newCustomersCount,
        conversionRate,
        lowStockProducts,
        outOfStockCount
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- NEWSLETTER SUBSCRIBER ACTIONS ---
export async function subscribeNewsletterAction(
  firstName: string,
  lastName: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.subscribeToNewsletter(firstName, lastName, email);

    try {
      await sendNewsletterWelcomeEmail(firstName, email);
    } catch (emailErr) {
      console.error('Failed to send newsletter welcome email:', emailErr);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Subscription failed.' };
  }
}

export async function getNewsletterSubscribersAction(): Promise<NewsletterSubscriber[]> {
  try {
    const user = await getSessionUser();
    if (!user || !['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING_MANAGER'].includes(user.role)) {
      throw new Error('Unauthorized access.');
    }
    return await db.getNewsletterSubscribers();
  } catch (error) {
    return [];
  }
}

export async function deleteNewsletterSubscriberAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user || !['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING_MANAGER'].includes(user.role)) {
      return { success: false, error: 'Unauthorized access.' };
    }
    const success = await db.unsubscribeFromNewsletter(email);
    if (success) {
      await db.createAuditLog(
        user.id,
        user.email,
        'NEWSLETTER_UNSUBSCRIBE',
        `Unsubscribed email: ${email} by admin: ${user.email}`
      );
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Operation failed.' };
  }
}

// --- CONTACT QUERY ACTION ---
export async function sendContactQueryAction(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await sendContactQueryEmail(name, email, subject, message);
    if (!success) {
      return { success: false, error: 'Failed to send query email.' };
    }
    
    // Create an audit log for support submissions
    await db.createAuditLog('support_form', email, 'SUPPORT_QUERY_SUBMIT', `Query from ${name}: Subject: ${subject}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit contact query.' };
  }
}

// --- OTP ACTIONS ---

/**
 * Generates a random 6-digit OTP code, saves it in a secure HttpOnly cookie, and sends it to the user's email.
 */
export async function sendOtpAction(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required for OTP verification.' };
    }

    // Generate random 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Send the code to the user's email
    const success = await sendOtpEmail(email, otpCode);
    if (!success) {
      return { success: false, error: 'Failed to send verification code. Please check your SMTP settings.' };
    }

    // Store the correct OTP in an encrypted or secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('infinity_otp_verification', JSON.stringify({ email, code: otpCode, expires: Date.now() + 5 * 60 * 1000 }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes validity
      path: '/'
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send OTP verification code.' };
  }
}

/**
 * Compares the user-supplied verification code with the stored cookie and logs the user in/registers them.
 */
export async function verifyOtpAction(
  email: string,
  userCode: string
): Promise<{ success: boolean; error?: string; user?: Omit<User, 'passwordHash'> }> {
  try {
    const cookieStore = await cookies();
    const storedOtpCookie = cookieStore.get('infinity_otp_verification');

    if (!storedOtpCookie || !storedOtpCookie.value) {
      return { success: false, error: 'Verification code expired or not found. Please request a new OTP.' };
    }

    const { email: storedEmail, code: storedCode, expires } = JSON.parse(storedOtpCookie.value);

    // Validate email and expiration
    if (storedEmail.toLowerCase() !== email.toLowerCase()) {
      return { success: false, error: 'Verification email mismatch. Please request a new OTP.' };
    }

    if (Date.now() > expires) {
      cookieStore.delete('infinity_otp_verification');
      return { success: false, error: 'Verification code expired. Please request a new OTP.' };
    }

    // Validate code
    if (storedCode !== userCode.trim()) {
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    // Clear the OTP verification cookie upon successful validation
    cookieStore.delete('infinity_otp_verification');

    // Automatically register/log in the user via OTP loginAction
    const loginRes = await loginAction(email, undefined, true);
    if (!loginRes.success) {
      return { success: false, error: loginRes.error || 'Failed to complete login.' };
    }

    return { success: true, user: loginRes.user };
  } catch (error: any) {
    return { success: false, error: error.message || 'OTP verification failed.' };
  }
}
