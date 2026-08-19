const fs = require('fs');
const { Pool } = require('pg');

const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1];
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const transcript = fs.readFileSync('C:/Users/syedi/.gemini/antigravity-ide/brain/adc5f06c-6df0-455b-9fa2-41422d6eb241/.system_generated/logs/transcript_full.jsonl', 'utf8');
  
  // Extract all lines matching "Cloudinary: <name> <url>"
  const lines = transcript.split('\n');
  const allCloudinaryEntries = [];
  
  for (const line of lines) {
    const m = line.match(/Cloudinary:\s*([^\t\r\n]+?)\s+(https:\/\/res\.cloudinary\.com\/wxfjwdib\/image\/upload\/[^\s\"\\,\)]+)/g);
    if (m) {
      for (const item of m) {
        const parts = item.replace('Cloudinary:', '').trim().split(/\s+(https:\/\/)/);
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const url = ('https://' + parts.slice(1).join('')).trim();
          allCloudinaryEntries.push({ name, url });
        }
      }
    }
  }

  console.log(`Found ${allCloudinaryEntries.length} total Cloudinary entries in logs.`);
  
  // Map by product name
  const urlMap = {};
  for (const entry of allCloudinaryEntries) {
    const key = entry.name.toLowerCase().trim();
    if (!urlMap[key]) urlMap[key] = [];
    if (!urlMap[key].includes(entry.url)) {
      urlMap[key].push(entry.url);
    }
  }

  const res = await pool.query('SELECT id, name, brand, category, images FROM products');
  const products = res.rows;

  let matchedCount = 0;
  for (const p of products) {
    const pName = p.name.toLowerCase().trim();
    
    // Find best match in urlMap
    let matchedUrls = urlMap[pName];
    if (!matchedUrls) {
      // Try substring match
      for (const [key, urls] of Object.entries(urlMap)) {
        if (pName.includes(key) || key.includes(pName)) {
          matchedUrls = urls;
          break;
        }
      }
    }

    if (matchedUrls && matchedUrls.length > 0) {
      const optimizedUrls = matchedUrls.map(u => {
        if (u.includes('/image/upload/') && !u.includes('/f_auto')) {
          return u.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
        }
        return u;
      });

      await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(optimizedUrls), p.id]);
      console.log(`[RESTORED] ${p.name} -> ${optimizedUrls.length} exact Cloudinary photos`);
      matchedCount++;
    } else {
      console.log(`[NO CLOUDINARY FOUND IN LOGS] ${p.name}`);
    }
  }

  console.log(`\nMatched & Restored ${matchedCount} / ${products.length} products directly from logs!`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
