# Safety Notes

NativePilot's safety posture is intentionally modest:

- The CLI writes files locally and performs no hidden network calls.
- Generated examples may read `EXPO_PUBLIC_*` development values, but those values are public in a shipped mobile bundle.
- Production provider traffic should cross a server/proxy boundary with auth, rate limiting, and provider-key storage outside the app.
- `doctor` is a guardrail, not a secret scanner replacement.
