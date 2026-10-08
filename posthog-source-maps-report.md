# PostHog source map upload setup

## Status

PostHog source map generation, chunk-ID injection, and upload are configured through the existing `@posthog/nextjs-config` wrapper in `next.config.ts`. Next.js loads the upload credentials from `.env.local` during production builds.

The local personal API key was stored through the secure environment tooling and is not included in this report.

## Files changed

- `.env.local`
- `.claude/skills/error-tracking-upload-source-maps-nextjs/SKILL.md`
- `.claude/skills/error-tracking-upload-source-maps-nextjs/references/COMMANDMENTS.md`
- `.claude/skills/error-tracking-upload-source-maps-nextjs/references/cli.md`
- `.claude/skills/error-tracking-upload-source-maps-nextjs/references/nextjs.md`
- `.claude/skills/error-tracking-upload-source-maps-nextjs/references/upload-source-maps.md`
- `posthog-source-maps-report.md`

The temporary test affordance touched `src/components/public/hero-section.tsx` and was fully reverted after the user completed the production test flow. No test button remains.

## Existing wiring verified

- `next.config.ts` wraps the Next.js config with `withPostHogConfig` and enables source maps with deletion after upload.
- `package.json` already includes `@posthog/nextjs-config`.
- `.github/workflows/ci.yml` already passes the three upload variables to `npm run build`.

## Environment variable names

- `POSTHOG_API_KEY`
- `POSTHOG_PROJECT_ID`
- `POSTHOG_HOST`

## Build, upload, and run commands

Production build and source-map upload:

```bash
npm run build
```

There is no separate upload command. `@posthog/nextjs-config` generates, injects, uploads, and then deletes source maps as part of `next build`.

Run the built application:

```bash
npm run start
```

## CI and deployment follow-up

Before the next GitHub Actions build, create these repository secrets under **Settings → Secrets and variables → Actions** if they do not already exist:

- `POSTHOG_API_KEY`
- `POSTHOG_PROJECT_ID`
- `POSTHOG_HOST`

This repository also contains Vercel configuration and appears intended for Vercel deployment. In the Vercel project settings, add the same three variables to the environments that run production or preview builds. The repository does not contain a traceable Vercel build declaration beyond `vercel.json`, so these values must be configured in the Vercel dashboard.

Use the PostHog API host for the upload host variable: `POSTHOG_HOST` should target the EU PostHog API host, not the ingestion host used by the browser SDK.

## Verification

1. Run `npm run build` with the upload variables available.
2. Confirm the build output reports a successful PostHog source-map upload.
3. Open the project’s Symbol sets page and confirm a new symbol set appears:
   https://eu.posthog.com/project/275580/error_tracking/configuration
4. Trigger a captured production error and confirm its stack trace resolves to real source files rather than minified bundle paths.

The local production test flow was completed, and its temporary button was removed. Confirm the uploaded symbol set remains visible on the Symbol sets page and that the captured test exception resolves to real source files.
