import '@/styles/globals.css'
import { Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CheckLogin from '@/components/CheckLogin';
import CheckReady from '@/components/CheckReady';
import { Provider as JotaiProvider } from 'jotai';

import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_APP_ID!}>
      <JotaiProvider>
        <CheckReady><CheckLogin><Component {...pageProps} /></CheckLogin></CheckReady>
      </JotaiProvider>
    </GoogleOAuthProvider>
  );
}
