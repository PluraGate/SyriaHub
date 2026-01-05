import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import boundariesPlugin from 'eslint-plugin-boundaries'

const eslintConfig = [
    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript ESLint recommended rules
    ...tseslint.configs.recommended,

    // Main config for JS/TS/React/Next files
    {
        files: ['**/*.{js,mjs,jsx,ts,tsx}'],
        plugins: {
            '@next/next': nextPlugin,
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
            'boundaries': boundariesPlugin,
        },
        languageOptions: {
            globals: {
                // Node.js globals
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                console: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                exports: 'readonly',
                Buffer: 'readonly',
                global: 'readonly',
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                Response: 'readonly',
                Request: 'readonly',
                Headers: 'readonly',
                AbortController: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                EventTarget: 'readonly',
                HTMLElement: 'readonly',
                HTMLInputElement: 'readonly',
                HTMLFormElement: 'readonly',
                HTMLDivElement: 'readonly',
                HTMLButtonElement: 'readonly',
                MutationObserver: 'readonly',
                ResizeObserver: 'readonly',
                IntersectionObserver: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                // Jest/Vitest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                vi: 'readonly',
                jest: 'readonly',
            },
        },
        settings: {
            // Resolver for import plugin and boundaries
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
            react: {
                version: 'detect',
            },
            // Boundaries plugin settings - define architectural layers
            'boundaries/elements': [
                // Specific Lib layers (must come before generic lib)
                {
                    type: 'supabase',
                    pattern: 'lib/supabase/**/*',
                },
                {
                    type: 'lib-hooks',
                    pattern: 'lib/hooks/**/*',
                },
                {
                    type: 'i18n',
                    pattern: ['i18n/**/*', 'lib/i18n/**/*'],
                },
                // Generic Lib layer
                {
                    type: 'lib',
                    pattern: 'lib/**/*',
                    capture: ['category'],
                },

                // Specific App layers
                {
                    type: 'api',
                    pattern: 'app/api/**/*',
                    capture: ['domain'],
                },

                // Component layers
                {
                    type: 'components',
                    pattern: 'components/**/*',
                    capture: ['category'],
                },
                {
                    type: 'hooks',
                    pattern: 'hooks/**/*',
                },

                // Generic App layers
                {
                    type: 'app',
                    pattern: 'app/[locale]/**/*',
                    capture: ['domain'],
                },
                {
                    type: 'app-root',
                    pattern: 'app/*',
                },

                // Other layers
                {
                    type: 'tests',
                    pattern: 'tests/**/*',
                },
                {
                    type: 'e2e',
                    pattern: 'tests/e2e/**/*',
                },
                {
                    type: 'types',
                    pattern: 'types/**/*',
                },
                {
                    type: 'contexts',
                    pattern: 'contexts/**/*',
                },
                {
                    type: 'navigation',
                    pattern: 'navigation.ts',
                },
            ],
            'boundaries/ignore': [
                // Ignore test files for boundary checks (tests can import anything)
                'tests/**/*',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.spec.ts',
                '**/*.spec.tsx',
                // Ignore specific root config files
                'next.config.js',
                'postcss.config.js',
                'tailwind.config.ts',
                'vitest.config.ts',
                'playwright.config.ts',
                'eslint.config.mjs',
            ],
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            ...reactPlugin.configs.flat.recommended.rules,
            ...reactPlugin.configs.flat['jsx-runtime'].rules,
            ...reactHooksPlugin.configs['recommended-latest'].rules,
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-unused-vars': 'off',
            'no-undef': 'off', // TypeScript handles this
            'no-case-declarations': 'off', // Allow lexical declarations in case blocks
            'react/no-unknown-property': 'off', // Next.js uses custom props like 'global' for styled-jsx
            'no-useless-escape': 'off', // Allow useless escapes in regex/strings
            'react/prop-types': 'off', // TypeScript handles prop validation

            // Boundaries rules - enforce architectural layers
            'boundaries/element-types': [
                'warn', // Start with warn to identify violations without breaking build
                {
                    default: 'allow',
                    rules: [
                        // lib layer should NOT import from components, API, or app
                        {
                            from: 'lib',
                            disallow: ['components', 'api', 'app', 'app-root'],
                            message: 'Library code should not depend on UI components or API routes. Move shared logic to lib/ instead.',
                        },
                        // API routes should NOT import from components or app pages
                        {
                            from: 'api',
                            disallow: ['components', 'app'],
                            message: 'API routes should not import UI components. Extract shared logic to lib/ if needed.',
                        },
                        // Components should NOT import from API routes
                        {
                            from: 'components',
                            disallow: ['api'],
                            message: 'Components should not directly import API route handlers. Use fetch() or a service layer instead.',
                        },
                        // Hooks should NOT import from components or API
                        {
                            from: 'hooks',
                            disallow: ['components', 'api', 'app'],
                            message: 'Hooks should be reusable and not depend on specific components or API routes.',
                        },
                        // Lib hooks same rules as hooks
                        {
                            from: 'lib-hooks',
                            disallow: ['components', 'api', 'app'],
                            message: 'Library hooks should not depend on UI components or API routes.',
                        },
                    ],
                },
            ],
            // Prevent external module imports that bypass layers
            'boundaries/no-unknown': ['off'],
            'boundaries/no-unknown-files': ['off'], // Too noisy for now
        },
    },

    // Ignore patterns
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'out/**',
            'public/**',
            'playwright-report/**',
            'test-results/**',
            '*.config.js',
            '*.config.mjs',
            'sentry.*.config.ts',
            '**/*.txt',
            '**/*.md',
            '**/*.sql',
            '**/*.json',
        ],
    },
]

export default eslintConfig

