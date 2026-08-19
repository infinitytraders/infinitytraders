const fs = require('fs');

try {
  const transcript = fs.readFileSync('C:/Users/syedi/.gemini/antigravity-ide/brain/adc5f06c-6df0-455b-9fa2-41422d6eb241/.system_generated/logs/transcript_full.jsonl', 'utf8');
  
  // Find JSON block with productList
  const idx = transcript.indexOf('"productList":');
  if (idx !== -1) {
    const start = transcript.lastIndexOf('{', idx);
    const end = transcript.indexOf('}', transcript.indexOf(']', idx)) + 1;
    const jsonStr = transcript.substring(start, end);
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.productList) {
        fs.writeFileSync('scripts/original_products_backup.json', JSON.stringify(parsed.productList, null, 2));
        console.log(`✓ Successfully extracted ${parsed.productList.length} products with original Cloudinary image URLs!`);
        process.exit(0);
      }
    } catch (e) {
      console.log('JSON parse attempt 1 failed:', e.message);
    }
  }

  // Fallback: regex search for all product objects with URLs
  const regex = /\{\s*"id":\s*"(prod_[^"]+)",\s*"name":\s*"([^"]+)",\s*"brand":\s*"([^"]*)",\s*"category":\s*"([^"]*)",\s*"count":\s*(\d+),\s*"urls":\s*(\[[^\]]+\])\s*\}/g;
  let match;
  const products = [];
  while ((match = regex.exec(transcript)) !== null) {
    products.push({
      id: match[1],
      name: match[2],
      brand: match[3],
      category: match[4],
      count: parseInt(match[5], 10),
      urls: JSON.parse(match[6])
    });
  }

  if (products.length > 0) {
    fs.writeFileSync('scripts/original_products_backup.json', JSON.stringify(products, null, 2));
    console.log(`✓ Successfully extracted ${products.length} products with regex!`);
  } else {
    console.error('Could not find product mappings in transcript');
  }
} catch (err) {
  console.error('Error:', err);
}
