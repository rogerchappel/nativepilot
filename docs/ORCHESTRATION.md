# NativePilot Orchestration

NativePilot is built as a local-first CLI so humans and agents share the same deterministic command surface.

## Ownership slices

1. **Generator** owns app file creation and deterministic provider selection.
2. **Doctor** owns local proof checks and fails safely on missing structure or unsafe secrets.
3. **Demo cleanup** owns removing showcase UI without damaging reusable architecture.
4. **Guidance** owns generated instructions for coding assistants.
5. **Docs/release** owns public onboarding, attribution, safety model, and contribution flow.

## Agent handoff flow

```bash
nativepilot create MyAIAssistant
nativepilot print-agent-brief ./MyAIAssistant --for codex
nativepilot doctor ./MyAIAssistant --fail-on unsafe-key,stale-guidance
```

Agents should read generated `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/SECURITY_MODEL.md` before modifying app code.

## Verification gates

- `npm run check`
- `npm test`
- `npm run build`
- `npm run smoke`
- `bash scripts/validate.sh`
- Real generated-app smoke via `scripts/smoke.sh`
