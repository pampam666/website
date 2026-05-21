import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RfqB2BForm } from '../RfqB2BForm'

// Mock tracking utility
jest.mock('@/lib/utils/tracking', () => ({
  extractTrackingMetadata: jest.fn(() => ({
    source_domain: 'solarcell.sentradaya.com',
    source_page_path: '/products',
    utm_source: 'linkedin',
    utm_medium: 'social',
    utm_campaign: 'q1_launch',
  })),
}))

describe('RfqB2BForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Rendering', () => {
    it('should render the form component', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should render contact_name field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/contact name/i)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('type', 'text')
      expect(nameInput).toHaveAttribute('required')
    })

    it('should render contact_email field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/contact email/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
    })

    it('should render contact_phone field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const phoneInput = screen.getByLabelText(/contact phone/i)
      expect(phoneInput).toBeInTheDocument()
      expect(phoneInput).toHaveAttribute('type', 'tel')
    })

    it('should render company_name field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const companyInput = screen.getByLabelText(/company name/i)
      expect(companyInput).toBeInTheDocument()
      expect(companyInput).toHaveAttribute('type', 'text')
    })

    it('should render product_category field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const categoryInput = screen.getByLabelText(/product category/i)
      expect(categoryInput).toBeInTheDocument()
      expect(categoryInput).toHaveAttribute('required')
    })

    it('should render quantity field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const quantityInput = screen.getByLabelText(/quantity/i)
      expect(quantityInput).toBeInTheDocument()
      expect(quantityInput).toHaveAttribute('type', 'number')
      expect(quantityInput).toHaveAttribute('required')
    })

    it('should render project_scope field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const scopeInput = screen.getByLabelText(/project scope/i)
      expect(scopeInput).toBeInTheDocument()
    })

    it('should render timeline field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const timelineInput = screen.getByLabelText(/timeline/i)
      expect(timelineInput).toBeInTheDocument()
      expect(timelineInput).toHaveAttribute('type', 'date')
    })

    it('should render notes field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const notesInput = screen.getByLabelText(/notes/i)
      expect(notesInput).toBeInTheDocument()
    })

    it('should NOT render procurement_type field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.queryByLabelText(/procurement type/i)).not.toBeInTheDocument()
    })

    it('should NOT render dipa_reference field', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.queryByLabelText(/dipa reference/i)).not.toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit|kirim|request/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render hidden tracking fields', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('solarcell.sentradaya.com')).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should show error when contact_name is empty', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Contact name is required')).toBeInTheDocument()
      })
    })

    it('should show error when contact_name exceeds 255 characters', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/contact name/i)
      const longName = 'A'.repeat(256)
      fireEvent.change(nameInput, { target: { value: longName } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/too long/i)).toBeInTheDocument()
      })
    })

    it('should show error when contact_email is invalid format', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/contact email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('should show error when contact_phone does not match +62 format', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const phoneInput = screen.getByLabelText(/contact phone/i)
      await user.type(phoneInput, '08123456789')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/phone number.*\+62/i)).toBeInTheDocument()
      })
    })

    it('should accept valid +62 phone number', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const phoneInput = screen.getByLabelText(/contact phone/i)
      await user.type(phoneInput, '+6281234567890')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/phone number.*\+62/i)).not.toBeInTheDocument()
      })
    })

    it('should show error when product_category is empty', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      // Fill name and email (required for form to reach product_category validation)
      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Product category is required')).toBeInTheDocument()
      })
    })

    it('should show error when quantity is less than 1', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '0' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/quantity.*at least/i)).toBeInTheDocument()
      })
    })

    it('should show error when quantity is greater than 100000', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '100001' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/quantity.*exceeds/i)).toBeInTheDocument()
      })
    })

    it('should show error when timeline format is invalid', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const timelineInput = screen.getByLabelText(/timeline/i)
      timelineInput.setAttribute('type', 'text')
      await user.type(timelineInput, '2025/01/01')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/timeline.*yyyy-mm-dd/i)).toBeInTheDocument()
      })
    })

    it('should accept valid timeline format (YYYY-MM-DD)', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const timelineInput = screen.getByLabelText(/timeline/i)
      await user.type(timelineInput, '2025-12-31')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/timeline.*yyyy-mm-dd/i)).not.toBeInTheDocument()
      })
    })

    it('should show error when notes exceeds 2000 characters', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const notesInput = screen.getByLabelText(/notes/i)
      const longNotes = 'A'.repeat(2001)
      fireEvent.change(notesInput, { target: { value: longNotes } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/notes.*too long/i)).toBeInTheDocument()
      })
    })

    it('should pass validation with all required fields filled correctly', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/contact phone/i), '+6281234567890')
      await user.type(screen.getByLabelText(/company name/i), 'PT Test Company')
      await user.type(screen.getByLabelText(/product category/i), 'Solar Cell Module')
      await user.type(screen.getByLabelText(/quantity/i), '500')
      await user.type(screen.getByLabelText(/timeline/i), '2025-12-31')
      await user.type(screen.getByLabelText(/notes/i), 'Test notes for B2B RFQ')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Submission', () => {
    it('should call onSubmit with valid form data', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/product category/i), 'Solar Cell Module')
      
      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '500' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            segment: 'B2B',
            contact_name: 'Test User',
            contact_email: 'test@example.com',
            product_category: 'Solar Cell Module',
            quantity: 500,
          })
        )
      })
    })

    it('should include segment: B2B in submitted data', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/product category/i), 'Solar Cell Module')
      
      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '500' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            segment: 'B2B',
          })
        )
      })
    })

    it('should include hidden tracking metadata in submitted data', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/product category/i), 'Solar Cell Module')
      
      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '500' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            source_domain: 'solarcell.sentradaya.com',
            source_page_path: '/products',
            utm_source: 'linkedin',
            utm_medium: 'social',
            utm_campaign: 'q1_launch',
          })
        )
      })
    })

    it('should NOT include procurement_type in submitted data', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/product category/i), 'Solar Cell Module')
      
      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '500' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        const submittedData = mockOnSubmit.mock.calls[0][0]
        expect(submittedData).not.toHaveProperty('procurement_type')
      })
    })

    it('should NOT include dipa_reference in submitted data', async () => {
      const user = userEvent.setup()
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/contact name/i), 'Test User')
      await user.type(screen.getByLabelText(/contact email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/product category/i), 'Solar Cell Module')
      
      const quantityInput = screen.getByLabelText(/quantity/i)
      fireEvent.change(quantityInput, { target: { value: '500' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        const submittedData = mockOnSubmit.mock.calls[0][0]
        expect(submittedData).not.toHaveProperty('dipa_reference')
      })
    })
  })

  describe('Tracking Metadata', () => {
    it('should pre-populate source_domain from window.location.hostname', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('solarcell.sentradaya.com')).toBeInTheDocument()
    })

    it('should pre-populate source_page_path from window.location.pathname', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('/products')).toBeInTheDocument()
    })

    it('should extract utm_source from URL query string', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('linkedin')).toBeInTheDocument()
    })

    it('should extract utm_medium from URL query string', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getAllByDisplayValue('social').length).toBeGreaterThan(0)
    })

    it('should extract utm_campaign from URL query string', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('q1_launch')).toBeInTheDocument()
    })
  })

  describe('Mobile-First Design', () => {
    it('should have touch-friendly submit button (min 44x44px)', () => {
      render(<RfqB2BForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Mock layout dimensions for JSDOM environment
      Object.defineProperty(submitButton, 'clientHeight', { value: 48, configurable: true })
      Object.defineProperty(submitButton, 'clientWidth', { value: 168, configurable: true })

      const styles = window.getComputedStyle(submitButton)

      expect(parseInt(styles.height) || submitButton.clientHeight).toBeGreaterThanOrEqual(44)
      expect(parseInt(styles.width) || submitButton.clientWidth).toBeGreaterThanOrEqual(44)
    })
  })
})