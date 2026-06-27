const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString,
  });

  console.log('Connecting to PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');

  try {
    // 1. Create tables
    console.log('Creating tables if they do not exist...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        sku TEXT NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        mrp NUMERIC NOT NULL,
        selling_price NUMERIC NOT NULL,
        discount_percentage NUMERIC NOT NULL,
        stock_quantity INTEGER NOT NULL,
        color TEXT NOT NULL,
        material TEXT NOT NULL,
        width TEXT NOT NULL,
        sizes JSONB NOT NULL,
        images JSONB NOT NULL,
        videos JSONB,
        seo_title TEXT,
        seo_description TEXT,
        is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
        is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
        is_trending BOOLEAN NOT NULL DEFAULT FALSE,
        average_rating NUMERIC NOT NULL DEFAULT 5.0,
        reviews_count INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        discount_value NUMERIC NOT NULL,
        min_order_value NUMERIC NOT NULL,
        category_restriction TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_mobile TEXT NOT NULL,
        shipping_address JSONB NOT NULL,
        items JSONB NOT NULL,
        order_value NUMERIC NOT NULL,
        gst_amount NUMERIC NOT NULL,
        shipping_charges NUMERIC NOT NULL,
        coupon_applied TEXT,
        final_amount NUMERIC NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        order_status TEXT NOT NULL,
        courier_name TEXT,
        tracking_number TEXT,
        dispatch_details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        mobile TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
        wishlist JSONB NOT NULL DEFAULT '[]'::jsonb,
        recently_viewed JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pincodes (
        pincode TEXT PRIMARY KEY,
        serviceable BOOLEAN NOT NULL DEFAULT TRUE,
        estimated_days INTEGER NOT NULL DEFAULT 3,
        state TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);

    console.log('Tables verified/created successfully.');

    // 2. Load and migrate initial seed data from data/db.json
    const dbJsonPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbJsonPath)) {
      console.log('Reading local db.json data...');
      const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

      // Seed Products
      console.log('Upserting products...');
      for (const p of dbData.products || []) {
        await client.query(
          `INSERT INTO products (
            id, sku, brand, category, name, description, mrp, selling_price,
            discount_percentage, stock_quantity, color, material, width,
            sizes, images, videos, seo_title, seo_description,
            is_new_arrival, is_best_seller, is_trending, average_rating, reviews_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
          ON CONFLICT (id) DO UPDATE SET
            sku = EXCLUDED.sku,
            brand = EXCLUDED.brand,
            category = EXCLUDED.category,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            mrp = EXCLUDED.mrp,
            selling_price = EXCLUDED.selling_price,
            discount_percentage = EXCLUDED.discount_percentage,
            stock_quantity = EXCLUDED.stock_quantity,
            color = EXCLUDED.color,
            material = EXCLUDED.material,
            width = EXCLUDED.width,
            sizes = EXCLUDED.sizes,
            images = EXCLUDED.images,
            videos = EXCLUDED.videos,
            seo_title = EXCLUDED.seo_title,
            seo_description = EXCLUDED.seo_description,
            is_new_arrival = EXCLUDED.is_new_arrival,
            is_best_seller = EXCLUDED.is_best_seller,
            is_trending = EXCLUDED.is_trending,
            average_rating = EXCLUDED.average_rating,
            reviews_count = EXCLUDED.reviews_count`,
          [
            p.id, p.sku, p.brand, p.category, p.name, p.description, p.mrp, p.sellingPrice,
            p.discountPercentage, p.stockQuantity, p.color, p.material, p.width,
            JSON.stringify(p.sizes), JSON.stringify(p.images), JSON.stringify(p.videos || []),
            p.seoTitle || null, p.seoDescription || null, p.isNewArrival, p.isBestSeller, p.isTrending,
            p.averageRating, p.reviewsCount
          ]
        );
      }
      console.log(`Products synchronization complete: ${dbData.products.length} products upserted.`);

      // Seed Coupons
      console.log('Upserting coupons...');
      for (const c of dbData.coupons || []) {
        await client.query(
          `INSERT INTO coupons (
            id, code, discount_type, discount_value, min_order_value, category_restriction, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            code = EXCLUDED.code,
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            min_order_value = EXCLUDED.min_order_value,
            category_restriction = EXCLUDED.category_restriction,
            is_active = EXCLUDED.is_active`,
          [
            c.id, c.code, c.discountType, c.discountValue, c.minOrderValue, c.categoryRestriction || null, c.isActive
          ]
        );
      }
      console.log(`Coupons synchronization complete: ${dbData.coupons.length} coupons upserted.`);

      // Seed Users
      console.log('Upserting users...');
      for (const u of dbData.users || []) {
        await client.query(
          `INSERT INTO users (
            id, email, mobile, password_hash, name, role, addresses, wishlist, recently_viewed, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            mobile = EXCLUDED.mobile,
            password_hash = EXCLUDED.password_hash,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            addresses = EXCLUDED.addresses,
            wishlist = EXCLUDED.wishlist,
            recently_viewed = EXCLUDED.recently_viewed`,
          [
            u.id, u.email, u.mobile, u.passwordHash, u.name, u.role,
            JSON.stringify(u.addresses || []), JSON.stringify(u.wishlist || []), JSON.stringify(u.recentlyViewed || []),
            u.createdAt || new Date().toISOString()
          ]
        );
      }
      console.log(`Users synchronization complete: ${dbData.users.length} users upserted.`);

      // Seed Pincodes
      console.log('Upserting pincodes...');
      for (const p of dbData.pincodes || []) {
        await client.query(
          `INSERT INTO pincodes (
            pincode, serviceable, estimated_days, state
          ) VALUES ($1, $2, $3, $4)
          ON CONFLICT (pincode) DO UPDATE SET
            serviceable = EXCLUDED.serviceable,
            estimated_days = EXCLUDED.estimated_days,
            state = EXCLUDED.state`,
          [
            p.pincode, p.serviceable, p.estimatedDays, p.state
          ]
        );
      }
      console.log(`Pincodes synchronization complete: ${dbData.pincodes.length} pincodes upserted.`);

      // Seed Audit Logs
      console.log('Upserting audit logs...');
      for (const l of dbData.auditLogs || []) {
        await client.query(
          `INSERT INTO audit_logs (
            id, user_id, user_email, action, details, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING`,
          [
            l.id, l.userId, l.userEmail, l.action, l.details, l.timestamp
          ]
        );
      }

      // Seed Orders
      console.log('Upserting orders...');
      for (const o of dbData.orders || []) {
        await client.query(
          `INSERT INTO orders (
            id, customer_name, customer_email, customer_mobile, shipping_address, items,
            order_value, gst_amount, shipping_charges, coupon_applied, final_amount,
            payment_method, payment_status, order_status, courier_name, tracking_number,
            dispatch_details, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            customer_email = EXCLUDED.customer_email,
            customer_mobile = EXCLUDED.customer_mobile,
            shipping_address = EXCLUDED.shipping_address,
            items = EXCLUDED.items,
            order_value = EXCLUDED.order_value,
            gst_amount = EXCLUDED.gst_amount,
            shipping_charges = EXCLUDED.shipping_charges,
            coupon_applied = EXCLUDED.coupon_applied,
            final_amount = EXCLUDED.final_amount,
            payment_method = EXCLUDED.payment_method,
            payment_status = EXCLUDED.payment_status,
            order_status = EXCLUDED.order_status,
            courier_name = EXCLUDED.courier_name,
            tracking_number = EXCLUDED.tracking_number,
            dispatch_details = EXCLUDED.dispatch_details`,
          [
            o.id, o.customerName, o.customerEmail, o.customerMobile,
            JSON.stringify(o.shippingAddress), JSON.stringify(o.items),
            o.orderValue, o.gstAmount, o.shippingCharges, o.couponApplied || null, o.finalAmount,
            o.paymentMethod, o.paymentStatus, o.orderStatus, o.courierName || null, o.trackingNumber || null,
            o.dispatchDetails || null, o.createdAt || new Date().toISOString()
          ]
        );
      }
      console.log(`Orders synchronization complete: ${(dbData.orders || []).length} orders upserted.`);

      // Seed Settings
      console.log('Upserting settings...');
      if (dbData.settings) {
        await client.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          ['shipping_fee', JSON.stringify(dbData.settings.standardShippingFee || 99)]
        );
        await client.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          ['free_shipping_threshold', JSON.stringify(dbData.settings.freeShippingThreshold || 999)]
        );
        console.log('Settings upserted successfully.');
      }
    } else {
      console.log('No local db.json found to seed.');
    }

    console.log('Database setup and migration successfully completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
    console.log('PostgreSQL connection closed.');
  }
}

main().catch(console.error);
