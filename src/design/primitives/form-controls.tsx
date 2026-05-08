import type { DesignElementProps } from '../foundations';

export type TextInputProps = DesignElementProps<'input'>;

export function TextInput(props: TextInputProps) {
  return <input className="ff-input" {...props} />;
}

export type TextAreaProps = DesignElementProps<'textarea'>;

export function TextArea(props: TextAreaProps) {
  return <textarea className="ff-input" {...props} />;
}
