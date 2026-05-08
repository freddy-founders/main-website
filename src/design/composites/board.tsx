import type { ReactNode } from 'react';
import { Button, Tag, type TagTone } from '../primitives';

export interface BoardTag {
  label: string;
  tone?: TagTone;
}

export interface BoardStat {
  label: string;
  value: string;
}

export function BoardColumn({ children }: { children: ReactNode }) {
  return <div className="ff-board-column">{children}</div>;
}

export function BoardAside({ children }: { children: ReactNode }) {
  return <aside className="ff-board-aside">{children}</aside>;
}

export function BoardSection({
  label,
  meta,
  tone = 'red',
  children,
}: {
  label: string;
  meta?: string;
  tone?: 'red' | 'black';
  children: ReactNode;
}) {
  return (
    <section className="ff-board-section">
      <div className="ff-section-head" data-tone={tone}>
        <span>[ {label} ]</span>
        {meta ? <span>{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function ScheduleRow({
  marker,
  title,
  meta,
  children,
  tags = [],
  actions,
}: {
  marker: ReactNode;
  title: string;
  meta?: ReactNode;
  children?: ReactNode;
  tags?: BoardTag[];
  actions?: ReactNode;
}) {
  return (
    <article className="ff-schedule-row">
      <div className="ff-schedule-marker">{marker}</div>
      <div className="ff-schedule-body">
        <h2>{title}</h2>
        {meta ? <div className="ff-schedule-meta">{meta}</div> : null}
        {children ? <p>{children}</p> : null}
        {tags.length > 0 ? (
          <div className="ff-schedule-tags">
            {tags.map((tag) => (
              <Tag key={tag.label} tone={tag.tone}>
                {tag.label}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="ff-schedule-actions">{actions}</div> : null}
    </article>
  );
}

export function ScheduleMarker({
  month,
  day,
  weekday,
  time,
}: {
  month: string;
  day: string;
  weekday: string;
  time?: string;
}) {
  return (
    <time className="ff-schedule-date">
      <span>{month}</span>
      <strong>{day}</strong>
      <span>{weekday}</span>
      {time ? <span>{time}</span> : null}
    </time>
  );
}

export function SpecPanel({
  eyebrow,
  spec = 'SPEC',
  title,
  context,
  notes = [],
  stats = [],
}: {
  eyebrow: string;
  spec?: string;
  title: string;
  context: string;
  notes?: string[];
  stats?: BoardStat[];
}) {
  return (
    <section className="ff-spec-panel">
      <div className="ff-section-head" data-tone="black">
        <span>[ {eyebrow} ]</span>
        <span>{spec}</span>
      </div>
      <div className="ff-spec-body">
        <div className="ff-spec-kicker">Fredericton / Founders / Operators</div>
        <h1>{title}</h1>
        <p>{context}</p>
      </div>
      {notes.length > 0 ? (
        <div className="ff-spec-notes">
          {notes.map((note) => (
            <div key={note} className="ff-spec-note">
              <span aria-hidden="true">▫</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      ) : null}
      {stats.length > 0 ? <StatGrid stats={stats} /> : null}
    </section>
  );
}

export function StatGrid({ stats }: { stats: BoardStat[] }) {
  return (
    <div className="ff-stat-grid ff-mono">
      {stats.map((stat) => (
        <div className="ff-stat" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ChipBar({ chips }: { chips: Array<{ label: string; active?: boolean }> }) {
  return (
    <div className="ff-chip-bar">
      {chips.map((chip) => (
        <Button key={chip.label} tone={chip.active ? 'primary' : 'neutral'} type="button">
          {chip.label}
        </Button>
      ))}
    </div>
  );
}

export function FieldList({ items }: { items: string[] }) {
  return (
    <ol className="ff-field-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
