import { z } from 'zod'

/**
 * Environment variable validation schema.
 * Ensures all required Sanity CMS configuration is present and valid.
 *
 * @throws {Error} If any required environment variable is missing or invalid
 */
export const sanityEnvSchema = z.object({
  SANITY_PROJECT_ID: z
    .string()
    .min(1, 'Sanity project ID is required')
    .regex(/^[a-z0-9]+$/, 'Project ID must be lowercase alphanumeric'),
  SANITY_DATASET: z
    .string()
    .min(1, 'Sanity dataset is required')
    .regex(
      /^[a-z0-9_-]+$/,
      'Dataset name must be lowercase alphanumeric, hyphens, or underscores',
    ),
  SANITY_API_VERSION: z
    .string()
    .min(1, 'Sanity API version is required')
    .regex(
      /^v\d{4}-\d{2}-\d{2}$/,
      'API version must be in format vYYYY-MM-DD',
    ),
  SANITY_API_READ_TOKEN: z
    .string()
    .min(1, 'Sanity API read token is required')
    .startsWith('sk', 'Read token must start with "sk"'),
  SANITY_API_WRITE_TOKEN: z
    .string()
    .startsWith('sk', 'Write token must start with "sk"')
    .optional(),
})

export type SanityEnv = z.infer<typeof sanityEnvSchema>

/**
 * Validate all Sanity environment variables.
 *
 * @returns Validated environment configuration
 * @throws {Error} If validation fails
 */
export function validateSanityEnv(): SanityEnv {
  const raw = {
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION || 'v2025-05-21',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  }

  const result = sanityEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Sanity environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated Sanity environment configuration.
 * Caches the result after first call.
 */
let cachedEnv: SanityEnv | null = null

export function getSanityEnv(): SanityEnv {
  if (cachedEnv) {
    return cachedEnv
  }

  cachedEnv = validateSanityEnv()
  return cachedEnv
}