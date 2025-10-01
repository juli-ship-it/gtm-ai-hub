import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/page-header'

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
      >
        <button>Test Button</button>
      </PageHeader>
    )

    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <PageHeader
        title="Test Title"
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
