import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(scriptDir, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

/** Font families the app references in styles (must match theme + Ionicons). */
const FONT_MATCHERS = [
  { family: 'PlusJakartaSans_400Regular', pattern: /PlusJakartaSans_400Regular\.[a-f0-9]{32}\.ttf$/i },
  { family: 'PlusJakartaSans_500Medium', pattern: /PlusJakartaSans_500Medium\.[a-f0-9]{32}\.ttf$/i },
  { family: 'PlusJakartaSans_600SemiBold', pattern: /PlusJakartaSans_600SemiBold\.[a-f0-9]{32}\.ttf$/i },
  { family: 'PlusJakartaSans_700Bold', pattern: /PlusJakartaSans_700Bold\.[a-f0-9]{32}\.ttf$/i },
  { family: 'PlusJakartaSans_800ExtraBold', pattern: /PlusJakartaSans_800ExtraBold\.[a-f0-9]{32}\.ttf$/i },
  { family: 'ionicons', pattern: /Ionicons\.[a-f0-9]{32}\.ttf$/i },
];

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.ttf')) {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveFontAssets() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Missing export assets directory: ${assetsDir}`);
  }

  const fontFiles = walkFiles(assetsDir);
  const resolved = [];

  for (const matcher of FONT_MATCHERS) {
    const match = fontFiles.find((filePath) => matcher.pattern.test(path.basename(filePath)));
    if (!match) {
      throw new Error(`Could not find exported font file for ${matcher.family}`);
    }

    const publicPath = `/${path.relative(distDir, match).split(path.sep).join('/')}`;
    resolved.push({ family: matcher.family, url: publicPath });
  }

  return resolved;
}

function buildFontBlock(fonts) {
  const rules = fonts
    .map(
      ({ family, url }) =>
        `@font-face{font-family:${JSON.stringify(family)};src:url(${JSON.stringify(url)}) format('truetype');font-display:swap;}`,
    )
    .join('');

  const preloads = fonts
    .map(({ url }) => `<link rel="preload" href="${url}" as="font" type="font/ttf" />`)
    .join('');

  // Same id expo-font uses so Font.isLoaded() and vector icons work on first paint.
  return `${preloads}<style id="expo-generated-fonts">${rules}</style>`;
}

function injectFonts() {
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing export index.html: ${indexPath}`);
  }

  const fonts = resolveFontAssets();
  const block = buildFontBlock(fonts);
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(/\s*<style id="expo-generated-fonts">[\s\S]*?<\/style>/g, '');
  html = html.replace(/\s*<link rel="preload" href="\/assets\/[^"]+\.ttf"[^>]*\/>/g, '');

  if (!html.includes('</head>')) {
    throw new Error('index.html is missing </head>');
  }

  html = html.replace('</head>', `${block}</head>`);
  fs.writeFileSync(indexPath, html);

  console.log(`Injected ${fonts.length} web fonts into dist/index.html`);
  for (const font of fonts) {
    console.log(`  ${font.family} -> ${font.url}`);
  }
}

injectFonts();
