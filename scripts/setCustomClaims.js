// scripts/setCustomClaims.js
const admin = require('firebase-admin');
const path = require('path');

const keyPath = path.join(__dirname, 'service-account.json'); // ajusta si necesario
admin.initializeApp({
  credential: admin.credential.cert(require(keyPath))
});

async function setClaims(uid, role) {
  const claims = {};
  if (role === 'admin') claims.admin = true;
  if (role === 'editor') claims.editor = true;
  if (role === 'viewer') claims.viewer = true;
  await admin.auth().setCustomUserClaims(uid, claims);
  console.log('Custom claims set for', uid, claims);
}

const [,, uid, role] = process.argv;
if (!uid || !role) {
  console.error('Usage: node setCustomClaims.js <uid> <admin|editor|viewer>');
  process.exit(1);
}
setClaims(uid, role).catch(err => { console.error(err); process.exit(1); });
