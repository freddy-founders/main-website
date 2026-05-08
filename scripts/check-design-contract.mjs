import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const allowedFfClassDirs = [path.join(srcDir, 'design')];
const allowedHexFiles = new Set([
  path.join(root, 'tokens/source/core.json'),
  path.join(srcDir, 'styles/generated/tokens.css'),
]);
const allowedDesignCssImportFiles = new Set([path.join(srcDir, 'styles/app.css')]);
const sourceExtensions = new Set(['.ts', '.tsx', '.css']);

const errors = [];

for (const file of await walk(srcDir)) {
  if (!sourceExtensions.has(path.extname(file))) continue;

  const content = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  const isInDesign = isWithinAny(file, allowedFfClassDirs);

  if (!isInDesign && /ff-[a-z0-9-]+/.test(content)) {
    errors.push(
      `${relative}: app code must not reference private ff-* design classes. Add/use a primitive from src/design instead.`,
    );
  }

  if (content.includes('design-system.css') && !allowedDesignCssImportFiles.has(file)) {
    errors.push(
      `${relative}: design-system.css may only be imported by src/styles/app.css. App code imports src/design primitives.`,
    );
  }

  if (!allowedHexFiles.has(file) && /#[0-9a-fA-F]{3,8}\b/.test(content)) {
    errors.push(
      `${relative}: raw hex colors are not allowed outside token source/generated token output. Add a token instead.`,
    );
  }
}

const indexFile = path.join(srcDir, 'design/index.ts');
const registryFile = path.join(srcDir, 'design/registry.ts');
const readmeFile = path.join(srcDir, 'design/README.md');
const componentsFile = path.join(srcDir, 'design/components.tsx');
const examplesFile = path.join(srcDir, 'design/examples.tsx');

for (const required of [indexFile, registryFile, readmeFile, componentsFile, examplesFile]) {
  try {
    await readFile(required, 'utf8');
  } catch {
    errors.push(`${path.relative(root, required)}: required design-library artifact is missing.`);
  }
}

const registry = await readFile(registryFile, 'utf8');
for (const name of exportedComponentNames(await readFile(componentsFile, 'utf8'))) {
  if (!registry.includes(`name: '${name}'`)) {
    errors.push(
      `src/design/registry.ts: exported primitive ${name} must be listed in designComponentRegistry.`,
    );
  }
}

if (errors.length > 0) {
  console.error('Design contract check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Design contract check passed.');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isWithinAny(file, dirs) {
  return dirs.some((dir) => {
    const relative = path.relative(dir, file);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  });
}

function exportedComponentNames(source) {
  return [...source.matchAll(/export function ([A-Z][A-Za-z0-9]*)\(/g)].map((match) => match[1]);
}
