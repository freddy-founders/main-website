import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const featuresDir = path.join(rootDir, 'features');
const userActionsFile = path.join(srcDir, 'domain', 'userActions.ts');
const interactiveComponents = new Set(['Button', 'ButtonLink', 'NavLink', 'form']);
const sourceExtensions = new Set(['.tsx']);
const errors = [];
const ignoredInteractivePaths = [
  path.join('src', 'design', 'examples.tsx'),
  path.join('src', 'design', 'patterns'),
];

const { actionCapabilities, productCapabilities, userActionWorkflows } = await import(
  pathToFileURL(userActionsFile).href
);
const actionCapabilityList = Object.values(actionCapabilities);
const productCapabilityList = Object.values(productCapabilities);
const workflowIds = new Set(Object.values(userActionWorkflows).map((workflow) => workflow.id));
const actionIds = new Set(actionCapabilityList.map((capability) => capability.id));
const userActionsByKey = new Map(
  Object.entries(actionCapabilities).map(([key, capability]) => [key, capability.id]),
);
const featureDocuments = await collectFeatureDocuments(featuresDir);
const featureDocumentsByPath = new Map(
  featureDocuments.map((document) => [document.relativePath, document]),
);
const featureTags = new Set(featureDocuments.flatMap((document) => [...document.actionTags]));

checkActionCapabilityManifest(actionCapabilityList);
checkProductCapabilityManifest(productCapabilityList, featureDocumentsByPath);
checkCucumberFeatureOwnership(featureDocuments, productCapabilityList);

for (const file of await walk(srcDir)) {
  if (!sourceExtensions.has(path.extname(file))) continue;
  if (isIgnoredInteractivePath(file)) continue;
  await checkInteractiveAnnotations(file, userActionsByKey, actionIds);
}

for (const capability of actionCapabilityList) {
  if (!capability.verification.required.includes('bdd')) continue;
  if (!featureTags.has(capability.id)) {
    errors.push(`features/**/*.feature: missing @action.${capability.id} coverage for action.`);
  }
}

for (const actionId of featureTags) {
  if (!actionIds.has(actionId)) {
    errors.push(
      `features/**/*.feature: @action.${actionId} is not defined in src/domain/userActions.ts.`,
    );
  }
}

if (errors.length > 0) {
  console.error('Action coverage check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Action coverage check passed.');

function checkActionCapabilityManifest(capabilities) {
  const seenIds = new Set();

  for (const capability of capabilities) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(capability.id)) {
      errors.push(`src/domain/userActions.ts: action id "${capability.id}" must be kebab-case.`);
    }

    if (seenIds.has(capability.id)) {
      errors.push(`src/domain/userActions.ts: duplicate action id "${capability.id}".`);
    }
    seenIds.add(capability.id);

    if (!capability.label || !capability.surface || !capability.boundary) {
      errors.push(
        `src/domain/userActions.ts: action "${capability.id}" must define label, surface, and boundary.`,
      );
    }

    if (!capability.verification.required.includes('bdd')) {
      errors.push(`src/domain/userActions.ts: action "${capability.id}" must require BDD.`);
    }

    if (capability.kind === 'mutation' && !capability.verification.required.includes('unit')) {
      errors.push(
        `src/domain/userActions.ts: mutation "${capability.id}" must require unit coverage.`,
      );
    }

    if (capability.kind === 'mutation' && capability.risk === 'high') {
      if (!capability.verification.required.includes('mbt') && !capability.verification.mbtExempt) {
        errors.push(
          `src/domain/userActions.ts: high-risk mutation "${capability.id}" must require MBT or declare an explicit mbtExempt reason.`,
        );
      }
    }
  }
}

function checkProductCapabilityManifest(capabilities, featureDocumentsByPath) {
  const seenIds = new Set();
  const coveredActionIds = new Set();

  for (const capability of capabilities) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(capability.id)) {
      errors.push(
        `src/domain/userActions.ts: product capability id "${capability.id}" must be kebab-case.`,
      );
    }

    if (seenIds.has(capability.id)) {
      errors.push(`src/domain/userActions.ts: duplicate product capability id "${capability.id}".`);
    }
    seenIds.add(capability.id);

    if (capability.tag !== `@capability.${capability.id}`) {
      errors.push(
        `src/domain/userActions.ts: product capability "${capability.id}" tag must be @capability.${capability.id}.`,
      );
    }

    if (capability.cucumberFeatures.length === 0) {
      errors.push(
        `src/domain/userActions.ts: product capability "${capability.id}" must list at least one Cucumber feature.`,
      );
    }

    for (const workflow of capability.workflows) {
      if (!workflowIds.has(workflow)) {
        errors.push(
          `src/domain/userActions.ts: product capability "${capability.id}" references missing workflow "${workflow}".`,
        );
      }
    }

    const actionTagsInCapabilityFeatures = new Set();
    for (const featurePath of capability.cucumberFeatures) {
      const document = featureDocumentsByPath.get(featurePath);
      if (!document) {
        errors.push(
          `src/domain/userActions.ts: product capability "${capability.id}" references missing Cucumber feature ${featurePath}.`,
        );
        continue;
      }

      if (!document.capabilityTags.has(capability.id)) {
        errors.push(
          `${featurePath}: Feature must carry ${capability.tag} to satisfy product capability "${capability.id}".`,
        );
      }

      for (const actionTag of document.actionTags) actionTagsInCapabilityFeatures.add(actionTag);
    }

    for (const actionId of capability.requiredActions) {
      if (!actionIds.has(actionId)) {
        errors.push(
          `src/domain/userActions.ts: product capability "${capability.id}" references unknown action "${actionId}".`,
        );
        continue;
      }

      coveredActionIds.add(actionId);
      if (!actionTagsInCapabilityFeatures.has(actionId)) {
        errors.push(
          `features/**/*.feature: product capability "${capability.id}" requires @action.${actionId} in one of its Cucumber features.`,
        );
      }
    }
  }

  for (const action of actionCapabilityList) {
    if (!coveredActionIds.has(action.id)) {
      errors.push(
        `src/domain/userActions.ts: action "${action.id}" must belong to at least one product capability requiredActions list.`,
      );
    }
  }
}

function checkCucumberFeatureOwnership(featureDocuments, productCapabilities) {
  const knownCapabilityIds = new Set(productCapabilities.map((capability) => capability.id));
  const referencedFeaturePaths = new Set(
    productCapabilities.flatMap((capability) => capability.cucumberFeatures),
  );

  for (const document of featureDocuments) {
    if (!referencedFeaturePaths.has(document.relativePath)) {
      errors.push(
        `${document.relativePath}: Cucumber Feature must be listed under a product capability in src/domain/userActions.ts.`,
      );
    }

    if (document.capabilityTags.size === 0) {
      errors.push(
        `${document.relativePath}: Feature must carry at least one @capability.<id> tag.`,
      );
    }

    for (const capabilityTag of document.capabilityTags) {
      if (!knownCapabilityIds.has(capabilityTag)) {
        errors.push(
          `${document.relativePath}: @capability.${capabilityTag} is not defined in productCapabilities.`,
        );
      }
    }
  }
}

async function checkInteractiveAnnotations(file, userActionsByKey, actionIds) {
  const source = await readFile(file, 'utf8');
  const relative = path.relative(rootDir, file);
  const jsxTags = [...source.matchAll(/<([A-Z][A-Za-z0-9]*|form)\b([\s\S]*?)(\/?)>/g)];

  for (const match of jsxTags) {
    const [rawTag, componentName, attributes] = match;
    if (!interactiveComponents.has(componentName)) continue;
    if (rawTag.startsWith('</')) continue;

    const line = lineNumberForIndex(source, match.index ?? 0);
    const actionMatch = attributes.match(/data-user-action=\{userActions\.([A-Za-z0-9_]+)\}/);
    const stringActionMatch = attributes.match(/data-user-action="([^"]+)"/);

    if (!actionMatch && !stringActionMatch) {
      errors.push(
        `${relative}:${line}: <${componentName}> is interactive and must declare data-user-action={userActions.<name>}.`,
      );
      continue;
    }

    if (actionMatch) {
      const actionKey = actionMatch[1];
      const actionId = userActionsByKey.get(actionKey);
      if (!actionId) {
        errors.push(
          `${relative}:${line}: data-user-action references unknown userActions.${actionKey}.`,
        );
      }
      continue;
    }

    const actionId = stringActionMatch[1];
    if (!actionIds.has(actionId)) {
      errors.push(
        `${relative}:${line}: data-user-action="${actionId}" is not defined in src/domain/userActions.ts.`,
      );
    }
  }
}

async function collectFeatureDocuments(directory) {
  const documents = [];
  for (const file of await walk(directory)) {
    if (!file.endsWith('.feature')) continue;
    const source = await readFile(file, 'utf8');
    const relativePath = path.relative(rootDir, file);
    const featureIndex = source.search(/^\s*Feature:/m);
    const featurePrefix = featureIndex >= 0 ? source.slice(0, featureIndex) : '';

    documents.push({
      relativePath,
      capabilityTags: collectTags(featurePrefix, /@capability\.([A-Za-z0-9-]+)/g),
      actionTags: collectTags(source, /@action\.([A-Za-z0-9-]+)/g),
    });
  }
  return documents;
}

function collectTags(source, pattern) {
  const tags = new Set();
  for (const match of source.matchAll(pattern)) {
    tags.add(match[1]);
  }
  return tags;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function isIgnoredInteractivePath(file) {
  const relative = path.relative(rootDir, file);
  return ignoredInteractivePaths.some(
    (ignoredPath) => relative === ignoredPath || relative.startsWith(`${ignoredPath}${path.sep}`),
  );
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split('\n').length;
}
