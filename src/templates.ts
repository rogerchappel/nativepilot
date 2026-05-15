import path from 'node:path';
import type { CreateOptions, GeneratedFile, Provider } from './types.js';

const providerLabels: Record<Provider, string> = {
  openai: 'OpenAI-compatible',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  local: 'Local/proxy'
};

export function normalizeAppName(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '') || 'NativePilotApp';
}

export function packageNameFor(appName: string): string {
  return normalizeAppName(appName).toLowerCase().replace(/_/g, '-');
}

export function moduleNameFor(appName: string): string {
  return normalizeAppName(appName).replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function parseProviders(value: string | undefined): Provider[] {
  const raw = value?.split(',').map((item) => item.trim()).filter(Boolean) ?? ['openai', 'anthropic', 'gemini', 'local'];
  const allowed = new Set<Provider>(['openai', 'anthropic', 'gemini', 'local']);
  const providers: Provider[] = [];
  for (const item of raw) {
    if (!allowed.has(item as Provider)) throw new Error(`Unknown provider "${item}". Use openai,anthropic,gemini,local.`);
    if (!providers.includes(item as Provider)) providers.push(item as Provider);
  }
  return providers;
}

export function createFiles(options: CreateOptions): GeneratedFile[] {
  const displayName = moduleNameFor(options.name);
  const packageName = packageNameFor(options.name);
  const providers = options.providers;
  const providerList = providers.map((provider) => `- ${providerLabels[provider]} (${provider})`).join('\n');
  return [
    file('package.json', JSON.stringify({
      name: packageName,
      version: '0.1.0',
      private: true,
      main: 'expo-router/entry',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
        test: 'node scripts/nativepilot-smoke.mjs',
        'nativepilot:doctor': 'nativepilot doctor .',
        'nativepilot:brief': 'nativepilot print-agent-brief . --for codex'
      },
      dependencies: {
        '@expo/vector-icons': '^14.0.4',
        '@react-navigation/native': '^6.1.18',
        expo: '~51.0.0',
        'expo-constants': '~16.0.2',
        'expo-linking': '~6.3.1',
        'expo-router': '~3.5.23',
        'expo-secure-store': '~13.0.2',
        react: '18.2.0',
        'react-native': '0.74.5',
        'react-native-safe-area-context': '4.10.5',
        'react-native-screens': '3.31.1'
      },
      devDependencies: {
        '@types/react': '~18.2.79',
        typescript: '~5.3.3'
      }
    }, null, 2) + '\n'),
    file('app.json', `{"expo":{"name":"${displayName}","slug":"${packageName}","scheme":"${packageName}","version":"0.1.0","orientation":"portrait","platforms":["ios","android","web"],"plugins":["expo-router","expo-secure-store"],"extra":{"nativepilot":{"guidanceVersion":"1"}}}}\n`),
    file('tsconfig.json', `{"extends":"expo/tsconfig.base","compilerOptions":{"strict":true,"baseUrl":".","paths":{"@/*":["src/*"],"@app/*":["app/*"]}},"include":["app","src","nativepilot.config.ts","expo-env.d.ts"]}\n`),
    file('expo-env.d.ts', '/// <reference types="expo/types" />\n'),
    file('.gitignore', 'node_modules/\n.expo/\ndist/\n.env\n.env.*\n!.env.example\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n'),
    file('.env.example', envExample(providers)),
    file('nativepilot.config.ts', configFile(providers)),
    file('README.md', generatedReadme(displayName, providerList)),
    file('AGENTS.md', agentsMd(displayName)),
    file('CLAUDE.md', claudeMd(displayName)),
    file('.cursor/rules/nativepilot.mdc', cursorRules(displayName)),
    file('.github/copilot-instructions.md', copilotInstructions(displayName)),
    file('docs/ARCHITECTURE.md', architectureDoc(displayName)),
    file('docs/SECURITY_MODEL.md', securityDoc(providerList)),
    file('docs/PROVIDER_BOUNDARY.md', providerBoundaryDoc()),
    file('docs/AGENT_BRIEF.md', agentBrief(displayName)),
    file('scripts/nativepilot-smoke.mjs', smokeScript(), true),
    file('nativepilot.manifest.json', manifestFile(displayName, providers)),
    file('app/_layout.tsx', layoutTsx()),
    file('app/index.tsx', homeScreen(displayName)),
    file('app/chat.tsx', chatScreen()),
    file('src/ai/types.ts', aiTypes()),
    file('src/ai/providers.ts', aiProviders(providers)),
    file('src/ai/client.ts', aiClient()),
    file('src/ai/useAIChat.ts', useAIChat()),
    file('src/ai/useAICompletion.ts', useAICompletion()),
    file('src/config/safety.ts', safetyConfig()),
    file('src/i18n/en.ts', i18n()),
    file('src/theme/tokens.ts', themeTokens()),
    file('src/navigation/routes.ts', routes()),
    file('src/demo/demoContent.ts', demoContent())
  ];
}

function file(path: string, content: string, executable = false): GeneratedFile { return { path, content, executable }; }

function envExample(providers: Provider[]): string {
  const lines = ['# Development-only values. Never commit real keys.', 'EXPO_PUBLIC_AI_PROVIDER=local', 'EXPO_PUBLIC_AI_MODEL=local-demo', 'EXPO_PUBLIC_AI_PROXY_URL=http://localhost:8787/v1'];
  if (providers.includes('openai')) lines.push('EXPO_PUBLIC_OPENAI_API_KEY=dev-only-never-production');
  if (providers.includes('anthropic')) lines.push('EXPO_PUBLIC_ANTHROPIC_API_KEY=dev-only-never-production');
  if (providers.includes('gemini')) lines.push('EXPO_PUBLIC_GEMINI_API_KEY=dev-only-never-production');
  return `${lines.join('\n')}\n`;
}

function configFile(providers: Provider[]): string { return `export const nativepilotConfig = {\n  guidanceVersion: '1',\n  providers: ${JSON.stringify(providers)},\n  productionKeyBoundary: 'server-or-proxy-required'\n} as const;\n`; }
function generatedReadme(name: string, providerList: string): string { return `# ${name}\n\nGenerated by nativepilot: an Expo-first, AI-native React Native launch lane for humans and coding agents.\n\n## Providers\n\n${providerList}\n\n## Start\n\n\`\`\`bash\nnpm install\nnpm run start\nnpm run nativepilot:doctor\n\`\`\`\n\n## Safety\n\nThe demo may read development-only \`EXPO_PUBLIC_*\` values. Production apps must route LLM calls through a server or trusted proxy. Do not ship provider secrets inside a mobile bundle.\n\n## Agent workflow\n\nRead \`AGENTS.md\`, \`docs/ARCHITECTURE.md\`, and \`docs/SECURITY_MODEL.md\` before editing AI, config, or navigation code. Run \`npm test\` and \`nativepilot doctor .\` after changes.\n`; }
function agentsMd(name: string): string { return `# AGENTS.md\n\nYou are working in ${name}, a nativepilot-generated Expo app.\n\n## Rules\n- Keep provider calls behind \`src/ai/client.ts\`.\n- Do not commit real API keys or production secrets.\n- Preserve typed route constants in \`src/navigation/routes.ts\`.\n- Update \`docs/ARCHITECTURE.md\` when moving boundaries.\n- Run \`npm test\` and \`nativepilot doctor .\` before handoff.\n`; }
function claudeMd(name: string): string { return `# Claude guidance for ${name}\n\nNativePilot guidance: prefer small, testable edits. Treat direct mobile-to-provider calls as prototype-only. Explain any security boundary change in docs.\n`; }
function cursorRules(name: string): string { return `---\ndescription: NativePilot rules for ${name}\nglobs: ["app/**/*.tsx", "src/**/*.ts", "src/**/*.tsx"]\nalwaysApply: true\n---\nKeep AI provider code isolated under src/ai and never inline secrets in screens.\n`; }
function copilotInstructions(name: string): string { return `# Copilot instructions\n\nThis is ${name}, a nativepilot Expo app. Suggest code that keeps AI configuration provider-agnostic and mobile secrets development-only.\n`; }
function architectureDoc(name: string): string { return `# Architecture\n\n${name} uses Expo Router for screens, \`src/theme\` for tokens, \`src/i18n\` for copy, and \`src/ai\` for all provider-facing code. Screens call hooks; hooks call the provider-agnostic client; production provider traffic should go through a backend/proxy.\n`; }
function providerBoundaryDoc(): string { return `# Provider boundary\n\nUse direct mobile provider configuration for local prototypes only. For production, point \`EXPO_PUBLIC_AI_PROXY_URL\` at your authenticated API and keep vendor keys server-side. The generated \`src/ai/client.ts\` is intentionally proxy-shaped so provider swaps do not leak into screens.\n`; }
function securityDoc(providerList: string): string { return `# Security model\n\nSupported provider adapters:\n\n${providerList}\n\nMobile bundles are public. Direct API keys in \`EXPO_PUBLIC_*\` are development-only. Production deployments should use auth, rate limiting, logging, and key storage on a server/proxy boundary.\n`; }
function agentBrief(name: string): string { return `# Agent brief\n\nGoal: extend ${name} without guessing the architecture.\n\n1. Read AGENTS.md.\n2. Keep AI code under src/ai.\n3. Keep demo deletion safe via \`nativepilot clean-demo\`.\n4. Verify with \`npm test\` and \`nativepilot doctor .\`.\n`; }
function manifestFile(name: string, providers: Provider[]): string { return JSON.stringify({ generator: 'nativepilot', guidanceVersion: '1', preset: 'expo', name, providers, managedPaths: ['app', 'src/ai', 'src/theme', 'src/navigation', 'AGENTS.md', 'docs/SECURITY_MODEL.md'] }, null, 2) + '\n'; }
function smokeScript(): string { return `import { existsSync, readFileSync } from 'node:fs';\nconst required = ['app/_layout.tsx','app/chat.tsx','src/ai/client.ts','AGENTS.md','docs/SECURITY_MODEL.md'];\nconst missing = required.filter((file) => !existsSync(file));\nif (missing.length) { console.error('Missing nativepilot files:', missing.join(', ')); process.exit(1); }\nconst client = readFileSync('src/ai/client.ts','utf8');\nif (!client.includes('AIProviderConfig')) { console.error('AI client contract missing'); process.exit(1); }\nconsole.log('nativepilot generated app smoke passed');\n`; }
function layoutTsx(): string { return `import { Stack } from 'expo-router';\nimport { tokens } from '@/theme/tokens';\n\nexport default function RootLayout() {\n  return <Stack screenOptions={{ headerStyle: { backgroundColor: tokens.colors.surface }, headerTintColor: tokens.colors.text }} />;\n}\n`; }
function homeScreen(name: string): string { return `import { Link } from 'expo-router';\nimport { Text, View } from 'react-native';\nimport { tokens } from '@/theme/tokens';\nimport { copy } from '@/i18n/en';\n\nexport default function Home() {\n  return <View style={{ flex: 1, gap: 16, padding: 24, backgroundColor: tokens.colors.background }}>\n    <Text style={{ color: tokens.colors.text, fontSize: 28, fontWeight: '700' }}>${name}</Text>\n    <Text style={{ color: tokens.colors.muted }}>{copy.homeIntro}</Text>\n    <Link href="/chat" style={{ color: tokens.colors.accent, fontWeight: '700' }}>Open AI chat demo</Link>\n  </View>;\n}\n`; }
function chatScreen(): string { return `import { useState } from 'react';\nimport { Button, ScrollView, Text, TextInput, View } from 'react-native';\nimport { useAIChat } from '@/ai/useAIChat';\nimport { defaultProviderConfig } from '@/ai/providers';\nimport { tokens } from '@/theme/tokens';\n\nexport default function ChatScreen() {\n  const [input, setInput] = useState('Draft a safe mobile AI launch checklist.');\n  const chat = useAIChat({ config: defaultProviderConfig });\n  return <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: tokens.colors.background }}>\n    <ScrollView style={{ flex: 1 }}>{chat.messages.map((message) => <Text key={message.id} style={{ marginBottom: 12, color: tokens.colors.text }}>{message.role}: {message.content}</Text>)}</ScrollView>\n    <TextInput value={input} onChangeText={setInput} multiline style={{ borderWidth: 1, borderColor: tokens.colors.border, color: tokens.colors.text, padding: 12 }} />\n    <Button title={chat.isStreaming ? 'Streaming…' : 'Send'} onPress={() => chat.streamMessage(input)} disabled={chat.isStreaming} />\n    {chat.error ? <Text style={{ color: tokens.colors.danger }}>{chat.error.message}</Text> : null}\n  </View>;\n}\n`; }
function aiTypes(): string { return `export type AIProvider = 'openai-compatible' | 'anthropic' | 'gemini' | 'local';\nexport type AIProviderConfig = { provider: AIProvider; baseURL?: string; model: string; developmentApiKey?: string };\nexport type AIMessage = { id: string; role: 'system' | 'user' | 'assistant'; content: string };\nexport type StreamChunk = { content: string; done?: boolean };\nexport type CompletionRequest = { prompt: string; config: AIProviderConfig };\n`; }
function aiProviders(providers: Provider[]): string { return `import type { AIProviderConfig } from './types';\n\nexport const enabledProviders = ${JSON.stringify(providers)} as const;\n\nexport const defaultProviderConfig: AIProviderConfig = {\n  provider: (process.env.EXPO_PUBLIC_AI_PROVIDER as AIProviderConfig['provider']) || 'local',\n  baseURL: process.env.EXPO_PUBLIC_AI_PROXY_URL,\n  model: process.env.EXPO_PUBLIC_AI_MODEL || 'local-demo',\n  developmentApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY\n};\n`; }
function aiClient(): string { return `import type { AIMessage, AIProviderConfig, CompletionRequest, StreamChunk } from './types';\n\nexport async function* streamCompletion(request: CompletionRequest): AsyncGenerator<StreamChunk> {\n  assertSafeConfig(request.config);\n  if (request.config.provider === 'local' || !request.config.baseURL) {\n    yield* localDemoStream(request.prompt);\n    return;\n  }\n  const response = await fetch(request.config.baseURL, {\n    method: 'POST',\n    headers: { 'content-type': 'application/json' },\n    body: JSON.stringify({ model: request.config.model, prompt: request.prompt })\n  });\n  if (!response.ok) throw new Error(\`AI proxy failed: \${response.status}\`);\n  const text = await response.text();\n  yield { content: text, done: true };\n}\n\nexport function message(id: string, role: AIMessage['role'], content: string): AIMessage { return { id, role, content }; }\n\nexport function assertSafeConfig(config: AIProviderConfig): void {\n  if (config.developmentApiKey && process.env.NODE_ENV === 'production') {\n    throw new Error('Direct mobile API keys are development-only. Use a server/proxy boundary in production.');\n  }\n}\n\nasync function* localDemoStream(prompt: string): AsyncGenerator<StreamChunk> {\n  const parts = ['NativePilot demo response: ', prompt.slice(0, 80), '. Replace this with your proxy-backed provider.'];\n  for (const content of parts) yield { content };\n  yield { content: '', done: true };\n}\n`; }
function useAIChat(): string { return `import { useCallback, useState } from 'react';\nimport { message, streamCompletion } from './client';\nimport type { AIMessage, AIProviderConfig } from './types';\n\nexport function useAIChat({ config }: { config: AIProviderConfig }) {\n  const [messages, setMessages] = useState<AIMessage[]>([]);\n  const [isStreaming, setStreaming] = useState(false);\n  const [error, setError] = useState<Error | undefined>();\n  const streamMessage = useCallback(async (content: string) => {\n    setError(undefined); setStreaming(true);\n    const user = message(String(Date.now()), 'user', content);\n    const assistantId = \`\${Date.now()}-assistant\`;\n    setMessages((current) => [...current, user, message(assistantId, 'assistant', '')]);\n    try {\n      for await (const chunk of streamCompletion({ prompt: content, config })) {\n        if (chunk.content) setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, content: item.content + chunk.content } : item));\n      }\n    } catch (cause) { setError(cause instanceof Error ? cause : new Error(String(cause))); }\n    finally { setStreaming(false); }\n  }, [config]);\n  return { messages, streamMessage, isStreaming, error };\n}\n`; }
function useAICompletion(): string { return `import { useState } from 'react';\nimport { streamCompletion } from './client';\nimport type { AIProviderConfig } from './types';\n\nexport function useAICompletion(config: AIProviderConfig) {\n  const [completion, setCompletion] = useState('');\n  const [isStreaming, setStreaming] = useState(false);\n  async function complete(prompt: string) {\n    setCompletion(''); setStreaming(true);\n    try { for await (const chunk of streamCompletion({ prompt, config })) setCompletion((current) => current + chunk.content); }\n    finally { setStreaming(false); }\n  }\n  return { completion, complete, isStreaming };\n}\n`; }
function safetyConfig(): string { return `export const unsafeKeyPatterns = [/sk-[A-Za-z0-9_-]{20,}/, /AIza[A-Za-z0-9_-]{20,}/, /anthropic_[A-Za-z0-9_-]{20,}/];\nexport const productionBoundary = 'Use a server or trusted proxy for production LLM calls.';\n`; }
function i18n(): string { return `export const copy = { homeIntro: 'An AI-ready Expo shell with explicit provider, safety, and agent handoff boundaries.' };\n`; }
function themeTokens(): string { return `export const tokens = { colors: { background: '#07111f', surface: '#0f1d33', text: '#f8fbff', muted: '#b8c7dd', accent: '#75e0c1', border: '#28405f', danger: '#ff8a8a' } } as const;\n`; }
function routes(): string { return `export const routes = { home: '/', chat: '/chat' } as const;\n`; }
function demoContent(): string { return `export const demoPrompts = ['Draft a safe mobile AI launch checklist.', 'Explain the app architecture to a new teammate.'];\n`; }

export function projectDirFrom(root: string, appName: string): string { return path.resolve(root, normalizeAppName(appName)); }
