import { Pool } from '@neondatabase/serverless';

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') || process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

// Interface Definitions
export interface Product {
  id: string;
  sku: string;
  brand: string;
  category: string; // 'Footwear' | 'Slippers' | 'Apparel' | 'Accessories'
  name: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  stockQuantity: number;
  color: string;
  material: string;
  width: string; // 'Standard' | 'Wide' | 'Narrow'
  sizes: (string | number)[]; // Indian Sizes, e.g. [6, 7, 8, 9, 10, 11] or ['S', 'M', 'L']
  images: string[];
  videos?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  averageRating: number;
  reviewsCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  categoryRestriction?: string;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  quantity: number;
  size: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  orderValue: number; // Subtotal before GST and shipping
  gstAmount: number; // 18% CGST + SGST combined
  shippingCharges: number;
  couponApplied?: string;
  finalAmount: number;
  paymentMethod: 'COD' | 'RAZORPAY';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  courierName?: string;
  trackingNumber?: string;
  dispatchDetails?: string;
  delhiveryTracking?: any;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  mobile: string;
  passwordHash: string;
  name: string;
  role: 'SUPER_ADMIN' | 'STORE_MANAGER' | 'MARKETING_MANAGER' | 'CUSTOMER_SUPPORT' | 'CUSTOMER';
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  wishlist: string[]; // Product IDs
  recentlyViewed: string[]; // Product IDs
  createdAt: string;
}

export interface PincodeServiceability {
  pincode: string;
  serviceable: boolean;
  estimatedDays: number;
  state: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface NewsletterSubscriber {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscribedAt: string;
}

// Database Schema interface
export interface DatabaseSchema {
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  users: User[];
  pincodes: PincodeServiceability[];
  auditLogs: AuditLog[];
  settings: {
    standardShippingFee: number;
    freeShippingThreshold: number;
  };
}

// DB Row mapping helper functions
function mapProductFromDb(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    brand: row.brand,
    category: row.category,
    name: row.name,
    description: row.description,
    mrp: Number(row.mrp),
    sellingPrice: Number(row.selling_price),
    discountPercentage: Number(row.discount_percentage),
    stockQuantity: Number(row.stock_quantity),
    color: row.color,
    material: row.material,
    width: row.width,
    sizes: Array.isArray(row.sizes) ? row.sizes : JSON.parse(JSON.stringify(row.sizes || '[]')),
    images: Array.isArray(row.images) ? row.images : JSON.parse(JSON.stringify(row.images || '[]')),
    videos: Array.isArray(row.videos) ? row.videos : JSON.parse(JSON.stringify(row.videos || '[]')),
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    isNewArrival: Boolean(row.is_new_arrival),
    isBestSeller: Boolean(row.is_best_seller),
    isTrending: Boolean(row.is_trending),
    averageRating: Number(row.average_rating),
    reviewsCount: Number(row.reviews_count)
  };
}

function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    email: row.email,
    mobile: row.mobile,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role as any,
    addresses: Array.isArray(row.addresses) ? row.addresses : JSON.parse(JSON.stringify(row.addresses || '[]')),
    wishlist: Array.isArray(row.wishlist) ? row.wishlist : JSON.parse(JSON.stringify(row.wishlist || '[]')),
    recentlyViewed: Array.isArray(row.recently_viewed) ? row.recently_viewed : JSON.parse(JSON.stringify(row.recently_viewed || '[]')),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  };
}

function mapCouponFromDb(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type as any,
    discountValue: Number(row.discount_value),
    minOrderValue: Number(row.min_order_value),
    categoryRestriction: row.category_restriction || undefined,
    isActive: Boolean(row.is_active)
  };
}

function mapPincodeFromDb(row: any): PincodeServiceability {
  return {
    pincode: row.pincode,
    serviceable: Boolean(row.serviceable),
    estimatedDays: Number(row.estimated_days),
    state: row.state
  };
}

function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerMobile: row.customer_mobile,
    shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    orderValue: Number(row.order_value),
    gstAmount: Number(row.gst_amount),
    shippingCharges: Number(row.shipping_charges),
    couponApplied: row.coupon_applied || undefined,
    finalAmount: Number(row.final_amount),
    paymentMethod: row.payment_method as any,
    paymentStatus: row.payment_status as any,
    orderStatus: row.order_status as any,
    courierName: row.courier_name || undefined,
    trackingNumber: row.tracking_number || undefined,
    dispatchDetails: row.dispatch_details || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  };
}

function mapAuditLogFromDb(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    action: row.action,
    details: row.details,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp)
  };
}

function mapNewsletterSubscriberFromDb(row: any): NewsletterSubscriber {
  return {
    id: row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    email: row.email,
    subscribedAt: row.subscribed_at instanceof Date ? row.subscribed_at.toISOString() : String(row.subscribed_at)
  };
}

export const db = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const res = await pool.query('SELECT * FROM products');
    return res.rows.map(mapProductFromDb);
  },

  async getProductById(id: string): Promise<Product | null> {
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapProductFromDb(res.rows[0]);
  },

  async createProduct(product: Omit<Product, 'id' | 'averageRating' | 'reviewsCount'>): Promise<Product> {
    const id = `prod_${Date.now()}`;
    const query = `
      INSERT INTO products (
        id, sku, brand, category, name, description, mrp, selling_price,
        discount_percentage, stock_quantity, color, material, width,
        sizes, images, videos, seo_title, seo_description,
        is_new_arrival, is_best_seller, is_trending, average_rating, reviews_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;
    const res = await pool.query(query, [
      id, product.sku, product.brand, product.category, product.name, product.description,
      product.mrp, product.sellingPrice, product.discountPercentage, product.stockQuantity,
      product.color, product.material, product.width,
      JSON.stringify(product.sizes), JSON.stringify(product.images), JSON.stringify(product.videos || []),
      product.seoTitle || null, product.seoDescription || null,
      product.isNewArrival, product.isBestSeller, product.isTrending,
      5.0, 0
    ]);
    return mapProductFromDb(res.rows[0]);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const mappings: { [key: string]: string } = {
      sku: 'sku',
      brand: 'brand',
      category: 'category',
      name: 'name',
      description: 'description',
      mrp: 'mrp',
      sellingPrice: 'selling_price',
      discountPercentage: 'discount_percentage',
      stockQuantity: 'stock_quantity',
      color: 'color',
      material: 'material',
      width: 'width',
      sizes: 'sizes',
      images: 'images',
      videos: 'videos',
      seoTitle: 'seo_title',
      seoDescription: 'seo_description',
      isNewArrival: 'is_new_arrival',
      isBestSeller: 'is_best_seller',
      isTrending: 'is_trending',
      averageRating: 'average_rating',
      reviewsCount: 'reviews_count'
    };

    for (const [key, val] of Object.entries(updates)) {
      const dbCol = mappings[key];
      if (dbCol) {
        fields.push(`${dbCol} = $${paramIndex}`);
        if (['sizes', 'images', 'videos'].includes(key)) {
          values.push(JSON.stringify(val));
        } else {
          values.push(val);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getProductById(id);
    }

    values.push(id);
    const query = `
      UPDATE products 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    const res = await pool.query(query, values);
    if (res.rows.length === 0) return null;
    return mapProductFromDb(res.rows[0]);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  },

  // USERS
  async getUsers(): Promise<User[]> {
    const res = await pool.query('SELECT * FROM users');
    return res.rows.map(mapUserFromDb);
  },

  async getUserById(id: string): Promise<User | null> {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapUserFromDb(res.rows[0]);
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return null;
    return mapUserFromDb(res.rows[0]);
  },

  async getUserByMobile(mobile: string): Promise<User | null> {
    const res = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    if (res.rows.length === 0) return null;
    return mapUserFromDb(res.rows[0]);
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'addresses' | 'wishlist' | 'recentlyViewed'>): Promise<User> {
    const id = `u_${Date.now()}`;
    const query = `
      INSERT INTO users (
        id, email, mobile, password_hash, name, role, addresses, wishlist, recently_viewed, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const res = await pool.query(query, [
      id, user.email, user.mobile, user.passwordHash, user.name, user.role,
      JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), new Date().toISOString()
    ]);
    return mapUserFromDb(res.rows[0]);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const mappings: { [key: string]: string } = {
      email: 'email',
      mobile: 'mobile',
      passwordHash: 'password_hash',
      name: 'name',
      role: 'role',
      addresses: 'addresses',
      wishlist: 'wishlist',
      recentlyViewed: 'recently_viewed'
    };

    for (const [key, val] of Object.entries(updates)) {
      const dbCol = mappings[key];
      if (dbCol) {
        fields.push(`${dbCol} = $${paramIndex}`);
        if (['addresses', 'wishlist', 'recentlyViewed'].includes(key)) {
          values.push(JSON.stringify(val));
        } else {
          values.push(val);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    const res = await pool.query(query, values);
    if (res.rows.length === 0) return null;
    return mapUserFromDb(res.rows[0]);
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    const res = await pool.query('SELECT * FROM coupons');
    return res.rows.map(mapCouponFromDb);
  },

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const res = await pool.query('SELECT * FROM coupons WHERE LOWER(code) = LOWER($1) AND is_active = TRUE', [code]);
    if (res.rows.length === 0) return null;
    return mapCouponFromDb(res.rows[0]);
  },

  async createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    const id = `c_${Date.now()}`;
    const query = `
      INSERT INTO coupons (
        id, code, discount_type, discount_value, min_order_value, category_restriction, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await pool.query(query, [
      id, coupon.code, coupon.discountType, coupon.discountValue, coupon.minOrderValue,
      coupon.categoryRestriction || null, coupon.isActive
    ]);
    return mapCouponFromDb(res.rows[0]);
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const mappings: { [key: string]: string } = {
      code: 'code',
      discountType: 'discount_type',
      discountValue: 'discount_value',
      minOrderValue: 'min_order_value',
      categoryRestriction: 'category_restriction',
      isActive: 'is_active'
    };

    for (const [key, val] of Object.entries(updates)) {
      const dbCol = mappings[key];
      if (dbCol) {
        fields.push(`${dbCol} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      const res = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
      return res.rows[0] ? mapCouponFromDb(res.rows[0]) : null;
    }

    values.push(id);
    const query = `
      UPDATE coupons 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    const res = await pool.query(query, values);
    if (res.rows.length === 0) return null;
    return mapCouponFromDb(res.rows[0]);
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  },

  // PINCODES
  async checkPincode(pincode: string): Promise<PincodeServiceability | null> {
    const res = await pool.query('SELECT * FROM pincodes WHERE pincode = $1', [pincode]);
    if (res.rows.length === 0) return null;
    return mapPincodeFromDb(res.rows[0]);
  },

  async getPincodes(): Promise<PincodeServiceability[]> {
    const res = await pool.query('SELECT * FROM pincodes');
    return res.rows.map(mapPincodeFromDb);
  },

  async addOrUpdatePincode(pincode: string, serviceability: Omit<PincodeServiceability, 'pincode'>): Promise<PincodeServiceability> {
    const query = `
      INSERT INTO pincodes (pincode, serviceable, estimated_days, state)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (pincode) DO UPDATE SET
        serviceable = EXCLUDED.serviceable,
        estimated_days = EXCLUDED.estimated_days,
        state = EXCLUDED.state
      RETURNING *
    `;
    const res = await pool.query(query, [
      pincode, serviceability.serviceable, serviceability.estimatedDays, serviceability.state
    ]);
    return mapPincodeFromDb(res.rows[0]);
  },

  async deletePincode(pincode: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM pincodes WHERE pincode = $1', [pincode]);
    return (res.rowCount ?? 0) > 0;
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const res = await pool.query('SELECT * FROM orders');
    return res.rows.map(mapOrderFromDb);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const res = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapOrderFromDb(res.rows[0]);
  },

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>): Promise<Order> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const id = `ORD_${Date.now()}`;
      const orderStatus = 'PENDING';
      const paymentStatus = orderData.paymentMethod === 'COD' ? 'PENDING' : 'PAID';
      const createdAt = new Date().toISOString();

      // 1. Deduct stock for each item
      for (const item of orderData.items) {
        await client.query(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      // 2. Insert order
      const insertQuery = `
        INSERT INTO orders (
          id, customer_name, customer_email, customer_mobile, shipping_address, items,
          order_value, gst_amount, shipping_charges, coupon_applied, final_amount,
          payment_method, payment_status, order_status, courier_name, tracking_number,
          dispatch_details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;
      const res = await client.query(insertQuery, [
        id, orderData.customerName, orderData.customerEmail, orderData.customerMobile,
        JSON.stringify(orderData.shippingAddress), JSON.stringify(orderData.items),
        orderData.orderValue, orderData.gstAmount, orderData.shippingCharges,
        orderData.couponApplied || null, orderData.finalAmount, orderData.paymentMethod,
        paymentStatus, orderStatus, null, null, null, createdAt
      ]);

      await client.query('COMMIT');
      return mapOrderFromDb(res.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const mappings: { [key: string]: string } = {
      customerName: 'customer_name',
      customerEmail: 'customer_email',
      customerMobile: 'customer_mobile',
      shippingAddress: 'shipping_address',
      items: 'items',
      orderValue: 'order_value',
      gstAmount: 'gst_amount',
      shippingCharges: 'shipping_charges',
      couponApplied: 'coupon_applied',
      finalAmount: 'final_amount',
      paymentMethod: 'payment_method',
      paymentStatus: 'payment_status',
      orderStatus: 'order_status',
      courierName: 'courier_name',
      trackingNumber: 'tracking_number',
      dispatchDetails: 'dispatch_details'
    };

    for (const [key, val] of Object.entries(updates)) {
      const dbCol = mappings[key];
      if (dbCol) {
        fields.push(`${dbCol} = $${paramIndex}`);
        if (['shippingAddress', 'items'].includes(key)) {
          values.push(JSON.stringify(val));
        } else {
          values.push(val);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getOrderById(id);
    }

    values.push(id);
    const query = `
      UPDATE orders 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    const res = await pool.query(query, values);
    if (res.rows.length === 0) return null;
    return mapOrderFromDb(res.rows[0]);
  },

  // SETTINGS
  async getSettings(): Promise<{ standardShippingFee: number; freeShippingThreshold: number }> {
    const res = await pool.query('SELECT * FROM settings');
    const feeRow = res.rows.find(r => r.key === 'shipping_fee');
    const thresholdRow = res.rows.find(r => r.key === 'free_shipping_threshold');
    
    return {
      standardShippingFee: feeRow ? Number(feeRow.value) : 99,
      freeShippingThreshold: thresholdRow ? Number(thresholdRow.value) : 999
    };
  },

  async updateSettings(updates: Partial<{ standardShippingFee: number; freeShippingThreshold: number }>): Promise<any> {
    if (updates.standardShippingFee !== undefined) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        ['shipping_fee', JSON.stringify(updates.standardShippingFee)]
      );
    }
    if (updates.freeShippingThreshold !== undefined) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        ['free_shipping_threshold', JSON.stringify(updates.freeShippingThreshold)]
      );
    }
    return this.getSettings();
  },

  // AUDIT LOGS
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    return res.rows.map(mapAuditLogFromDb);
  },

  async createAuditLog(userId: string, userEmail: string, action: string, details: string): Promise<AuditLog> {
    const id = `log_${Date.now()}`;
    const query = `
      INSERT INTO audit_logs (id, user_id, user_email, action, details, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await pool.query(query, [
      id, userId, userEmail, action, details, new Date().toISOString()
    ]);
    return mapAuditLogFromDb(res.rows[0]);
  },

  // NEWSLETTER
  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    const res = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    return res.rows.map(mapNewsletterSubscriberFromDb);
  },

  async subscribeToNewsletter(firstName: string, lastName: string, email: string): Promise<NewsletterSubscriber> {
    const id = `sub_${Date.now()}`;
    const query = `
      INSERT INTO newsletter_subscribers (id, first_name, last_name, email, subscribed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        subscribed_at = EXCLUDED.subscribed_at
      RETURNING *
    `;
    const res = await pool.query(query, [
      id, firstName, lastName, email.trim(), new Date().toISOString()
    ]);
    return mapNewsletterSubscriberFromDb(res.rows[0]);
  },

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM newsletter_subscribers WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    return (res.rowCount ?? 0) > 0;
  }
};
