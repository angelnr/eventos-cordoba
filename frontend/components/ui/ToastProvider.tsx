import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const ToastContainer = dynamic(() => import('./ToastContainer'), { ssr: false });

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}