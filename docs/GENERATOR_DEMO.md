# Generator demo

This walkthrough proves NativePilot's local generator, safety check, and agent
handoff without installing dependencies inside the generated app.

## Run it

From a NativePilot checkout with Node.js 20 or newer:

```sh
npm install
bash demo/run-generator-tour.sh
```

The script builds the checked-out CLI, creates a temporary `SupportCopilot`
Expo project, runs `doctor` with unsafe-key and stale-guidance findings promoted
to errors, prints the Codex handoff brief, and lists the generated files. The
temporary project is deleted when the script exits.

## What the output demonstrates

- `create` accepts an app name, output directory, and explicit provider list.
- `doctor` checks the generated structure and returns a non-zero exit when a
  promoted finding is present.
- `print-agent-brief` reads the generated project and emits a concrete starting
  brief for the selected assistant.
- Generation itself does not install packages or contact provider APIs.

The demo does not prove that Expo or a model provider is available. To run the
generated mobile app, create a project outside the temporary demo, install its
dependencies, and follow its generated README and security guidance.
