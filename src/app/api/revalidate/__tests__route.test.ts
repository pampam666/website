import { describe, it, expect, beforeEach } from '@jest/globals'
import { revalidateTag } from 'next/cache'
import { POST, GET } from '../api/revalidate/route'

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}))

jest.mock('@/lib/api/sanity/client', () => ({
  CACHE_TAGS: {
    product: (id?: string) => (id ? `sanity:product:${id}` : 'sanity:product'),
    certification: (id?: string) =>
      id ? `sanity:certification:${id}` : 'sanity:certification',
    portfolio: (id?: string) => (id ? `sanity:portfolio:${id}` : 'sanity:portfolio'),
    spokeConfig: (id?: string) =>
      id ? `sanityspokeConfig:${id}` : 'sanity:spokeConfig',
    page: (id?: string) => (id ? `sanity:page:${id}` : 'sanity:page'),
    spoke: (subdomain: string) => `sanityspoke:${subdomain}`,
    all: 'sanity:all',
  },
}))

import { NextRequest, NextResponse } from 'next/server'
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn(),
  },
}))

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when signature is missing and secret is configured', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'

    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'product-1',
        _type: 'product',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing signature' },
      { status: 401 },
    )
  })

  it('should return 401 for invalid signature', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'

    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('invalid-signature'),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'product-1',
        _type: 'product',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid signature' },
      { status: 401 },
    )
  })

  it('should revalidate product tags', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'product-1',
        _type: 'product',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(revalidateTag).toHaveBeenCalledWith('sanity:all')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:product:product-1')
  })

  it('should revalidate certification tags', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'cert-1',
        _type: 'certification',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(revalidateTag).toHaveBeenCalledWith('sanity:all')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:certification:cert-1')
  })

  it('should revalidate portfolio tags', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'portfolio-1',
        _type: 'portfolioEntry',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(revalidateTag).toHaveBeenCalledWith('sanity:all')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:portfolio:portfolio-1')
  })

  it('should revalidate spoke config tags', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'spoke-1',
        _type: 'spokeConfig',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(revalidateTag).toHaveBeenCalledWith('sanity:all')
    expect(revalidateTag).toHaveBeenCalledWith('sanityspokeConfig:spoke-1')
    expect(revalidateTag).toHaveBeenCalledWith('sanityspokeConfig')
  })

  it('should return 400 for unknown document type', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockResolvedValue({
        _id: 'unknown-1',
        _type: 'unknownType',
        operation: 'update',
      }),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Unknown document type' },
      { status: 400 },
    )
  })

  it('should return 500 on error', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
      json: jest.fn().mockRejectedValue(new Error('Network error')),
    } as unknown as NextRequest

    await POST(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Revalidation failed',
        message: 'Network error',
      }),
      { status: 500 },
    )
  })
})

describe('GET /api/revalidate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.SANITY_WEBHOOK_SECRET
  })

  it('should return webhook not configured status', async () => {
    await GET()

    expect(NextResponse.json).toHaveBeenCalledWith({
      status: 'ok',
      webhookConfigured: false,
    })
  })

  it('should return webhook configured status', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'

    await GET()

    expect(NextResponse.json).toHaveBeenCalledWith({
      status: 'ok',
      webhookConfigured: true,
    })
  })
})