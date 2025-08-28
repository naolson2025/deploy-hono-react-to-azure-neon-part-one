import { Link, useRouter } from '@tanstack/react-router'
import { LogIn, LogOut, ShieldAlert, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { authClient } from '../lib/auth-client'

export default function Header() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null)
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [error])

  const dismissError = () => {
    setError(null)
  }

  const handleSignOut = async () => {
    setError(null)
    setLoading(true)
    try {
      await authClient.signOut()
      router.navigate({ to: '/' })
    } catch (err) {
      setError('Failed to logout, try again.')
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = () => {
    router.navigate({ to: '/signin' })
  }

  return (
    <>
      <header className="px-4 py-1 bg-base-200 text-base-content text-xl">
        <nav className="navbar">
          <div className="navbar-start">
            <div className="px-2">
              <Link
                to="/"
                activeProps={{ className: 'font-bold text-primary' }}
              >
                Home
              </Link>
            </div>

            <div className="px-2 flex items-center gap-1">
              <Link
                to="/todos"
                activeProps={{ className: 'font-bold text-primary' }}
              >
                Todos
              </Link>
              {!session && (
                <div
                  className="tooltip tooltip-bottom"
                  data-tip="must sign in to access todos"
                >
                  <span>
                    <ShieldAlert className="size-5 text-warning" />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="navbar-end">
            {session ? (
              <div className="tooltip tooltip-bottom" data-tip="sign out">
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm text-warning"></span>
                  ) : (
                    <LogOut className="h-5 w-5 text-warning" />
                  )}
                </button>
              </div>
            ) : (
              <div className="tooltip tooltip-bottom" data-tip="sign in">
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm text-warning"></span>
                  ) : (
                    <LogIn className="h-5 w-5 text-primary" />
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {error && (
        <div className="toast toast-top toast-center">
          <div className="alert alert-error">
            <span>{error}</span>
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={dismissError}
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
