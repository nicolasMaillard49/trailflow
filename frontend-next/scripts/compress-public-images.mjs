import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || './public/images');

// Resize cap : mosaic plus large car affichée full-bleed, le reste 1600
function targetWidth(rel) {
  if (rel.includes('gallery-mosaic')) return 2000;
  return 1600;
}

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.isFile() && /\.(png|jpe?g)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = await walk(ROOT);
console.log(`Found ${files.length} images under ${ROOT}\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const before = (await fs.stat(file)).size;
  totalBefore += before;

  const img = sharp(file);
  const meta = await img.metadata();
  const cap = targetWidth(rel);
  const ext = path.extname(file).toLowerCase();

  let pipeline = sharp(file, { failOn: 'none' });
  if (meta.width && meta.width > cap) {
    pipeline = pipeline.resize({ width: cap, withoutEnlargement: true });
  }

  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 85, effort: 10 });
  } else {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  }

  const buf = await pipeline.toBuffer();

  // Only overwrite if smaller (palette mode can sometimes inflate small files)
  if (buf.length < before) {
    await fs.writeFile(file, buf);
    totalAfter += buf.length;
    const ratio = ((1 - buf.length / before) * 100).toFixed(1);
    console.log(`  ${rel.padEnd(40)} ${(before/1024).toFixed(0).padStart(6)} KB → ${(buf.length/1024).toFixed(0).padStart(6)} KB  (-${ratio}%)`);
  } else {
    totalAfter += before;
    console.log(`  ${rel.padEnd(40)} ${(before/1024).toFixed(0).padStart(6)} KB  (kept, recompression larger)`);
  }
}

console.log(`\nTotal: ${(totalBefore/1024/1024).toFixed(2)} MB → ${(totalAfter/1024/1024).toFixed(2)} MB  (-${((1-totalAfter/totalBefore)*100).toFixed(1)}%)`);
