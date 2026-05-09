import '../styles/globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import { AuthProvider } from '../lib/auth'
import { ThemeProvider } from '../lib/theme'
import { ToastProvider } from '../components/ui/ToastProvider'

export default function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
