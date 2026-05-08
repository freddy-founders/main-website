import type { DesignElementProps } from '../foundations';

export type ButtonTone = 'primary' | 'neutral' | 'success';

export type ButtonLinkProps = DesignElementProps<'a'> & { tone?: ButtonTone };

export function ButtonLink({ tone = 'primary', ...props }: ButtonLinkProps) {
  return <a className="ff-button" data-tone={tone} {...props} />;
}

export type ButtonProps = DesignElementProps<'button'> & { tone?: ButtonTone };

export function Button({ tone = 'primary', ...props }: ButtonProps) {
  return <button className="ff-button" data-tone={tone} {...props} />;
}
