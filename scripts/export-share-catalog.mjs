// Public storefront data only. Never read the private scraper or review export.
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const projectRoot = process.env.CATALOG_PROJECT_ROOT
  ? resolve(process.env.CATALOG_PROJECT_ROOT)
  : resolve(fileURLToPath(new URL('..', import.meta.url)));
const { business, shopCategories } = await import(pathToFileURL(resolve(projectRoot, 'src/data/catalog.js')));
const { products } = await import(pathToFileURL(resolve(projectRoot, 'src/data/products.js')));
const { site } = await import(pathToFileURL(resolve(projectRoot, 'src/data/site.js')));
const { hasPublishedOptionalValue, hasUnsupportedProductClaims } = await import(pathToFileURL(resolve(projectRoot, 'src/data/product-seo-policy.js')));
const publicRoot = realpathSync(resolve(projectRoot, 'public'));
const output = resolve(process.env.CATALOG_DATA_PATH || resolve(projectRoot, 'tmp/pdfs/share-catalog-data.json'));
const excluded = [];
const codes = new Set();

function localImage(product) {
  for (const image of [...(product.images || []), product.image].filter(Boolean)) {
    if (!image.startsWith('/') || image.startsWith('//')) continue;
    const candidate = resolve(publicRoot, image.slice(1));
    if (!existsSync(candidate)) continue;
    const actual = realpathSync(candidate);
    const rel = relative(publicRoot, actual);
    if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) continue;
    return actual;
  }
  return '';
}

const active = products.filter(p => p.active !== false);
const knownCategories = new Set(shopCategories.map(c => c.slug));
if (active.some(p => !knownCategories.has(p.collectionSlug))) throw Error('Unmapped storefront category');
const categories = shopCategories.map(category => ({
  slug: category.slug,
  name: category.name,
  products: active.filter(p => p.collectionSlug === category.slug).flatMap(product => {
    if (!product.isLegacyImageProduct && (product.imageRightsStatus !== 'confirmed' || String(product.imageRightsSource || '').trim().length < 8)) {
      excluded.push({id:product.id,name:product.name,reason:'New product needs confirmed image-rights evidence'});
      return [];
    }
    const imagePath = localImage(product);
    if (!imagePath) {
      excluded.push({ id: product.id, name: product.name, reason: 'No existing local public image' });
      return [];
    }
    // Derived from identity, independent of sort order, selection, or category.
    const code = 'LI-' + createHash('sha256').update(product.id).digest('hex').slice(0, 8).toUpperCase();
    if (codes.has(code)) throw Error(`Duplicate catalog code: ${code}`);
    codes.add(code);
    const checked = product.detailsVerified === true && !hasUnsupportedProductClaims(product);
    const websiteUrl = `${site.origin}/products/${product.slug || product.id}`;
    const message = `Hello Lucky Interiors, I am interested in ${code} - ${product.name}. ${websiteUrl} Please confirm the current price and specifications.`;
    return [{
      id: product.id, code, name: product.name, imagePath, websiteUrl,
      whatsappUrl: `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`,
      description: checked ? product.description : '',
      dimensions: checked && hasPublishedOptionalValue(product.dimensions) ? product.dimensions : '',
      material: checked && hasPublishedOptionalValue(product.material) ? product.material : '',
      price: product.offerVerified === true && Number(product.price) > 0 ? Number(product.price) : null,
    }];
  }).sort((a,b) => a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id))
})).filter(c => c.products.length);

const data = {
  version: 1,
  generatedAt: new Date().toISOString(),
  business: { name: business.name, phoneDisplay: business.phoneDisplay, email: business.email,
    whatsappNumber: business.whatsappNumber, website: site.origin, logoPath: resolve(publicRoot, 'lucky-interiors-logo-640.webp') },
  activeStorefrontCount: active.length,
  categories, excluded,
};
await mkdir(resolve(output, '..'), {recursive: true});
await writeFile(output, JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({output,categories:categories.length,products:codes.size,excluded:excluded.length}));
