import posthog from "posthog-js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
    );
  }
} else if (!host) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured"
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: true,
    tracing_headers: [window.location.hostname],
    debug: process.env.NODE_ENV === "development",
  });

  let identifiedUserId: string | null = null;

  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (identifiedUserId) {
          posthog.reset();
          identifiedUserId = null;
        }
        return;
      }

      if (identifiedUserId && identifiedUserId !== user.uid) {
        posthog.reset();
      }

      posthog.identify(user.uid, {
        ...(user.email ? { email: user.email } : {}),
        ...(user.displayName ? { name: user.displayName } : {}),
      });
      identifiedUserId = user.uid;
    });
  }
}
