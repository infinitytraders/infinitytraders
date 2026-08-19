const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1];
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const originalMappings = JSON.parse(fs.readFileSync('scripts/original_mapping_by_name.json', 'utf8'));

// Helper to clean and format names for matching
function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function restore() {
  console.log('--- Restoring Exact Original Photos to PostgreSQL ---');
  const res = await pool.query('SELECT id, name, brand, category, images FROM products');
  const products = res.rows;
  let restoredCount = 0;

  for (const p of products) {
    const pNorm = normalize(p.name);
    let matchedUrls = null;

    // 1. Direct name match
    for (const [name, urls] of Object.entries(originalMappings)) {
      if (normalize(name) === pNorm) {
        matchedUrls = urls;
        break;
      }
    }

    // 2. Partial name match
    if (!matchedUrls) {
      for (const [name, urls] of Object.entries(originalMappings)) {
        const nNorm = normalize(name);
        if (pNorm.includes(nNorm) || nNorm.includes(pNorm)) {
          matchedUrls = urls;
          break;
        }
      }
    }

    if (matchedUrls && matchedUrls.length > 0) {
      // Ensure f_auto,q_auto is present in the URLs for 95% bandwidth optimization
      const optimizedUrls = matchedUrls.map(url => {
        if (url.includes('/image/upload/') && !url.includes('/f_auto')) {
          return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
        }
        return url;
      });

      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(optimizedUrls), p.id]);
      console.log(`✓ Restored original photos for: [${p.name}] (${optimizedUrls.length} images)`);
      restoredCount++;
    } else {
      console.log(`- Kept clean fallback for: [${p.name}]`);
    }
  }

  console.log(`\n🎉 Successfully restored exact original photos for ${restoredCount} products!`);
  await pool.end();
}

restore().catch(err => {
  console.error('Error during restore:', err);
  pool.end();
});
