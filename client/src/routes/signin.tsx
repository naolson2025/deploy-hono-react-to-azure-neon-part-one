import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { CircleX } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/signin')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  if (session) {
    router.navigate({ to: '/todos' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Login failed')
      } else {
        // Redirect to dashboard or intended page
        router.navigate({ to: '/todos' })
      }
    } catch (err) {
      setError('Failed to sign in, try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-grow items-center bg-base-100 justify-center p-4 pt-12">
      <div className="card w-full max-w-md bg-base-300 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-base-content">
              Welcome Back
            </h1>
            <p className="text-base-content/70 mt-2">Sign in to your account</p>
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

            <div className="form-control">
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
              <p className="validator-hint">Should be at least 8 characters</p>
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
                    <span className="ml-2 text-primary">Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-2">
            <p className="text-base-content/70">
              Don't have an account?{' '}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
