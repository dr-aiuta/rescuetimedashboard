import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 300000, // 5 minutes
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <Component {...pageProps} />
      </div>
    </SWRConfig>
  );
}

export default MyApp;