import { spawn } from 'node:child_process';

const host = '127.0.0.1';
const port = Number(process.env.SMOKE_PORT ?? 4174);
const origin = `http://${host}:${port}`;
const routes = [
  '/',
  '/events',
  '/people',
  '/companies',
  '/login',
  '/register',
  '/admin/integrations',
  '/site-icon.svg',
];

const server = spawn(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['exec', 'vite', 'preview', '--host', host, '--port', String(port), '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);

let logs = '';
server.stdout.on('data', (chunk) => {
  logs += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  logs += chunk.toString();
});

try {
  await waitForServer(origin);

  const failures = [];
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    const body = await response.text();

    if (!response.ok) {
      failures.push(`${route}: expected 2xx, got ${response.status}`);
      continue;
    }

    if (route.endsWith('.svg')) {
      if (!body.includes('<svg') || !body.includes('Freddy Founders FF icon')) {
        failures.push(`${route}: favicon SVG did not contain the expected FF icon title`);
      }
      continue;
    }

    if (!body.includes('<div id="root"></div>') || !body.includes('Freddy Founders')) {
      failures.push(`${route}: production preview did not serve the Freddy Founders app shell`);
    }
  }

  if (failures.length > 0) {
    console.error('Route smoke failed:\n');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`Route smoke passed for ${routes.length} routes.`);
  }
} finally {
  server.kill('SIGTERM');
}

async function waitForServer(url) {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Vite preview exited before smoke could run.\n${logs}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until preview is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for Vite preview at ${url}.\n${logs}`);
}
