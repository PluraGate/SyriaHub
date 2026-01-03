import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

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
        },
        settings: {
            react: {
                version: 'detect',
            },
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
