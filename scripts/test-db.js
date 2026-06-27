const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  const tables = ['products', 'coupons', 'users', 'pincodes', 'orders', 'settings', 'audit_logs'];
  console.log('--- Database Row Counts ---');
  for (const table of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`${table}: ${res.rows[0].count}`);
  }
  
  const prodSample = await client.query(`SELECT id, name FROM products LIMIT 5`);
  console.log('\n--- Sample Products ---');
  prodSample.rows.forEach(p => console.log(`- [${p.id}] ${p.name}`));
  
  await client.end();
}

main().catch(console.error);
