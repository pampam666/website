'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rfqB2GSchema, RfqB2GInput, PROCUREMENT_TYPES } from '@/lib/schema/rfq-schemas'
import { extractTrackingMetadata } from '@/lib/utils/tracking'
import { TextField } from './TextField'
import { SelectField } from './SelectField'
import { TextareaField } from './TextareaField'

interface RfqB2GFormProps {
  onSubmit: (data: RfqB2GInput) => void | Promise<void>
}

export function RfqB2GForm({ onSubmit }: RfqB2GFormProps) {
  const trackingMetadata = extractTrackingMetadata()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RfqB2GInput>({
    resolver: zodResolver(rfqB2GSchema),
    defaultValues: {
      segment: 'B2G',
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
      procurement_type: undefined,
      dipa_reference: undefined,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pb-20"
      aria-label="B2G RFQ Form"
      noValidate
    >
      {/* Hidden tracking fields */}
      <input type="hidden" value="B2G" {...register('segment')} />
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
          placeholder="e.g., PJU Solar Cell"
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

      {/* B2G Specific Fields */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Government Procurement</h2>

        <SelectField
          name="procurement_type"
          control={control}
          label="Procurement Type"
          placeholder="Select procurement type"
          options={PROCUREMENT_TYPES}
          error={errors.procurement_type?.message}
          rules={{ required: true }}
        />

        <TextField
          name="dipa_reference"
          control={control}
          label="DIPA Reference"
          placeholder="DIPA number (if applicable)"
          error={errors.dipa_reference?.message}
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
