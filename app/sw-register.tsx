'use client';

import { useEffect } from 'react';

export function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
        registration => {
          console.log('✓ Service Worker registrado:', registration);
        },
        error => {
          console.log('✗ Erro ao registrar Service Worker:', error);
        }
      );
    }
  }, []);

  return null;
}
