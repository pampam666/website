import { z } from 'zod'

// Indonesian phone number regex: +62 followed by 8-12 digits
const indonesianPhoneRegex = /^\+62[1-9]\d{8,12}$/

// Allowed procurement types for B2G
export const PROCUREMENT_TYPES = [
  'Tender Langsung',
  'Tender Umum',
  'Penunjukan Langsung',
  'E-Purchasing',
] as const

// Segment types
const SEGMENT_TYPES = ['B2G', 'B2B'] as const

// Source tracking schema
const sourceTrackingSchema = z.object({
  source_domain: z.string().min(1).max(255).or(z.literal('')),
  source_page_path: z.string().min(1).max(512).optional().or(z.literal('')),
  source_campaign_tag: z.string().min(1).max(255).optional().or(z.literal('')),
  utm_source: z.string().min(1).max(255).optional().or(z.literal('')),
  utm_medium: z.string().min(1).max(255).optional().or(z.literal('')),
  utm_campaign: z.string().min(1).max(255).optional().or(z.literal('')),
})

// Shared RFQ fields used by both B2G and B2B
export const sharedRfqFieldsSchema = z.object({
  // Contact information
  contact_name: z.string()
    .min(1, 'Contact name is required')
    .max(255, 'Contact name is too long')
    .trim(),
  contact_email: z.string()
    .min(1, 'Contact email is required')
    .email('Invalid email address'),
  contact_phone: z.string()
    .regex(indonesianPhoneRegex, 'Phone number must be in +62 format')
    .optional()
    .or(z.literal('')),
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(255, 'Company name is too long')
    .trim()
    .optional()
    .or(z.literal('')),

  // RFQ details
  product_category: z.string()
    .min(1, 'Product category is required')
    .max(255, 'Product category is too long'),
  quantity: z.number({ error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity exceeds maximum'),
  project_scope: z.string()
    .min(1, 'Project scope is required')
    .max(5000, 'Project scope is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  timeline: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Timeline must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(2000, 'Notes are too long')
    .trim()
    .optional()
    .or(z.literal('')),
})

// B2G-specific fields
const b2GSpecificFieldsSchema = z.object({
  procurement_type: z.enum(PROCUREMENT_TYPES, {
    error: 'Procurement type is required',
  }),
  dipa_reference: z.string()
    .min(1, 'Dipa reference is required')
    .max(255, 'Dipa reference is too long')
    .trim()
    .optional()
    .or(z.literal('')),
})

// B2G RFQ schema
export const rfqB2GSchema = sourceTrackingSchema
  .merge(sharedRfqFieldsSchema)
  .merge(b2GSpecificFieldsSchema)
  .extend({
    segment: z.literal('B2G'),
  })
  .strict()

// B2B RFQ schema
export const rfqB2BSchema = sourceTrackingSchema
  .merge(sharedRfqFieldsSchema)
  .extend({
    segment: z.literal('B2B'),
  })
  .strict()

// Type exports for TypeScript
export type RfqSharedFields = z.infer<typeof sharedRfqFieldsSchema>
export type RfqB2GInput = z.infer<typeof rfqB2GSchema>
export type RfqB2BInput = z.infer<typeof rfqB2BSchema>
export type SourceTracking = z.infer<typeof sourceTrackingSchema>

// Procurement type enum
export type ProcurementType = (typeof PROCUREMENT_TYPES)[number]
export type SegmentType = (typeof SEGMENT_TYPES)[number]