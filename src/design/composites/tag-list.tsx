import { Tag } from '../primitives';

export function TagList({ items }: { items: string[] }) {
  return (
    <div className="ff-tag-list">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}
