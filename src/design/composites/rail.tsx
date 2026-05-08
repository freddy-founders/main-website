import type { ReactNode } from 'react';

export interface RailStat {
  label: string;
  value: string;
}

export interface RailProps {
  title: string;
  copy: string;
  stats?: RailStat[];
  children?: ReactNode;
}

export function Rail({ title, copy, stats = [], children }: RailProps) {
  return (
    <aside className="ff-rail" aria-label={`${title} context`}>
      <RailSection>
        <div className="ff-rail-title">{title}</div>
        <div className="ff-rail-copy">{copy}</div>
      </RailSection>
      {stats.length > 0 ? (
        <div className="ff-stat-grid ff-mono">
          {stats.map((stat) => (
            <div className="ff-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </aside>
  );
}

export function RailSection({ children }: { children: ReactNode }) {
  return <div className="ff-rail-section">{children}</div>;
}
