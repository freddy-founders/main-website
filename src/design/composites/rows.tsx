import type { ReactNode } from 'react';
import { Meta } from '../primitives';

export function RowList({ children }: { children: ReactNode }) {
  return <ul className="ff-row-list">{children}</ul>;
}

export interface RowProps {
  title: string;
  meta?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}

export function Row({ title, meta, children, actions }: RowProps) {
  return (
    <li className="ff-row">
      <div className="ff-row-title">{title}</div>
      {children ? <div className="ff-row-copy">{children}</div> : null}
      {meta ? <Meta>{meta}</Meta> : null}
      {actions ? <div className="ff-actions">{actions}</div> : null}
    </li>
  );
}
