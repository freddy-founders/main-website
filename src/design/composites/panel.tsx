import type { ReactNode } from 'react';
import { slugify } from '../foundations';

export interface PanelProps {
  title: string;
  eyebrow?: string;
  tone?: 'default' | 'accent';
  children: ReactNode;
}

export function Panel({ title, eyebrow = 'DEFAULT LIST', tone = 'accent', children }: PanelProps) {
  return (
    <section className="ff-panel" aria-labelledby={`${slugify(title)}-heading`}>
      <div className="ff-panel-head" data-tone={tone}>
        <span id={`${slugify(title)}-heading`}>[ {title} ]</span>
        <span>{eyebrow}</span>
      </div>
      <div className="ff-panel-body">{children}</div>
    </section>
  );
}
