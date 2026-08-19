const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1];
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const CURATED_IMAGES = {
  sneakers_nike: [
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80"
  ],
  sneakers_jordan: [
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80"
  ],
  running_adidas: [
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80"
  ],
  running_shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80"
  ],
  air_sega: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80"
  ],
  crocs_slides: [
    "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
  ],
  tshirts_polo: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"
  ],
  apparel_jersey: [
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
  ],
  lowers_trousers: [
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80"
  ]
};

function selectImagesForProduct(name, brand, category) {
  const n = (name || '').toLowerCase();
  const b = (brand || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('jordan') || n.includes('dunk') || n.includes('retro')) {
    return CURATED_IMAGES.sneakers_jordan;
  }
  if (c.includes('sneaker') || n.includes('p6000') || n.includes('p-6000') || n.includes('collab')) {
    return CURATED_IMAGES.sneakers_nike;
  }
  if (c.includes('sega') || n.includes('sega')) {
    return CURATED_IMAGES.air_sega;
  }
  if (c.includes('daily') || n.includes('croc') || n.includes('slide') || n.includes('bayaband') || n.includes('literide') || n.includes('clog')) {
    return CURATED_IMAGES.crocs_slides;
  }
  if (c.includes('lower') || c.includes('tracksuit') || n.includes('short') || n.includes('lower') || n.includes('pant') || n.includes('trouser')) {
    return CURATED_IMAGES.lowers_trousers;
  }
  if (c.includes('t-shirt') || n.includes('polo') || n.includes('tee') || n.includes('zym') || n.includes('gym')) {
    return CURATED_IMAGES.tshirts_polo;
  }
  if (c.includes('apparel') || n.includes('jersey')) {
    return CURATED_IMAGES.apparel_jersey;
  }
  if (b.includes('adidas')) {
    return CURATED_IMAGES.running_adidas;
  }
  return CURATED_IMAGES.running_shoes;
}

async function main() {
  console.log('--- Connecting to PostgreSQL ---');
  const res = await pool.query('SELECT id, name, brand, category, images FROM products');
  let updatedCount = 0;

  for (const prod of res.rows) {
    const rawImages = typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : (prod.images || []);
    const hasBrokenCloudinary = rawImages.some(img => typeof img === 'string' && img.includes('cloudinary'));

    if (hasBrokenCloudinary || rawImages.length === 0) {
      const newImages = selectImagesForProduct(prod.name, prod.brand, prod.category);
      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(newImages), prod.id]);
      console.log(`✓ Updated [${prod.name}] (${prod.category}) with ${newImages.length} clean images`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully refreshed ${updatedCount} products with high-resolution, instant-loading images!`);
  await pool.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  pool.end();
});
