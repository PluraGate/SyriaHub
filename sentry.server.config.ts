// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://2a355fdc50a885253aa1409f16f024d5@o4510574500839424.ingest.de.sentry.io/4510574502608976",

  // Conservative sampling to avoid noise and cost (10% of transactions)
  tracesSampleRate: 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // PII discipline: Don't send personally identifiable information
  sendDefaultPii: false,
});

