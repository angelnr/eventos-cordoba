import '../styles/globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import { AuthProvider } from '../lib/auth'
import { ThemeProvider } from '../lib/theme'

export default function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
