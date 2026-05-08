import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const designDir = path.join(srcDir, 'design');
const allowedFfClassDirs = [designDir];
const allowedHexFiles = new Set([
  path.join(root, 'tokens/source/core.json'),
  path.join(srcDir, 'styles/generated/tokens.css'),
]);
const allowedDesignCssImportFiles = new Set([path.join(srcDir, 'styles/app.css')]);
const sourceExtensions = new Set(['.ts', '.tsx', '.css']);
const typeScriptExtensions = new Set(['.ts', '.tsx']);
const taxonomyDirs = ['foundations', 'primitives', 'composites', 'patterns'];
const componentTaxonomyDirs = ['primitives', 'composites', 'patterns'];
const errors = [];

const registryFile = path.join(designDir, 'registry.ts');
const registrySource = await readFile(registryFile, 'utf8').catch(() => '');
const registryEntries = parseRegistryEntries(registrySource);

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

  if (!isInDesign && typeScriptExtensions.has(path.extname(file))) {
    checkPublicDesignImports({ content, file, relative });
  }

  if (isInDesign && isTaxonomyComponentSource(file)) {
    if (/\bclassName\??\s*:/.test(content) || /\bstyle\??\s*:/.test(content)) {
      errors.push(
        `${relative}: design components must not expose className/style props by default. Add an intentional variant prop instead.`,
      );
    }
  }
}

const requiredArtifacts = [
  path.join(designDir, 'index.ts'),
  path.join(designDir, 'registry.ts'),
  path.join(designDir, 'README.md'),
  path.join(designDir, 'design-system.css'),
  path.join(designDir, 'examples.tsx'),
  path.join(designDir, 'components.tsx'),
  ...taxonomyDirs.map((dir) => path.join(designDir, dir, 'index.ts')),
];

for (const required of requiredArtifacts) {
  try {
    await readFile(required, 'utf8');
  } catch {
    errors.push(`${path.relative(root, required)}: required design-library artifact is missing.`);
  }
}

const indexFile = path.join(designDir, 'index.ts');
const publicIndex = await readFile(indexFile, 'utf8').catch(() => '');
for (const forbiddenLegacyExport of ["'./components'", "'./examples'"]) {
  if (publicIndex.includes(forbiddenLegacyExport)) {
    errors.push(
      `src/design/index.ts: public API must export taxonomy barrels directly, not legacy ${forbiddenLegacyExport}.`,
    );
  }
}

const exportedComponents = await exportedDesignComponentNames();
const registryNames = new Set(registryEntries.map((entry) => entry.name));

for (const name of exportedComponents) {
  if (!registryNames.has(name)) {
    errors.push(
      `src/design/registry.ts: exported primitive/composite/pattern ${name} must be listed in designComponentRegistry.`,
    );
  }
}

for (const entry of registryEntries) {
  if (!exportedComponents.has(entry.name)) {
    errors.push(
      `src/design/registry.ts: ${entry.name} is registered but is not exported by the taxonomy component files.`,
    );
  }

  if (!['primitive', 'composite', 'pattern'].includes(entry.category)) {
    errors.push(
      `src/design/registry.ts: ${entry.name} must have category primitive, composite, or pattern.`,
    );
  }

  if (!['canonical', 'experimental', 'deprecated'].includes(entry.status)) {
    errors.push(
      `src/design/registry.ts: ${entry.name} must have status canonical, experimental, or deprecated.`,
    );
  }
}

if (registryEntries.length !== registryNames.size) {
  errors.push('src/design/registry.ts: component names must be unique.');
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

function isTaxonomyComponentSource(file) {
  if (path.extname(file) !== '.tsx') return false;

  return componentTaxonomyDirs.some((dir) => isWithinAny(file, [path.join(designDir, dir)]));
}

async function exportedDesignComponentNames() {
  const names = new Set();

  for (const dir of componentTaxonomyDirs) {
    const taxonomyDir = path.join(designDir, dir);
    for (const file of await walk(taxonomyDir)) {
      if (path.extname(file) !== '.tsx') continue;

      const source = await readFile(file, 'utf8');
      for (const name of exportedComponentNames(source)) names.add(name);
    }
  }

  return names;
}

function exportedComponentNames(source) {
  return [...source.matchAll(/export function ([A-Z][A-Za-z0-9]*)\(/g)].map((match) => match[1]);
}

function parseRegistryEntries(source) {
  return [
    ...source.matchAll(
      /\{\s*name: '([^']+)',\s*category: '([^']+)',\s*status: '([^']+)',[\s\S]*?allowedInRoutes: (true|false),\s*\}/g,
    ),
  ].map(([, name, category, status, allowedInRoutes]) => ({
    name,
    category,
    status,
    allowedInRoutes: allowedInRoutes === 'true',
  }));
}

function checkPublicDesignImports({ content, file, relative }) {
  for (const specifier of importSpecifiers(content)) {
    const resolved = resolveRelativeImport(file, specifier);
    if (!resolved || !isWithinAny(resolved, [designDir])) continue;

    if (path.normalize(resolved) !== path.normalize(designDir)) {
      errors.push(
        `${relative}: app code may import only the public src/design API, not internal design subpaths (${specifier}).`,
      );
      continue;
    }
  }

  for (const { names, specifier } of namedImportSpecifiers(content)) {
    const resolved = resolveRelativeImport(file, specifier);
    if (!resolved || path.normalize(resolved) !== path.normalize(designDir)) continue;

    for (const name of names) {
      const entry = registryEntries.find((candidate) => candidate.name === name);
      if (entry && !entry.allowedInRoutes) {
        errors.push(
          `${relative}: ${name} is a design-library catalog/pattern artifact and is not allowed in app routes.`,
        );
      }
    }
  }
}

function importSpecifiers(source) {
  return [...source.matchAll(/\b(?:import|export)\b(?:[^'";]*?\bfrom\s*)?['"]([^'"]+)['"]/gs)].map(
    (match) => match[1],
  );
}

function namedImportSpecifiers(source) {
  return [...source.matchAll(/import\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/g)].map(
    ([, names, specifier]) => ({
      names: names
        .split(',')
        .map((name) =>
          name
            .trim()
            .split(/\s+as\s+/)[0]
            ?.trim(),
        )
        .filter(Boolean),
      specifier,
    }),
  );
}

function resolveRelativeImport(file, specifier) {
  if (!specifier.startsWith('.')) return null;
  return path.resolve(path.dirname(file), specifier);
}
