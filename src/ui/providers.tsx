'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}