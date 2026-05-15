# Contributing

Thanks for helping make AI-native mobile starts safer and less mysterious.

## Local setup

```bash
npm install
npm run check
npm test
npm run smoke
```

## Principles

- Keep NativePilot local-first and deterministic.
- Do not add hidden network calls to generation or tests.
- Keep mobile provider keys development-only and loudly documented.
- Prefer small, reviewable changes with tests.
- Update generated guidance when architecture changes.

## Pull request checklist

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run smoke`
- [ ] Docs updated for user-visible behavior
- [ ] No real secrets in fixtures or generated examples
