import type { ReactNode } from 'react';

export function Meta({ children }: { children: ReactNode }) {
  return <div className="ff-meta">{children}</div>;
}
