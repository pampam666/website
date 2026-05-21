'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rfqB2BSchema, RfqB2BInput } from '@/lib/schema/rfq-schemas'
import { extractTrackingMetadata } from '@/lib/utils/tracking'
import { TextField } from './TextField'
import { TextareaField } from './TextareaField'

interface RfqB2BFormProps {
  onSubmit: (data: RfqB2BInput) => void | Promise<void>
}

export function RfqB2BForm({ onSubmit }: RfqB2BFormProps) {
  const trackingMetadata = extractTrackingMetadata()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RfqB2BInput>({
    resolver: zodResolver(rfqB2BSchema),
    defaultValues: {
      segment: 'B2B',
      source_domain: trackingMetadata.source_domain,
      source_page_path: trackingMetadata.source_page_path,
      source_campaign_tag: trackingMetadata.source_campaign_tag,
      utm_source: trackingMetadata.utm_source,
      utm_medium: trackingMetadata.utm_medium,
      utm_campaign: trackingMetadata.utm_campaign,
      contact_name: '',
      contact_email: '',
      contact_phone: undefined,
      company_name: undefined,
      product_category: '',
      quantity: 1,
      project_scope: undefined,
      timeline: undefined,
      notes: undefined,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pb-20"
      aria-label="B2B RFQ Form"
      noValidate
    >
      {/* Hidden tracking fields */}
      <input type="hidden" value="B2B" {...register('segment')} />
      <input type="hidden" value={trackingMetadata.source_domain} {...register('source_domain')} />
      <input type="hidden" value={trackingMetadata.source_page_path} {...register('source_page_path')} />
      <input type="hidden" value={trackingMetadata.source_campaign_tag || ''} {...register('source_campaign_tag')} />
      <input type="hidden" value={trackingMetadata.utm_source || ''} {...register('utm_source')} />
      <input type="hidden" value={trackingMetadata.utm_medium || ''} {...register('utm_medium')} />
      <input type="hidden" value={trackingMetadata.utm_campaign || ''} {...register('utm_campaign')} />

      {/* Contact Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
        
        <TextField
          name="contact_name"
          control={control}
          label="Contact Name"
          placeholder="Your full name"
          error={errors.contact_name?.message}
          rules={{ required: true }}
        />

        <TextField
          name="contact_email"
          control={control}
          label="Contact Email"
          placeholder="email@example.com"
          type="email"
          error={errors.contact_email?.message}
          rules={{ required: true }}
        />

        <TextField
          name="contact_phone"
          control={control}
          label="Contact Phone"
          placeholder="+6281234567890"
          type="tel"
          error={errors.contact_phone?.message}
        />

        <TextField
          name="company_name"
          control={control}
          label="Company Name"
          placeholder="PT Example Company"
          error={errors.company_name?.message}
        />
      </div>

      {/* RFQ Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">RFQ Details</h2>

        <TextField
          name="product_category"
          control={control}
          label="Product Category"
          placeholder="e.g., Solar Cell Module"
          error={errors.product_category?.message}
          rules={{ required: true }}
        />

        <TextField
          name="quantity"
          control={control}
          label="Quantity"
          placeholder="100"
          type="number"
          error={errors.quantity?.message}
          rules={{ required: true }}
        />

        <TextareaField
          name="project_scope"
          control={control}
          label="Project Scope"
          placeholder="Describe the project requirements"
          rows={4}
          error={errors.project_scope?.message}
        />

        <TextField
          name="timeline"
          control={control}
          label="Timeline"
          type="date"
          error={errors.timeline?.message}
        />

        <TextareaField
          name="notes"
          control={control}
          label="Additional Notes"
          placeholder="Any additional information"
          rows={3}
          error={errors.notes?.message}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="h-12 min-w-[168px] rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Submit RFQ
      </button>
    </form>
  )
}
