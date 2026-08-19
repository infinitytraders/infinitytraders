const fs = require('fs');

const transcript = fs.readFileSync('C:/Users/syedi/.gemini/antigravity-ide/brain/adc5f06c-6df0-455b-9fa2-41422d6eb241/.system_generated/logs/transcript_full.jsonl', 'utf8');

const regex = /Cloudinary:\s*([^\n\r]+?)\s+(https:\/\/res\.cloudinary\.com\/wxfjwdib\/image\/upload\/[^\s"\\]+)/g;
let match;
const mapping = {};

while ((match = regex.exec(transcript)) !== null) {
  const prodName = match[1].trim();
  const url = match[2].trim();
  if (!mapping[prodName]) {
    mapping[prodName] = [];
  }
  if (!mapping[prodName].includes(url)) {
    mapping[prodName].push(url);
  }
}

console.log('Found products with images:', Object.keys(mapping).length);
let totalUrls = 0;
Object.values(mapping).forEach(urls => totalUrls += urls.length);
console.log('Total unique URLs found:', totalUrls);

fs.writeFileSync('scripts/original_mapping_by_name.json', JSON.stringify(mapping, null, 2));
console.log('Saved to scripts/original_mapping_by_name.json');
