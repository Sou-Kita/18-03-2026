const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Generate RSA key pair (2048 bits)
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Save keys to files
const keysDir = path.join(__dirname, "keys");

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

// Write private key
fs.writeFileSync(path.join(keysDir, "private.pem"), privateKey);
console.log("✓ Private key saved to keys/private.pem");

// Write public key
fs.writeFileSync(path.join(keysDir, "public.pem"), publicKey);
console.log("✓ Public key saved to keys/public.pem");

console.log("\nRSA keys generated successfully (2048 bits)!");
