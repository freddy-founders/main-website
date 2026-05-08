# Ports

Ports are the interfaces the application core depends on.

```text
UI / routes
  -> application services
    -> ports
      <- adapters
```

Rules:

- Domain and application code may depend on ports.
- Domain and application code must not import Supabase, Cloudflare, browser APIs, or framework-specific clients directly.
- Adapters implement ports for real infrastructure or tests.
