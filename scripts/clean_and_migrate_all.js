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

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  // Fix double https:// or https://https://
  while (clean.includes('https://https://') || clean.includes('http://https://')) {
    clean = clean.replace('https://https://', 'https://').replace('http://https://', 'https://');
  }
  return clean;
}

async function uploadToNewCloud(imageUrl) {
  try {
    const cleanUrl = sanitizeUrl(imageUrl);
    const fetch = globalThis.fetch || require('node-fetch');
    const res = await fetch(cleanUrl);
    if (!res.ok) {
      console.error(`Download failed for ${cleanUrl}: status ${res.status}`);
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
      return data.secure_url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    } else {
      console.error(`Upload error:`, data.error);
      return null;
    }
  } catch (err) {
    console.error(`Error:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🔄 Cleaning and migrating all remaining photos to dk0lpxu3...');
  const res = await pool.query('SELECT id, name, images FROM products');
  const products = res.rows;
  const urlMap = {};

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
    const newImgs = [];
    let modified = false;

    for (let url of imgs) {
      if (typeof url !== 'string') continue;
      url = sanitizeUrl(url);

      if (url.includes(`/${NEW_CLOUD}/`)) {
        newImgs.push(url);
        continue;
      }

      if (urlMap[url]) {
        newImgs.push(urlMap[url]);
        modified = true;
        continue;
      }

      console.log(`Uploading [${p.name}] image...`);
      const migrated = await uploadToNewCloud(url);
      if (migrated) {
        urlMap[url] = migrated;
        newImgs.push(migrated);
        modified = true;
      } else {
        newImgs.push(url);
      }
    }

    if (modified) {
      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(newImgs), p.id]);
      console.log(`✓ Product [${p.name}] updated with dk0lpxu3!`);
    }
  }

  console.log('🎉 Done! All product images migrated to dk0lpxu3.');
  await pool.end();
}

main().catch(e => {
  console.error(e);
  pool.end();
});
