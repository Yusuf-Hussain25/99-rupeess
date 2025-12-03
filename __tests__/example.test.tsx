import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Example Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>
    render(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })
})

