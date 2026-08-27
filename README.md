# NativePilot

NativePilot is an AI-native Expo React Native starter generator. It creates a mobile app shell that coding agents can understand from the first commit: provider-agnostic AI hooks, explicit secret boundaries, assistant guidance files, and local proof checks.

It is not another static boilerplate. It is a launch lane for teams who want to prototype AI mobile experiences without letting keys, architecture, or agent instructions become folklore.

## Install / run locally

```bash
npm install
npm run build
node dist/src/index.js create MyAIAssistant
node dist/src/index.js doctor ./MyAIAssistant --fail-on unsafe-key,stale-guidance
```

When published, the intended usage is:

```bash
npx nativepilot create MyAIAssistant --preset expo --providers openai,anthropic,gemini,local
cd MyAIAssistant
npm install
npm run typecheck
npm run doctor
npm run start
```

## Commands

See [docs/COMMANDS.md](docs/COMMANDS.md) for full command details.


- `nativepilot create <app-name>` — scaffold an Expo-first React Native app.
- `nativepilot doctor [root]` — check structure, aliases, guidance freshness, and unsafe key patterns.
- `nativepilot clean-demo [root]` — remove showcase screens while preserving AI, theme, navigation, and guidance wiring.
- `nativepilot print-agent-brief [root] --for codex` — print a concise handoff for coding agents.

## Runnable generator demo

Exercise generation, safety validation, and the coding-agent handoff against a
temporary app:

```bash
bash demo/run-generator-tour.sh
```

The interactive demo installs nothing inside the generated app and removes its temporary
files on exit. The release check separately installs a disposable generated app
from a fresh lockfile, requires Expo's dependency-version check and Expo Doctor
to pass, and typechecks it. See [the generator demo walkthrough](docs/GENERATOR_DEMO.md) for
the exact claims it verifies and what remains outside its scope.

## Generated app personality

NativePilot apps are small, dark, explicit, and agent-readable. The generated demo includes:

- Expo Router app shell.
- Provider-agnostic `src/ai` contract.
- `useAIChat` and `useAICompletion` hooks with streaming state.
- OpenAI-compatible, Anthropic, Gemini, and local/proxy configuration lanes.
- Theme tokens, route constants, and minimal localization.
- `AGENTS.md`, `CLAUDE.md`, Cursor rules, and Copilot instructions.
- Security docs that say the quiet part plainly: mobile bundles are public.

## Safety model

The generator performs no hidden network calls and does not install dependencies inside generated apps. Development API key placeholders are allowed in `.env.example`, but production provider secrets must live behind a server or trusted proxy. `doctor` flags common provider-key patterns and can fail CI with:

```bash
nativepilot doctor . --fail-on unsafe-key,stale-guidance
```

## Source attribution

The idea was inspired by demand around AI-ready React Native boilerplates, especially `kuraydev/react-native-typescript-boilerplate` as noted in `docs/PRD.md`. NativePilot is original code and focuses on generator + validator + agent handoff workflow rather than copying a static app template.

## Verification

```bash
npm run check
npm test
npm run build
npm run smoke
npm run generated:smoke
bash scripts/validate.sh
```

## Status

MVP. Expo-first only. Local-first by design.
