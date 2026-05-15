# PRD: nativepilot

Status: in-progress
Decision: build now

## Scorecard

Total: 82/100
Band: promising
Last scored: 2026-05-15
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 17/20 | Mobile teams want AI features quickly, but production React Native setup still means navigation, theme, secure keys, streaming UI, provider swaps, tests, and assistant instructions. |
| Demand signal | 17/20 | `kuraydev/react-native-typescript-boilerplate` has 445 stars and 91 forks, is a GitHub template, and recently repositioned around AI-ready React Native. |
| V1 buildability | 17/20 | A focused CLI/template pack can scaffold a small React Native or Expo app shell plus guidance files, fixtures, and smoke checks. |
| Differentiation | 13/15 | Make it Roger-specific by treating AI-native mobile development as a generator + validator + agent handoff system, not just a static boilerplate. |
| Agentic workflow leverage | 12/15 | Ships `AGENTS.md`, assistant rules, architecture maps, task prompts, and proof scripts so coding agents can extend mobile apps safely. |
| Distribution potential | 6/10 | Strong demo potential: “ship an AI chat tab on iOS/Android in minutes”, but React Native setup friction can slow adoption. |

## Pitch

`nativepilot` is an AI-native React Native starter generator that creates a mobile app shell with provider-agnostic LLM hooks, secure configuration boundaries, agent guidance files, and repeatable simulator proof checks.

## Why It Matters

The popular React Native boilerplate signal is not just “people want another template”; it is that mobile developers want the boring production stack already wired together *and* want AI coding tools to understand the project from the first commit.

A Roger-specific version should lean into the missing workflow: agents need a mobile codebase they can safely modify, test, and explain. The value is not copying screens or components from a boilerplate. The value is an opinionated launch lane for AI-native mobile apps where:

- the AI service boundary is explicit and provider-swappable,
- secrets are not embedded in demo screens by accident,
- assistant guidance is treated as first-class project infrastructure,
- generated apps include simulator-ready proof scripts,
- demos can be cleaned out without breaking navigation, theme, or AI wiring.

## Qualification

### Pub Test

Can a smart developer understand it quickly? Yes: “Create an AI-ready React Native app that coding agents can extend without guessing the architecture.”

This lands because it combines two active pains: React Native setup is still heavy, and AI features are becoming expected in consumer and internal mobile apps.

### Competitors / Adjacent Tools

- `kuraydev/react-native-typescript-boilerplate` — source inspiration: comprehensive React Native + TypeScript template with provider-agnostic AI service layer, streaming chat hooks, theme/navigation/localization, and assistant guidance files; checked 2026-05-15 at 445 stars / 91 forks.
- Expo templates — strong ecosystem default, but not specifically agent-native or provider-agnostic AI-first.
- Ignite / React Native starter kits — mature app scaffolding and patterns, but usually not centered on LLM provider adapters, assistant rules, and proof-of-work for coding agents.
- Vercel AI SDK examples — strong AI patterns, but web-first and not a full React Native app launch lane.

### Star / Demand Signal

- GitHub API check on 2026-05-15: `kuraydev/react-native-typescript-boilerplate` had 445 stars, 91 forks, 0 open issues, and a current description emphasizing “AI-Ready React Native + TypeScript Boilerplate OpenAI · Anthropic · Gemini built in”.
- README positioning highlights an AI-ready v6 with OpenAI, Anthropic, Gemini, `useAIChat`, `useAICompletion`, streaming chat UI, and guidance files for Claude Code, Codex/Gemini/Windsurf, Cursor, and Copilot.
- The repo is a GitHub template, which is a useful signal that developers want to instantiate rather than only read it.

### Real Problem

React Native teams adding AI features often face the same sequence of avoidable work:

- pick and wire a chat/completion provider interface,
- decide where API keys live during prototypes versus production,
- implement streaming UI state without janky re-renders,
- keep theme/navigation/localization consistent,
- tell coding assistants the project conventions repeatedly,
- prove that the app still launches after agent edits.

`nativepilot` should reduce that loop to a generator command, explicit safety defaults, and a repeatable verification harness.

### V1 Buildability

V1 can stay small by generating a TypeScript app skeleton and validating files rather than inventing a whole mobile framework. The first useful version can target one path, preferably Expo for fast setup, with a later bare React Native preset.

The generator can be tested with fixture snapshots and file-content assertions without requiring a full iOS/Android build in CI.

## V1 Scope

- TypeScript CLI package.
- `nativepilot create <app-name>` scaffolds an Expo-first React Native app shell.
- Provider-agnostic AI client interface for OpenAI-compatible, Anthropic, Gemini, and local/proxy endpoints.
- Hooks for `useAIChat` and `useAICompletion` with streaming state modeled explicitly.
- Demo AI chat screen with provider/model picker and a clearly labeled development-only API key path.
- Secure-config notes and production boundary docs for moving keys server-side.
- Typed navigation, theme tokens, path aliases, and a minimal localization setup.
- `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, and `.github/copilot-instructions.md` generated from the selected architecture.
- `nativepilot clean-demo` removes showcase screens while preserving AI, navigation, theme, and guidance wiring.
- `nativepilot doctor` checks generated project structure, guidance-file freshness, alias consistency, and unsafe key patterns.
- Fixture-backed tests for generator output, demo cleanup, doctor warnings, and no hidden network behavior.

## Out of Scope

- Copying the source repo implementation, screens, assets, or naming.
- Shipping a full app UI kit or design system in V1.
- Storing real API keys in source-controlled files.
- Backend proxy hosting, auth, billing, push notifications, or app-store deployment.
- Claiming production security for direct mobile-to-LLM calls; V1 should document the limitation and safe path.
- Supporting every React Native architecture option in the first release.

## CLI/API Sketch

```bash
nativepilot create MyAIAssistant --preset expo --providers openai,anthropic,gemini
nativepilot doctor ./MyAIAssistant --fail-on unsafe-key,stale-guidance
nativepilot clean-demo ./MyAIAssistant
nativepilot print-agent-brief ./MyAIAssistant --for codex
```

Generated app usage sketch:

```ts
const { messages, streamMessage, isStreaming, error } = useAIChat({
  config: {
    provider: "openai-compatible",
    baseURL: process.env.EXPO_PUBLIC_AI_PROXY_URL,
    model: "gpt-4o-mini",
  },
});
```

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- Snapshot tests for generated files.
- CLI smoke generating an app into a temp directory and running `nativepilot doctor`.
- README documents the safety model: development keys are demo-only; production apps should use a server/proxy boundary.
- README includes source attribution and explains how the idea differs from a static React Native boilerplate.

## Agent Prompt

Build `nativepilot` as an original, AI-native React Native starter generator. Keep V1 Expo-first, local-first, deterministic, and safety-forward. The wedge is not “another boilerplate”; it is a mobile app launch lane that coding agents can understand, modify, and verify from day one. Include provider-agnostic AI hooks, assistant guidance files, demo cleanup, and a doctor command that catches unsafe key patterns and stale architecture instructions.
