/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from '@/components/AuthForm'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      Auth: {
        welcomeBack: 'Welcome Back',
        getStarted: 'Get Started',
        signInSubtitle: 'Sign in to your account',
        signUpSubtitle: 'Create a new account',
        emailAddress: 'Email Address',
        password: 'Password',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        createAccount: 'Create Account',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        signingIn: 'Signing in...',
        creatingAccount: 'Creating account...',
      },
      Forms: {
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter your password',
        passwordCreate: 'Create a password',
      },
    }
    return translations[namespace]?.[key] || key
  },
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('AuthForm Component', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login mode', () => {
    it('should render login form with correct heading', () => {
      render(<AuthForm mode="login" />)

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })

    it('should render email and password fields', () => {
      render(<AuthForm mode="login" />)

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(document.getElementById('password')).toBeInTheDocument()
    })

    it('should render sign in button', () => {
      render(<AuthForm mode="login" />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should toggle password visibility', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="login" />)

      const passwordInput = document.getElementById('password') as HTMLInputElement
      expect(passwordInput).toHaveAttribute('type', 'password')

      // The button has aria-label "Show password" or "Hide password"
      const toggleButton = screen.getByRole('button', { name: /show password/i })
      await user.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      // Now it should say "Hide password"
      const hideButton = screen.getByRole('button', { name: /hide password/i })
      await user.click(hideButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Signup mode', () => {
    it('should render signup form with correct heading', () => {
      render(<AuthForm mode="signup" />)

      expect(screen.getByText('Get Started')).toBeInTheDocument()
      expect(screen.getByText('Create a new account')).toBeInTheDocument()
    })

    it('should render sign up button', () => {
      render(<AuthForm mode="signup" />)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should require email field with HTML5 validation', () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('required')
    })

    it('should require password field with HTML5 validation', () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      // Find password input by id
      const passwordField = document.getElementById('password')
      expect(passwordField).toHaveAttribute('required')
    })

    it('should show error for invalid email format', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      // Use fireEvent to set values directly to bypass HTML5 validation
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      // Use fireEvent.submit to bypass HTML5 validation
      const form = emailInput.closest('form') as HTMLFormElement
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error for short password', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '12345' } })

      const form = emailInput.closest('form') as HTMLFormElement
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should accept valid email formats', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined)
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const form = emailInput.closest('form') as HTMLFormElement
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })
  })

  describe('Form submission', () => {
    it('should call onSubmit with email and password', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockResolvedValueOnce(undefined)
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'securePassword')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledWith('user@example.com', 'securePassword')
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled()
    })

    it('should display error from onSubmit rejection', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockRejectedValueOnce(new Error('Invalid credentials'))
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should handle non-Error rejections gracefully', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockRejectedValueOnce('Some error string')
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<AuthForm mode="login" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password')

      expect(emailInput).toHaveAttribute('id')
      expect(passwordInput).toHaveAttribute('id')
    })

    it('should announce errors with role="alert"', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      // Trigger an error by submitting with invalid email format
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const form = emailInput.closest('form') as HTMLFormElement
      fireEvent.submit(form)

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
      })
    })

    it('should have aria-live on error messages', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      // Trigger an error by submitting with invalid email format
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const form = emailInput.closest('form') as HTMLFormElement
      fireEvent.submit(form)

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toHaveAttribute('aria-live', 'polite')
      })
    })
  })

  describe('Input handling', () => {
    it('should update email state on input', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="login" />)

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should update password state on input', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="login" />)

      const passwordInput = document.getElementById('password') as HTMLInputElement
      await user.type(passwordInput, 'mypassword')

      expect(passwordInput).toHaveValue('mypassword')
    })

    it('should clear previous errors on new submission attempt', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)

      // Trigger an error by submitting with invalid email
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = document.getElementById('password') as HTMLInputElement
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const form = emailInput.closest('form') as HTMLFormElement
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })

      // Clear and type valid data
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      // Mock success
      mockOnSubmit.mockResolvedValueOnce(undefined)
      fireEvent.submit(form)

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
      })
    })
  })
})
