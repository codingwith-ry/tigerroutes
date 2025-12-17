# AES-256-GCM Encryption Documentation

## Overview
This document explains how AES-256-GCM encryption is implemented in `server/utils/encryption.js` for secure password storage and retrieval in the TigerRoutes application.

---

## What is AES-256-GCM?

### AES (Advanced Encryption Standard)
- **Industry-standard symmetric encryption algorithm**
- Used worldwide by governments, banks, and security-critical applications
- **256-bit key size** = Maximum security level (virtually unbreakable with current technology)

### GCM (Galois/Counter Mode)
GCM is an **authenticated encryption mode** that provides:

1. **Confidentiality** - Data is encrypted and unreadable
2. **Authentication** - Detects if data has been tampered with
3. **Integrity** - Ensures data hasn't been modified

**Key Advantage:** Combines encryption and authentication in a single operation, making it both secure and efficient.

---

## How AES-256-GCM Works

### Encryption Process
```
Plain Text → [AES-256-GCM] → Ciphertext + Authentication Tag
              ↑      ↑
            Key     IV
```

**Components:**
1. **Key (32 bytes)** - Secret key used for encryption/decryption
2. **IV (Initialization Vector, 12 bytes)** - Random value ensuring uniqueness
3. **Ciphertext** - Encrypted data
4. **Authentication Tag (16 bytes)** - Cryptographic signature verifying integrity

### Why Each Component Matters

#### 1. The Key (32 bytes = 256 bits)
- **Purpose:** The secret that locks/unlocks the data
- **Security:** Must be kept absolutely secret in environment variables
- **Size:** 256 bits = 2^256 possible combinations (impossible to brute force)

#### 2. The IV (Initialization Vector, 12 bytes)
- **Purpose:** Ensures identical inputs produce different outputs
- **Requirement:** Must be unique for every encryption (randomly generated each time)
- **Analogy:** Like salt in password hashing, but for encryption
- **Example:**
  ```
  Encrypting "password123" twice:
  - First time: IV = abc123... → Ciphertext: xyz789...
  - Second time: IV = def456... → Ciphertext: uvw012...
  ```

#### 3. The Authentication Tag (16 bytes)
- **Purpose:** Detects tampering or corruption
- **How it works:** Mathematical signature generated during encryption
- **Validation:** During decryption, the tag is verified before revealing data
- **Security:** Any modification to the ciphertext invalidates the tag

---

## Implementation Details: `encryption.js`

### File Structure
```javascript
const crypto = require('crypto');
const RAW_KEY = process.env.PASSWORD_REVEAL_KEY || null;
```

### Function Breakdown

#### 1. `normalizeBase64Key(s)`
**Purpose:** Sanitizes the encryption key from environment variables

```javascript
function normalizeBase64Key(s) {
    if (!s) return null;
    // Remove BOM (Byte Order Mark) and whitespace
    let t = s.replace(/\uFEFF/g, '').trim();
    // Remove invalid base64 characters
    t = t.replace(/[^A-Za-z0-9+/=]/g, '');
    return t;
}
```

**Why this matters:**
- Environment variables can have hidden characters (BOM, newlines, spaces)
- Ensures the key is valid base64 before decoding
- Prevents "Invalid key" errors from formatting issues

---

#### 2. `getKey()`
**Purpose:** Retrieves and validates the encryption key

```javascript
function getKey() {
    const KEY_BASE64 = normalizeBase64Key(RAW_KEY);
    if (!KEY_BASE64) throw new Error('Missing PASSWORD_REVEAL_KEY environment variable');
    const key = Buffer.from(KEY_BASE64, 'base64');
    if (key.length !== 32) throw new Error('PASSWORD_REVEAL_KEY must be 32 bytes (base64 encoded)');
    return key;
}
```

**Process:**
1. Normalize the base64 string
2. Check if key exists (fail fast if missing)
3. Decode from base64 to binary Buffer
4. Validate it's exactly 32 bytes (256 bits)
5. Return the binary key

**Security Check:**
- If key is wrong length → Error immediately (prevents weak encryption)

---

#### 3. `encrypt(text)`
**Purpose:** Encrypts plain text into a secure, tamper-proof format

```javascript
function encrypt(text) {
    const key = getKey();
    const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Store as iv(12) | tag(16) | ciphertext
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}
```

**Step-by-Step Process:**

1. **Get the encryption key**
   ```javascript
   const key = getKey();
   ```

2. **Generate random IV** (12 bytes)
   ```javascript
   const iv = crypto.randomBytes(12);
   ```
   - Cryptographically secure random generation
   - Different for every encryption
   - **Critical:** Never reuse the same IV with the same key

3. **Create cipher object**
   ```javascript
   const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
   ```
   - Sets up AES-256-GCM encryption
   - Configured with key and IV

4. **Encrypt the text**
   ```javascript
   const ciphertext = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
   ```
   - Converts text to UTF-8 bytes
   - Encrypts in chunks (update + final)
   - Produces encrypted binary data

5. **Extract authentication tag**
   ```javascript
   const tag = cipher.getAuthTag();
   ```
   - GCM mode automatically generates this
   - 16-byte cryptographic signature
   - Used to verify integrity during decryption

6. **Combine all components**
   ```javascript
   return Buffer.concat([iv, tag, ciphertext]).toString('base64');
   ```
   - **Layout:** `[IV (12 bytes) | Tag (16 bytes) | Ciphertext (variable)]`
   - Convert to base64 for storage/transmission
   - Single string contains everything needed for decryption

**Why this layout?**
- IV and tag are not secret (can be stored openly)
- Keeping everything together simplifies storage
- Decryption just needs to split the components

---

#### 4. `decrypt(b64)`
**Purpose:** Decrypts and validates encrypted data

```javascript
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
```

**Step-by-Step Process:**

1. **Get the encryption key**
   ```javascript
   const key = getKey();
   ```

2. **Decode from base64**
   ```javascript
   const buf = Buffer.from(b64 || '', 'base64');
   ```

3. **Validate minimum length**
   ```javascript
   if (buf.length < 28) throw new Error('Invalid encrypted payload');
   ```
   - Minimum: 12 (IV) + 16 (tag) = 28 bytes
   - Prevents invalid/corrupted data from proceeding

4. **Extract components**
   ```javascript
   const iv = buf.slice(0, 12);        // First 12 bytes
   const tag = buf.slice(12, 28);      // Next 16 bytes
   const ciphertext = buf.slice(28);   // Remaining bytes
   ```

5. **Create decipher object**
   ```javascript
   const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
   ```
   - Uses same key and IV from encryption

6. **Set authentication tag**
   ```javascript
   decipher.setAuthTag(tag);
   ```
   - **Critical step:** Tag is verified during final()
   - If data was tampered with → decryption will fail

7. **Decrypt and verify**
   ```javascript
   const res = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
   ```
   - Decrypts the ciphertext
   - `final()` verifies the authentication tag
   - **Throws error if tag verification fails** (tampered data detected)

8. **Return plain text**
   ```javascript
   return res.toString('utf8');
   ```

---

## Security Features

### 1. Confidentiality
- AES-256 encryption makes data unreadable without the key
- Military-grade security standard

### 2. Authentication & Integrity
- Authentication tag detects any tampering
- Even 1-bit change in ciphertext causes decryption to fail
- Protects against:
  - Data modification attacks
  - Bit-flipping attacks
  - Corruption detection

### 3. Unique Encryption Every Time
- Random IV ensures same input produces different outputs
- Prevents pattern analysis attacks
- Example:
  ```
  encrypt("password") → "a8f3k2x9..."
  encrypt("password") → "m3n7p1q4..."  (different!)
  ```

### 4. Key Management
- 32-byte key stored securely in environment variables
- Never hardcoded in source code
- Separate from the codebase

---

## Use Cases in TigerRoutes

### Password Encryption (Reversible)
```javascript
const { encrypt, decrypt } = require('./utils/encryption');

// Store password (encrypted)
const encryptedPassword = encrypt('userPassword123');
// Store in database: "a8f3k2x9..."

// Retrieve password (decrypt)
const originalPassword = decrypt(encryptedPassword);
// Returns: "userPassword123"
```

**When to use:**
- Admin password reveal functionality
- Temporary password storage
- API key storage
- Sensitive data that needs to be retrieved

### vs. bcrypt (One-Way Hashing)
| Feature | AES-256-GCM (encryption.js) | bcrypt |
|---------|----------------------------|--------|
| **Reversible** | ✅ Yes (can decrypt) | ❌ No (one-way) |
| **Use Case** | Storing passwords for retrieval | Storing passwords for authentication |
| **Security** | Depends on key secrecy | Inherently one-way |
| **Speed** | Fast | Intentionally slow |

**TigerRoutes uses both:**
- **bcrypt:** User login passwords (never decrypted)
- **AES-256-GCM:** Admin password reveal feature (decrypted when needed)

---

## Environment Setup

### Generating a Secure Key
```bash
# Generate a random 32-byte key and encode to base64
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Output example: `a3f9k2x8m1n7p4q6r9s2t5u8v1w4y7z0A3B6C9D2E5F8=`

### Setting the Environment Variable

**Windows PowerShell:**
```powershell
$env:PASSWORD_REVEAL_KEY="a3f9k2x8m1n7p4q6r9s2t5u8v1w4y7z0A3B6C9D2E5F8="
```

**Linux/Mac:**
```bash
export PASSWORD_REVEAL_KEY="a3f9k2x8m1n7p4q6r9s2t5u8v1w4y7z0A3B6C9D2E5F8="
```

**In `.env` file:**
```env
PASSWORD_REVEAL_KEY=a3f9k2x8m1n7p4q6r9s2t5u8v1w4y7z0A3B6C9D2E5F8=
```

---

## Error Handling

### Common Errors and Solutions

#### 1. "Missing PASSWORD_REVEAL_KEY environment variable"
**Cause:** Environment variable not set
**Solution:** Set `PASSWORD_REVEAL_KEY` in your environment or `.env` file

#### 2. "PASSWORD_REVEAL_KEY must be 32 bytes (base64 encoded)"
**Cause:** Key is wrong length
**Solution:** Generate a new 32-byte key using the command above

#### 3. "Invalid encrypted payload"
**Cause:** Data is corrupted or too short
**Solution:** Re-encrypt the data or check database integrity

#### 4. Decryption fails with authentication error
**Cause:** Data was tampered with or wrong key used
**Solution:** Verify you're using the correct encryption key

---

## Best Practices

### ✅ DO
- Keep the encryption key in environment variables (never in code)
- Use strong random keys (32 bytes)
- Rotate keys periodically
- Use HTTPS to protect data in transit
- Back up the encryption key securely

### ❌ DON'T
- Never reuse IVs (the code handles this automatically)
- Don't hardcode the key in source code
- Don't commit keys to version control
- Don't use weak/predictable keys
- Don't decrypt passwords unnecessarily

---

## Testing the Implementation

```javascript
const { encrypt, decrypt } = require('./server/utils/encryption');

// Test encryption/decryption
const original = 'MySecretPassword123!';
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.log('Original:', original);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', original === decrypted); // Should be true
```

---

## References

- [NIST AES Specification](https://csrc.nist.gov/publications/detail/fips/197/final)
- [GCM Mode (NIST SP 800-38D)](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)

---

## Summary

AES-256-GCM provides **military-grade encryption** with built-in authentication, making it ideal for securing sensitive data that needs to be retrieved later. The implementation in `encryption.js` follows industry best practices with:

- Secure key management
- Random IV generation
- Authentication tag verification
- Comprehensive error handling

This ensures that passwords and sensitive data in TigerRoutes remain confidential and tamper-proof.
