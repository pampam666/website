import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TAGS } from '@/lib/api/sanity/client'

/**
 * Webhook payload from Sanity.
 */
interface SanityWebhookPayload {
  _id: string
  _type: string
  slug?: {
    current: string
  }
  operation: 'create' | 'update' | 'delete'
}

/**
 * POST handler for Sanity webhook revalidation.
 *
 * Validates webhook signature and invalidates cache based on document type.
 *
 * @param request - Next.js request with Sanity webhook payload
 * @returns 200 on success, 401 on invalid signature, 500 on error
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SANITY_WEBHOOK_SECRET

    if (secret) {
      const signature = request.headers.get('sanity-webhook-signature')

      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 },
        )
      }

      const expectedSignature = `sha1=${secret}`

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 },
        )
      }
    }

    const body: SanityWebhookPayload = await request.json()
    const { _id, _type } = body

    const tags = getTagsForDocumentType(_type, body)

    if (tags.length === 0) {
      return NextResponse.json(
        { error: 'Unknown document type' },
        { status: 400 },
      )
    }

    tags.forEach((tag) => {
      revalidateTag(tag)
    })

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      documentId: _id,
      tags,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Revalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Get cache tags for a document type and payload.
 *
 * @param type - Document type from Sanity
 * @param payload - Webhook payload with document details
 * @returns Array of cache tags to revalidate
 */
function getTagsForDocumentType(
  type: string,
  payload: SanityWebhookPayload,
): string[] {
  const tags: string[] = [CACHE_TAGS.all]

  switch (type) {
    case 'product':
      tags.push(CACHE_TAGS.product(payload._id))
      break

    case 'certification':
      tags.push(CACHE_TAGS.certification(payload._id))
      break

    case 'portfolioEntry':
      tags.push(CACHE_TAGS.portfolio(payload._id))
      break

    case 'spokeConfig':
      tags.push(CACHE_TAGS.spokeConfig(payload._id))
      tags.push(CACHE_TAGS.spokeConfig())
      break

    case 'page':
      tags.push(CACHE_TAGS.page(payload._id))
      break

    default:
      return []
  }

  return tags
}

/**
 * GET handler for health check.
 *
 * @returns 200 OK with webhook status
 */
export async function GET() {
  const isConfigured = !!process.env.SANITY_WEBHOOK_SECRET

  return NextResponse.json({
    status: 'ok',
    webhookConfigured: isConfigured,
  })
}