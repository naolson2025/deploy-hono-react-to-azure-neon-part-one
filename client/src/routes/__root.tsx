import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
      <footer className="footer footer-center p-4 bg-base-300 text-base-content/60">
        <div>
          <p>Built with ❤️ for productivity enthusiasts</p>
        </div>
      </footer>
    </div>
  ),
})
