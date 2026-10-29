/** Reapply reviewed image_gen alpha masks without changing any original RGB pixel. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { PNG } = require(path.join(process.cwd(), 'node_modules/.pnpm/pngjs@3.4.0/node_modules/pngjs'));
const manifestPath = 'docs/bread-baking-background-removal.json';
const root = 'src/assets/images/bread-baking';
const maskRoot = path.join(root, 'alpha-masks');
const manifest = JSON.parse(fs.readFileSync(manifestPath));
const validateOnly = process.argv.includes('--validate');
// Remove residual matte pixels connected to the exterior, not interior highlights.
function exteriorMatte(original) {
  const count = original.width * original.height;
  const marked = new Uint8Array(count);
  const queue = [];
  const background = [...original.data.slice(0, 3)];
  function visit(pixel) {
    if (marked[pixel]) return;
    const i = pixel * 4;
    if (background.some((color, channel) => Math.abs(original.data[i + channel] - color) > 4)) return;
    marked[pixel] = 1;
    queue.push(pixel);
  }
  for (let x = 0; x < original.width; x++) {
    visit(x);
    visit((original.height - 1) * original.width + x);
  }
  for (let y = 0; y < original.height; y++) {
    visit(y * original.width);
    visit(y * original.width + original.width - 1);
  }
  for (let i = 0; i < queue.length; i++) {
    const pixel = queue[i], x = pixel % original.width, y = Math.floor(pixel / original.width);
    if (x > 0) visit(pixel - 1);
    if (x < original.width - 1) visit(pixel + 1);
    if (y > 0) visit(pixel - original.width);
    if (y < original.height - 1) visit(pixel + original.width);
  }
  return marked;
}
if (!validateOnly) fs.mkdirSync(maskRoot, { recursive: true });
for (const asset of manifest.assets) {
  const originalBytes = fs.readFileSync(asset.original);
  assert.equal(crypto.createHash('sha256').update(originalBytes).digest('hex'), asset.originalSha256);
  const original = PNG.sync.read(originalBytes);
  const targetPath = path.join(root, asset.file);
  const maskPath = path.join(maskRoot, asset.file);
  if (!validateOnly) {
    const candidate = PNG.sync.read(fs.readFileSync(fs.existsSync(maskPath) ? maskPath : targetPath));
    assert.equal(candidate.width, original.width);
    assert.equal(candidate.height, original.height);
    const mask = new PNG({ width: original.width, height: original.height });
    const result = new PNG({ width: original.width, height: original.height });
    const matte = exteriorMatte(original);
    for (let i = 0; i < original.data.length; i += 4) {
      original.data.copy(result.data, i, i, i + 3);
      result.data[i + 3] = matte[i / 4] ? 0 : candidate.data[i + 3];
      mask.data[i] = mask.data[i + 1] = mask.data[i + 2] = 255;
      mask.data[i + 3] = result.data[i + 3];
    }
    fs.writeFileSync(maskPath, PNG.sync.write(mask));
    fs.writeFileSync(targetPath, PNG.sync.write(result));
    Object.assign(asset, { alphaMask: maskPath, status: 'background_removed_pending_visual_review',
      originalRgbPreserved: true, exteriorMatteTolerance: 4 });
  }
  const result = PNG.sync.read(fs.readFileSync(targetPath));
  assert.equal(result.width, asset.width);
  assert.equal(result.height, asset.height);
  let transparent = 0;
  let visible = 0;
  for (let i = 0; i < result.data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) assert.equal(result.data[i + channel], original.data[i + channel]);
    if (result.data[i + 3] === 0) transparent++;
    if (result.data[i + 3] > 128) visible++;
  }
  assert.ok(transparent > 0 && visible > 0, asset.file + ': requires transparent exterior and visible subject');
  const corners = [0, result.width - 1, (result.height - 1) * result.width, result.width * result.height - 1];
  assert.ok(corners.every(pixel => result.data[pixel * 4 + 3] === 0), asset.file + ': corner background remains');
  asset.validation = { dimensionsMatch: true, rgbMatch: true, transparentPixels: transparent,
    visiblePixels: visible, cornersTransparent: true };
  console.log('PASS ' + asset.file + ': alpha + original dimensions/RGB');
}
if (!validateOnly) {
  manifest.method = 'built-in image_gen transparent cutout; normalized alpha mask applied to unchanged original RGB';
  manifest.prompt = 'background-extraction: remove only the flat exterior background; preserve original illustration, internal light areas, text, colors, composition and framing; output real transparent alpha. Final RGB is always taken from the original PNG.';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
