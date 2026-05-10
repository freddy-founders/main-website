import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const featuresDir = path.join(rootDir, 'features');
const manifestFile = path.join(rootDir, 'src', 'domain', 'userActions.ts');
const errors = [];

const { actionCapabilities, userActionWorkflows } = await import(pathToFileURL(manifestFile).href);
const capabilities = Object.values(actionCapabilities);
const capabilityIds = new Set(capabilities.map((capability) => capability.id));
const workflows = Object.values(userActionWorkflows);
const workflowsById = new Map(workflows.map((workflow) => [workflow.id, workflow]));
const featureTags = await collectFeatureActionTags(featuresDir);

checkMbtObligations(capabilities, workflowsById);
for (const workflow of workflows) checkWorkflowModel(workflow);

if (errors.length > 0) {
  console.error('Model workflow coverage check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Model workflow coverage check passed for ${workflows.length} workflows.`);

function checkMbtObligations(capabilities, workflowsById) {
  for (const capability of capabilities) {
    const requiresMbt = capability.verification.required.includes('mbt');

    if (!requiresMbt && capability.workflow) {
      errors.push(
        `src/domain/userActions.ts: capability "${capability.id}" declares workflow "${capability.workflow}" but does not require MBT.`,
      );
      continue;
    }

    if (!requiresMbt) continue;

    if (!capability.workflow) {
      errors.push(
        `src/domain/userActions.ts: capability "${capability.id}" requires MBT but has no workflow id.`,
      );
      continue;
    }

    const workflow = workflowsById.get(capability.workflow);
    if (!workflow) {
      errors.push(
        `src/domain/userActions.ts: capability "${capability.id}" requires missing workflow "${capability.workflow}".`,
      );
      continue;
    }

    if (!workflow.events.includes(capability.id)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" must list capability "${capability.id}" as an event.`,
      );
    }
  }
}

function checkWorkflowModel(workflow) {
  const states = new Set(workflow.states);
  const events = new Set(workflow.events);
  const transitionedEvents = new Set();
  const forbiddenEvents = new Set();
  const touchedStates = new Set([workflow.initialState]);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workflow.id)) {
    errors.push(`src/domain/userActions.ts: workflow id "${workflow.id}" must be kebab-case.`);
  }

  if (!states.has(workflow.initialState)) {
    errors.push(
      `src/domain/userActions.ts: workflow "${workflow.id}" initial state "${workflow.initialState}" is not listed in states.`,
    );
  }

  for (const event of workflow.events) {
    if (!capabilityIds.has(event)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" references undefined event "${event}".`,
      );
    }
    if (!featureTags.has(event)) {
      errors.push(
        `features/**/*.feature: workflow "${workflow.id}" event "${event}" lacks @action.${event} BDD coverage.`,
      );
    }
  }

  for (const transition of workflow.transitions) {
    if (!states.has(transition.from)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" transition uses unknown from-state "${transition.from}".`,
      );
    }
    if (!states.has(transition.to)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" transition uses unknown to-state "${transition.to}".`,
      );
    }
    if (!events.has(transition.action)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" transition uses action "${transition.action}" not listed in events.`,
      );
    }
    transitionedEvents.add(transition.action);
    touchedStates.add(transition.from);
    touchedStates.add(transition.to);
  }

  for (const forbidden of workflow.forbiddenTransitions) {
    if (!states.has(forbidden.state)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" forbidden transition uses unknown state "${forbidden.state}".`,
      );
    }
    if (!events.has(forbidden.action)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" forbidden transition uses action "${forbidden.action}" not listed in events.`,
      );
    }
    if (!forbidden.reason) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" forbidden transition for "${forbidden.action}" must explain why it is forbidden.`,
      );
    }
    forbiddenEvents.add(forbidden.action);
    touchedStates.add(forbidden.state);
  }

  if (workflow.requiredCoverage.includes('states')) {
    for (const state of states) {
      if (!touchedStates.has(state)) {
        errors.push(
          `src/domain/userActions.ts: workflow "${workflow.id}" state "${state}" is not covered by an initial state, transition, or forbidden transition.`,
        );
      }
    }
  }

  if (workflow.requiredCoverage.includes('transitions') && workflow.transitions.length === 0) {
    errors.push(
      `src/domain/userActions.ts: workflow "${workflow.id}" requires transition coverage.`,
    );
  }

  if (
    workflow.requiredCoverage.includes('forbidden-transitions') &&
    workflow.forbiddenTransitions.length === 0
  ) {
    errors.push(
      `src/domain/userActions.ts: workflow "${workflow.id}" requires forbidden-transition coverage.`,
    );
  }

  for (const event of events) {
    if (!transitionedEvents.has(event) && !forbiddenEvents.has(event)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" event "${event}" is not covered by an allowed or forbidden transition.`,
      );
    }
  }

  for (const requiredCoverage of ['states', 'transitions', 'forbidden-transitions']) {
    if (!workflow.requiredCoverage.includes(requiredCoverage)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" must require ${requiredCoverage} coverage.`,
      );
    }
  }

  for (const evidencePath of [
    'scripts/check-model-workflow-coverage.mjs',
    'scripts/test-model-workflows.mjs',
  ]) {
    if (!workflow.evidence.includes(evidencePath)) {
      errors.push(
        `src/domain/userActions.ts: workflow "${workflow.id}" evidence must include ${evidencePath}.`,
      );
    }
  }
}

async function collectFeatureActionTags(directory) {
  const tags = new Set();
  for (const file of await walk(directory)) {
    if (!file.endsWith('.feature')) continue;
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/@action\.([A-Za-z0-9-]+)/g)) {
      tags.add(match[1]);
    }
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
