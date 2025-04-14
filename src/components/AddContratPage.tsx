'use client';

import dynamic from 'next/dynamic';

// Import the component dynamically with SSR disabled
const DynamicAddContratPage = dynamic(
  () => import('@/components/AddContratPage'),
  { ssr: false }
);

export default function AddContratPage() {
  return <DynamicAddContratPage />;
}