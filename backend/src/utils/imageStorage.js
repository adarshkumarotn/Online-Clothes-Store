// Utility: validates image payloads and manages product image file save/delete operations.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');
const PRODUCT_UPLOADS_DIR = path.join(UPLOADS_ROOT, 'products');
const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};
const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

async function ensureUploadsDir() {
  await fs.promises.mkdir(PRODUCT_UPLOADS_DIR, { recursive: true });
}

function buildFileName(ext) {
  const stamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `product-${stamp}-${random}.${ext}`;
}

async function saveBase64Image(imageBase64) {
  const value = String(imageBase64 || '').trim();
  if (!value) return null;

  const match = value.match(DATA_URL_PATTERN);
  if (!match) {
    const err = new Error('Invalid image payload');
    err.statusCode = 400;
    throw err;
  }

  const mimeType = match[1].toLowerCase();
  const encoded = match[2];
  const extension = ALLOWED_MIME_TO_EXT[mimeType];

  if (!extension) {
    const err = new Error('Unsupported image type');
    err.statusCode = 400;
    throw err;
  }

  const buffer = Buffer.from(encoded, 'base64');
  if (!buffer.length) {
    const err = new Error('Empty image payload');
    err.statusCode = 400;
    throw err;
  }

  // Keep uploads bounded for local academic setup.
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (buffer.length > MAX_SIZE_BYTES) {
    const err = new Error('Image size must be 5MB or less');
    err.statusCode = 400;
    throw err;
  }

  await ensureUploadsDir();
  const fileName = buildFileName(extension);
  const absolutePath = path.join(PRODUCT_UPLOADS_DIR, fileName);
  await fs.promises.writeFile(absolutePath, buffer);

  return `/uploads/products/${fileName}`;
}

async function removeLocalImage(imageUrl) {
  const value = String(imageUrl || '').trim();
  if (!value || !value.startsWith('/uploads/products/')) return;

  const relativePath = value.replace(/^\//, '');
  const absolutePath = path.join(path.join(__dirname, '..', '..'), relativePath);
  const normalizedTarget = path.normalize(absolutePath);
  const normalizedRoot = path.normalize(PRODUCT_UPLOADS_DIR + path.sep);

  if (!normalizedTarget.startsWith(normalizedRoot)) return;

  try {
    await fs.promises.unlink(normalizedTarget);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  saveBase64Image,
  removeLocalImage
};


