import { defineConfig } from "@trigger.dev/sdk";
import { additionalPackages } from "@trigger.dev/build/extensions/core";
import { esbuildPlugin } from "@trigger.dev/build/extensions";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";

export default defineConfig({
  // Your own Trigger.dev project ref (proj_...), from the project settings in the dashboard
  project: process.env.TRIGGER_PROJECT_REF!,
  dirs: ["./src/trigger"],
  maxDuration: 300,
  build: {
    // firecrawl-aisdk's WASM bash sandbox: optional native deps break bundling
    external: ["just-bash"],
    extensions: [
      // @daytona/sdk loads these at runtime for file upload/download, out of the bundler's sight.
      // Marking the SDK external doesn't work: its nameless esm/package.json fails the CLI's check
      additionalPackages({ packages: ["form-data@4.0.6", "busboy@1.6.0"] }),
      // Uploads source maps to your Sentry project on deploy so production stack traces point at
      // the original TypeScript. Skipped unless SENTRY_ORG, SENTRY_PROJECT and SENTRY_AUTH_TOKEN
      // are all set in the deploying environment
      ...(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN
        ? [
            esbuildPlugin(
              sentryEsbuildPlugin({
                org: process.env.SENTRY_ORG,
                project: process.env.SENTRY_PROJECT,
                authToken: process.env.SENTRY_AUTH_TOKEN,
                telemetry: false,
              }),
              { placement: "last", target: "deploy" },
            ),
          ]
        : []),
    ],
  },
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
