const createNextIntlPlugin = require('next-intl/plugin');
const { withSentryConfig } = require('@sentry/nextjs');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development warnings
  reactStrictMode: true,
  // Redirect legacy /login and /signup paths to /auth/*
  async redirects() {
    return [
      {
        source: '/:locale(en|ar)/login',
        destination: '/:locale/auth/login',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/signup',
        destination: '/:locale/auth/signup',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/data/syria-governorates-polygons.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  // Explicitly set turbopack root to prevent lockfile detection issues
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      // Local Supabase (dev only — harmless no-ops in production)
      ...(process.env.NODE_ENV === 'development'
        ? [
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
          ]
        : []),
      // Production Supabase storage
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
  project: "pluragate-syriahub",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Ignore internal Next.js manifest files that don't have sourcemaps
  sourcemaps: {
    ignore: [
      'node_modules/**',
      '**/*-manifest.js',
      '**/*_client-reference-manifest.js',
    ],
  },

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
