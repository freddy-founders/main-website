import type { ReactNode } from 'react';

export type TagTone = 'neutral' | 'accent' | 'success';

export function Tag({ tone = 'neutral', children }: { tone?: TagTone; children: ReactNode }) {
  return (
    <span className="ff-tag" data-tone={tone === 'neutral' ? undefined : tone}>
      {children}
    </span>
  );
}
