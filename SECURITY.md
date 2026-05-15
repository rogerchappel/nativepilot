# Security Policy

## Supported versions

NativePilot is pre-1.0. Security fixes target the current `main` branch.

## Reporting a vulnerability

Please open a private GitHub security advisory or contact the maintainer directly. Do not publish exploit details before a fix is available.

## Scope

NativePilot generates local files and runs local checks. The generator should not make hidden network calls, collect telemetry, or install packages in generated apps.

Generated apps may include development-only `.env.example` placeholders. Real provider keys must not be committed and must not be shipped in a production mobile bundle. Use a server or trusted proxy for production LLM traffic.

## Useful local checks

```bash
nativepilot doctor . --fail-on unsafe-key,stale-guidance
npm test
```
