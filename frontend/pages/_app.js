import '../styles/globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import { AuthProvider } from '../lib/auth'
import { ThemeProvider } from '../lib/theme'
import { ToastProvider } from '../components/ui/ToastProvider'
import { ErrorBoundary } from '../components/ErrorBoundary'
import VerificationBanner from '../components/VerificationBanner'

export default function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <ToastProvider>
              <VerificationBanner />
              <Component {...pageProps} />
            </ToastProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
