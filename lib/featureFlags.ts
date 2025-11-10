const DEFAULT_FLAGS = {
  localization: false,
  forumQa: false,
  aiPlagiarismDetection: false,
  privateGroups: false,
  contentVersioning: false,
} as const

export type FeatureFlagKey = keyof typeof DEFAULT_FLAGS
export type FeatureFlags = Record<FeatureFlagKey, boolean>

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  if (value === '1') return true
  if (value === '0') return false
  return value.toLowerCase() === 'true'
}

export function getFeatureFlags(env: NodeJS.ProcessEnv = process.env): FeatureFlags {
  return {
    localization: parseBoolean(env.NEXT_PUBLIC_FEATURE_LOCALIZATION, DEFAULT_FLAGS.localization),
    forumQa: parseBoolean(env.NEXT_PUBLIC_FEATURE_FORUM_QA, DEFAULT_FLAGS.forumQa),
    aiPlagiarismDetection: parseBoolean(env.NEXT_PUBLIC_FEATURE_AI_PLAGIARISM, DEFAULT_FLAGS.aiPlagiarismDetection),
    privateGroups: parseBoolean(env.NEXT_PUBLIC_FEATURE_PRIVATE_GROUPS, DEFAULT_FLAGS.privateGroups),
    contentVersioning: parseBoolean(env.NEXT_PUBLIC_FEATURE_CONTENT_VERSIONING, DEFAULT_FLAGS.contentVersioning),
  }
}

export function isFeatureEnabled(key: FeatureFlagKey, env: NodeJS.ProcessEnv = process.env): boolean {
  const flags = getFeatureFlags(env)
  return flags[key]
}
