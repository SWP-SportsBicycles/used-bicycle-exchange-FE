/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const filePath = require('path').join(__dirname, '..', 'src', 'lib', 'api', 'buyer-api.ts');
let c = fs.readFileSync(filePath, 'utf8');

// Simple string replacement - just change the URL
const before = '/api/payment/cancel/';
const after = '/api/buyer-order/';

if (c.includes(before)) {
  c = c.replace(before + '${orderId}', after + '${orderId}/cancel');
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Patched payment cancel URL -> buyer-order cancel URL');
} else {
  console.log('Pattern not found, checking current state...');
  const idx = c.indexOf('cancelOrder');
  console.log(c.slice(idx, idx + 200));
}

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
const idx = verify.indexOf('cancelOrder');
console.log('Final result:\n', verify.slice(idx, idx + 200));
