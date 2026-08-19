const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1];
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const NEW_CLOUD = 'dk0lpxu3';
const PRESET = 'infinitytraders';

async function uploadToNewCloud(imageUrl) {
  try {
    const fetch = globalThis.fetch || require('node-fetch');
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error(`Failed to download: ${imageUrl} (Status: ${res.status})`);
      return null;
    }
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const dataUri = `data:${contentType};base64,${base64}`;

    const formData = new URLSearchParams();
    formData.append('file', dataUri);
    formData.append('upload_preset', PRESET);

    const upRes = await fetch(`https://api.cloudinary.com/v1_1/${NEW_CLOUD}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await upRes.json();
    if (data.secure_url) {
      // Return with f_auto,q_auto injected
      return data.secure_url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    } else {
      console.error(`Upload error for ${imageUrl}:`, data.error);
      return null;
    }
  } catch (err) {
    console.error(`Error migrating image ${imageUrl}:`, err.message);
    return null;
  }
}

async function migrateAll() {
  console.log('🚀 Starting Full Image Migration to New Cloudinary Account (dk0lpxu3)...');
  const res = await pool.query('SELECT id, name, images FROM products');
  const products = res.rows;
  
  // Cache already uploaded URLs to avoid duplicate uploads
  const urlMapping = {};
  let totalImagesMigrated = 0;
  let productsUpdated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
    if (!Array.isArray(imgs) || imgs.length === 0) continue;

    const newImgs = [];
    let changed = false;

    for (const imgUrl of imgs) {
      if (typeof imgUrl !== 'string') continue;

      // If it's already on the new cloud
      if (imgUrl.includes(`/${NEW_CLOUD}/`)) {
        newImgs.push(imgUrl);
        continue;
      }

      // If already migrated in this session
      if (urlMapping[imgUrl]) {
        newImgs.push(urlMapping[imgUrl]);
        changed = true;
        continue;
      }

      console.log(`[${i + 1}/${products.length}] Migrating photo for ${p.name}...`);
      const newUrl = await uploadToNewCloud(imgUrl);
      if (newUrl) {
        urlMapping[imgUrl] = newUrl;
        newImgs.push(newUrl);
        totalImagesMigrated++;
        changed = true;
      } else {
        newImgs.push(imgUrl); // Keep original if migration fails
      }
    }

    if (changed) {
      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(newImgs), p.id]);
      productsUpdated++;
      console.log(`✓ Updated product [${p.name}] with new dk0lpxu3 URLs`);
    }
  }

  console.log(`\n🎉 Migration Complete!`);
  console.log(`- Total unique images transferred to dk0lpxu3: ${totalImagesMigrated}`);
  console.log(`- Products updated in database: ${productsUpdated} / ${products.length}`);
  await pool.end();
}

migrateAll().catch(err => {
  console.error('Fatal migration error:', err);
  pool.end();
});
