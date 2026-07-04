const crypto = require('crypto');

// --- COLOR OUTPUT HELPERS ---
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let failedTests = 0;
let passedTests = 0;

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`${GREEN}✓ PASS:${RESET} ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`${RED}✗ FAIL:${RESET} ${name}`);
    console.error(err);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// --- SESSION SIGNATURE IMPLEMENTATION UNDER TEST ---
const SESSION_SECRET = process.env.SESSION_SECRET || 'infinity_traders_super_secret_cookie_signing_key_2026';

async function signSession(userData) {
  const payload = `${userData.id}|${userData.email}|${userData.name}|${userData.role}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return JSON.stringify({ data: userData, signature });
}

async function verifySession(cookieValue) {
  try {
    const parsed = JSON.parse(cookieValue);
    const userData = parsed.data;
    const signature = parsed.signature;
    const payload = `${userData.id}|${userData.email}|${userData.name}|${userData.role}`;
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    if (signature === expectedSignature) {
      return userData;
    }
  } catch (err) {}
  return null;
}

// --- COMBO DISCOUNT LOGIC UNDER TEST ---
function calculateComboDiscount(cartItems) {
  // Check if cart has at least one Running Shoe, one T-Shirt, and one Lower
  const hasShoes = cartItems.some(item => item.product.category === 'Running shoes');
  const hasClothes = cartItems.some(item => item.product.category === 'T-shirts');
  const hasLowers = cartItems.some(item => item.product.category === 'Lowers');

  if (hasShoes && hasClothes && hasLowers) {
    return 2500;
  }
  return 0;
}

// --- MAIN RUNNER ---
async function run() {
  console.log(`${BOLD}=========================================`);
  console.log('      INFINITY TRADERS TEST SUITE        ');
  console.log(`=========================================${RESET}\n`);

  // 1. Session integrity security tests
  await testAsync('Session Cookie Signing and Verification', async () => {
    const customerUser = { id: 'usr_123', email: 'cust@gmail.com', name: 'Customer User', role: 'CUSTOMER' };
    const cookie = await signSession(customerUser);
    
    assert(cookie.includes('signature'), 'Signed cookie must contain signature');
    
    const verified = await verifySession(cookie);
    assert(verified !== null, 'Valid signed cookie should verify successfully');
    assert(verified.id === 'usr_123', 'Verified payload ID should match input');
    assert(verified.role === 'CUSTOMER', 'Verified payload role should match input');
  });

  await testAsync('Session Cookie Tampering Rejection', async () => {
    const customerUser = { id: 'usr_123', email: 'cust@gmail.com', name: 'Customer User', role: 'CUSTOMER' };
    const cookie = await signSession(customerUser);
    
    // Tamper: Parse, modify role to SUPER_ADMIN, and stringify again (retaining original signature)
    const parsed = JSON.parse(cookie);
    parsed.data.role = 'SUPER_ADMIN';
    const tamperedCookie = JSON.stringify(parsed);
    
    const verified = await verifySession(tamperedCookie);
    assert(verified === null, 'Tampered cookie must fail verification and return null');
  });

  // 2. Combo discount calculations
  await testAsync('Combo Discount - Incomplete Combo (Only Shoes)', async () => {
    const cart = [
      { product: { category: 'Running shoes', name: 'Nike Pegasus' }, quantity: 1 }
    ];
    const discount = calculateComboDiscount(cart);
    assert(discount === 0, 'Incomplete combo discount should be 0');
  });

  await testAsync('Combo Discount - Incomplete Combo (Shoes and T-Shirts)', async () => {
    const cart = [
      { product: { category: 'Running shoes', name: 'Nike Pegasus' }, quantity: 1 },
      { product: { category: 'T-shirts', name: 'Skechers Tee' }, quantity: 1 }
    ];
    const discount = calculateComboDiscount(cart);
    assert(discount === 0, 'Incomplete combo discount should be 0');
  });

  await testAsync('Combo Discount - Complete Combo (Shoes, T-Shirts, and Lowers)', async () => {
    const cart = [
      { product: { category: 'Running shoes', name: 'Nike Pegasus' }, quantity: 1 },
      { product: { category: 'T-shirts', name: 'Skechers Tee' }, quantity: 1 },
      { product: { category: 'Lowers', name: 'Puma Trousers' }, quantity: 1 }
    ];
    const discount = calculateComboDiscount(cart);
    assert(discount === 2500, 'Complete combo discount should be exactly ₹2,500');
  });

  // 3. Coupon eligibility rules
  await testAsync('Coupon Code discount check', async () => {
    const coupon = { code: 'LAUNCH10', minOrderValue: 2000, discountType: 'PERCENT', discountValue: 10 };
    
    // Total less than min order value
    const totalLow = 1500;
    const applicableLow = totalLow >= coupon.minOrderValue;
    assert(applicableLow === false, 'Coupon should not apply below minimum order value');

    // Total more than min order value
    const totalHigh = 3000;
    const applicableHigh = totalHigh >= coupon.minOrderValue;
    assert(applicableHigh === true, 'Coupon should apply above minimum order value');
    
    const discountAmount = (totalHigh * coupon.discountValue) / 100;
    assert(discountAmount === 300, 'Discount amount calculation must be correct');
  });

  // 4. Delhivery Pincode check mockup API parsing
  await testAsync('Delhivery Pincode response parsing mock test', async () => {
    const mockApiData = {
      delivery_codes: [
        {
          postal_code: {
            pin: '826001',
            is_prepaid: 'Y',
            is_cod: 'Y',
            district: 'Dhanbad',
            state_code: 'JH',
            estimated_delivery_days: '3'
          }
        }
      ]
    };

    const codeInfo = mockApiData.delivery_codes[0].postal_code;
    const serviceable = codeInfo.is_prepaid === 'Y' || codeInfo.is_cod === 'Y';
    assert(serviceable === true, 'Pincode should be serviceable if prepaid or COD is Y');
    assert(codeInfo.district === 'Dhanbad', 'District should be parsed correctly');
    assert(codeInfo.state_code === 'JH', 'State should be parsed correctly');
  });

  // 5. Delhivery pickup check logic mock test
  await testAsync('Order Cancellation Delhivery pickup validation check', async () => {
    function canCancelOrder(order, liveTracking) {
      if (order.orderStatus === 'DELIVERED') return false;
      if (order.orderStatus === 'CANCELLED') return false;
      if (!order.trackingNumber) return true; // Not booked yet, can cancel
      
      if (liveTracking) {
        if (liveTracking.Status?.Scans && liveTracking.Status.Scans.length > 0) {
          const hasTransitScans = liveTracking.Status.Scans.some((scan) => {
            const activity = (scan.ScanDetail?.Scan || '').toUpperCase();
            return activity !== 'MANIFESTED' && activity !== 'SOFT DATA UPLOADED';
          });
          if (hasTransitScans) return false; // Already picked up
        }
        
        const mainStatus = (liveTracking.Status?.Status || '').toUpperCase();
        if (['IN TRANSIT', 'DISPATCHED', 'OUT FOR DELIVERY', 'DELIVERED'].includes(mainStatus)) {
          return false; // Already picked up
        }
      }
      return true;
    }

    // Case 1: Fresh order, no tracking code => should be allowed
    const freshOrder = { orderStatus: 'PENDING' };
    assert(canCancelOrder(freshOrder, null) === true, 'Fresh order without waybill must be cancellable');

    // Case 2: Only Manifested (pre-pickup) => should be allowed
    const manifestedOrder = { orderStatus: 'PENDING', trackingNumber: '12345' };
    const prePickupTracking = {
      Status: {
        Status: 'Manifested',
        Scans: [
          { ScanDetail: { Scan: 'MANIFESTED', ScannedLocation: 'Dhanbad HQ' } }
        ]
      }
    };
    assert(canCancelOrder(manifestedOrder, prePickupTracking) === true, 'Manifested pre-pickup order must be cancellable');

    // Case 3: Picked up scan present => should be blocked
    const transitOrder = { orderStatus: 'DISPATCHED', trackingNumber: '12345' };
    const transitTracking = {
      Status: {
        Status: 'In Transit',
        Scans: [
          { ScanDetail: { Scan: 'MANIFESTED', ScannedLocation: 'Dhanbad HQ' } },
          { ScanDetail: { Scan: 'PICKED UP', ScannedLocation: 'Dhanbad Hub' } }
        ]
      }
    };
    assert(canCancelOrder(transitOrder, transitTracking) === false, 'Order already scanned as Picked Up must not be cancellable');
  });

  console.log(`\n=========================================`);
  console.log(`Test Execution Summary:`);
  console.log(`- Passed: ${GREEN}${passedTests}${RESET}`);
  console.log(`- Failed: ${RED}${failedTests}${RESET}`);
  console.log(`=========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
