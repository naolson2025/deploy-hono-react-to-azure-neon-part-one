import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { CircleX } from 'lucide-react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

function SignUpPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  if (session) {
    router.navigate({ to: '/todos' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/todos',
      })

      if (result.error) {
        setError(result.error.message || 'Signup failed')
      } else {
        router.navigate({
          to: '/todos',
        })
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-base-100 flex flex-grow items-center justify-center p-4 pt-12">
      <div className="card w-full max-w-md bg-base-300 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-base-content">
              Create Account
            </h1>
            <p className="text-base-content/70 mt-2">Sign up to get started</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <CircleX />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="input input-bordered w-full validator"
                pattern="[A-Za-z][A-Za-z\- ]*"
                title="Only letters and dash"
                minLength={2}
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="validator-hint hidden">
                3 to 30 characters with only letters or dash
              </p>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full validator"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="validator-hint hidden">Should be a valid email</p>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full validator"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
              <p className="validator-hint hidden">
                Should be at least 8 characters
              </p>
            </div>

            <div className="form-control mb-8">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="input input-bordered w-full validator"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
              <p className="validator-hint hidden">
                Should be at least 8 characters
              </p>
            </div>

            <div className="form-control mt-2">
              <button
                type="submit"
                className={'btn btn-primary w-full'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                    <span className="ml-2 text-primary">
                      Creating account...
                    </span>
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-base-content/70">
              Already have an account?{' '}
              <Link to="/signin" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
