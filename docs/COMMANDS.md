# Command Reference

## create

```bash
nativepilot create MyAIAssistant --preset expo --providers openai,anthropic,gemini,local
```

Writes a deterministic Expo app. Refuses non-empty directories unless `--force` is supplied.

## doctor

```bash
nativepilot doctor ./MyAIAssistant --fail-on unsafe-key,stale-guidance
```

Checks required files, generated manifest metadata, npm scripts, alias consistency, guidance freshness, and common provider-secret patterns.

## clean-demo

```bash
nativepilot clean-demo ./MyAIAssistant
```

Removes showcase chat UI and `src/demo`, then writes `docs/DEMO_REMOVED.md` as an audit note.

## print-agent-brief

```bash
nativepilot print-agent-brief ./MyAIAssistant --for codex
```

Prints the shortest useful architecture and verification handoff for a coding agent.
