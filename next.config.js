const createNextIntlPlugin = require('next-intl/plugin');
const { withSentryConfig } = require('@sentry/nextjs');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '55331',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

// Sentry configuration with org/project settings
const sentryWebpackPluginOptions = {
  org: "lavart-studio",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests through Next.js to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  webpack: {
    // Automatic instrumentation for Vercel Cron Monitors
    automaticVercelMonitors: true,
    // Tree-shaking for reduced bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

module.exports = withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions);
