import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const manifestFile = path.join(rootDir, 'src', 'domain', 'userActions.ts');
const routerFile = path.join(rootDir, 'src', 'router.tsx');
const routes = [
  '/',
  '/events',
  '/people',
  '/companies',
  '/login',
  '/register',
  '/admin',
  '/admin/integrations',
];
const errors = [];

const { actionCapabilities } = await import(pathToFileURL(manifestFile).href);
const { AppRouter } = await import(pathToFileURL(routerFile).href);
const actionIds = new Set(Object.values(actionCapabilities).map((capability) => capability.id));

for (const route of routes) {
  const html = renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(AppRouter)),
  );
  checkRenderedRoute(route, html);
}

if (errors.length > 0) {
  console.error('Rendered action audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Rendered action audit passed for ${routes.length} routes.`);

function checkRenderedRoute(route, html) {
  const interactiveTags = [...html.matchAll(/<(a|button|form)\b([^>]*)>/g)];

  for (const match of interactiveTags) {
    const [, tagName, attributes] = match;
    const actionMatch = attributes.match(/data-user-action="([^"]+)"/);
    const label = renderedLabelFor(html, match.index ?? 0);

    if (!actionMatch) {
      errors.push(
        `${route}: rendered <${tagName}>${label ? ` (${label})` : ''} is interactive and lacks data-user-action.`,
      );
      continue;
    }

    const actionId = actionMatch[1];
    if (!actionIds.has(actionId)) {
      errors.push(
        `${route}: rendered <${tagName}> references unknown data-user-action="${actionId}".`,
      );
    }
  }
}

function renderedLabelFor(html, tagStartIndex) {
  const close = html.indexOf('>', tagStartIndex);
  if (close === -1) return '';
  const nextCloseTag = html.indexOf('</', close);
  if (nextCloseTag === -1) return '';
  return html
    .slice(close + 1, nextCloseTag)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}
