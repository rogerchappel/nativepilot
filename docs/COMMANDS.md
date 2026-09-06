# Command Reference

## create

```bash
nativepilot create MyAIAssistant --preset expo --providers openai,anthropic,gemini,local
```

Writes a deterministic Expo app. Refuses non-empty directories unless `--force` is supplied.
Before writing, the command generates the complete scaffold and preflights every
destination. Generation or destination-validation failures leave the target unchanged;
on success, `--force` overwrites nativepilot-managed files and preserves other files.

## doctor

```bash
nativepilot doctor ./MyAIAssistant --fail-on unsafe-key,stale-guidance
```

Checks required files, generated manifest metadata, npm scripts, alias consistency, guidance freshness, and common provider-secret patterns. The generated manifest records whether the demo is installed or was removed by `clean-demo`, so both supported lifecycle states pass while accidental screen deletion still fails.

Malformed, unreadable, or structurally invalid manifest metadata is reported as an
`invalid-manifest` issue associated with `nativepilot.manifest.json`.
Malformed or unreadable package metadata is reported as an `invalid-package`
issue associated with `package.json`; doctor continues running its independent
project checks and returns the usual structured result.

## clean-demo

```bash
nativepilot clean-demo ./MyAIAssistant
```

Removes showcase chat UI and `src/demo`, writes `docs/DEMO_REMOVED.md` as an audit note, and records `demoState: "removed"` in `nativepilot.manifest.json`.
The command validates the project and manifest, checks every output destination, and
stages every planned write before changing managed files. Validation or staging
failures exit nonzero and leave the project untouched.

## print-agent-brief

```bash
nativepilot print-agent-brief ./MyAIAssistant --for codex
```

Prints the shortest useful architecture and verification handoff for a coding agent.
