'use client';

import dynamic from 'next/dynamic';

const AuthPromptModal = dynamic(
  () => import('@/components/auth-prompt-modal').then(m => ({ default: m.AuthPromptModal })),
  { ssr: false }
);

export function AuthPromptModalWrapper() {
  return <AuthPromptModal />;
}
