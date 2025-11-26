//this file is basically needed for reversible encryption/decryption of counselor passwords

const crypto = require('crypto');

// Expect a 32-byte key in base64 in the env var PASSWORD_REVEAL_KEY
const RAW_KEY = process.env.PASSWORD_REVEAL_KEY || null;

function normalizeBase64Key(s) {
    if (!s) return null;
    // remove BOM and trim whitespace
    let t = s.replace(/\uFEFF/g, '').trim();
    // remove any characters that are not part of base64 alphabet (A-Z a-z 0-9 + / =)
    t = t.replace(/[^A-Za-z0-9+/=]/g, '');
    return t;
}

function getKey() {
    const KEY_BASE64 = normalizeBase64Key(RAW_KEY);
    if (!KEY_BASE64) throw new Error('Missing PASSWORD_REVEAL_KEY environment variable');
    const key = Buffer.from(KEY_BASE64, 'base64');
    if (key.length !== 32) throw new Error('PASSWORD_REVEAL_KEY must be 32 bytes (base64 encoded)');
    return key;
}

function encrypt(text) {
    const key = getKey();
    const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Store as iv(12) | tag(16) | ciphertext
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

function decrypt(b64) {
    const key = getKey();
    const buf = Buffer.from(b64 || '', 'base64');
    if (buf.length < 28) throw new Error('Invalid encrypted payload');
    const iv = buf.slice(0, 12);
    const tag = buf.slice(12, 28);
    const ciphertext = buf.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const res = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return res.toString('utf8');
}

module.exports = { encrypt, decrypt, normalizeBase64Key };
