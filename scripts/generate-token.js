
const crypto = require('crypto');

const secret = 'super-secret-jwt-token-with-at-least-32-characters-long';
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { iss: 'supabase-demo', role: 'service_role', exp: 1983812996 };

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const unsigned = `${b64(header)}.${b64(payload)}`;
const signature = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');

console.log(`${unsigned}.${signature}`);
