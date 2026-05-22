import { describe, it, expect, beforeEach } from '@jest/globals'
import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }))

const mockNextRequest = jest.fn()
const mockNextResponse = { json: jest.fn() }
jest.mock('next/server', () => ({ NextRequest: mockNextRequest, NextResponse: mockNextResponse }))

jest.mock('@/lib/api/sanity/client', () => ({ CACHE_TAGS: { product: jest.fn(), certification: jest.fn(), portfolio: jest.fn(), spokeConfig: jest.fn(), page: jest.fn(), spoke: jest.fn(), all: 'sanity:all' } }))

describe('POST /api/revalidate', () => {
  let POST: (request: NextRequest) => Promise<unknown>

  beforeEach(async () => {
    jest.clearAllMocks()
    delete process.env.SANITY_WEBHOOK_SECRET
    const route = await import('./route')
    POST = route.POST as (request: NextRequest) => Promise<unknown>
  })

  it('should return 401 when signature is missing and secret is configured', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'product-1', _type: 'product', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith({ error: 'Missing signature' }, { status: 401 })
  })

  it('should return 401 for invalid signature', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'
    const mockRequest = { headers: { get: jest.fn().mockReturnValue('invalid-signature') }, json: jest.fn().mockResolvedValue({ _id: 'product-1', _type: 'product', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith({ error: 'Invalid signature' }, { status: 401 })
  })

  it('should revalidate product tags', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'product-1', _type: 'product', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
  })

  it('should revalidate certification tags', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'cert-1', _type: 'certification', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
  })

  it('should revalidate portfolio tags', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'port-1', _type: 'portfolioEntry', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
  })

  it('should revalidate spoke config tags', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'spoke-1', _type: 'spokeConfig', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
  })

  it('should revalidate page tags', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'page-1', _type: 'page', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
  })

  it('should handle request parsing errors', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockRejectedValue(new Error('JSON parse error')) } as unknown as NextRequest
    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Revalidation failed', message: 'JSON parse error' }),
      { status: 500 }
    )
  })

  it('should return 400 for unknown document type', async () => {
    const mockRequest = { headers: { get: jest.fn().mockReturnValue(null) }, json: jest.fn().mockResolvedValue({ _id: 'unknown-1', _type: 'unknownType', operation: 'update' }) } as unknown as NextRequest
    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith({ error: 'Unknown document type' }, { status: 400 })
  })
})

describe('GET /api/revalidate', () => {
  let GET: () => Promise<unknown>

  beforeEach(async () => {
    jest.clearAllMocks()
    delete process.env.SANITY_WEBHOOK_SECRET
    const route = await import('./route')
    GET = route.GET as () => Promise<unknown>
  })

  it('should return webhook not configured status', async () => {
    await GET()
    expect(mockNextResponse.json).toHaveBeenCalledWith({ status: 'ok', webhookConfigured: false })
  })
})
