import type { ComponentPropsWithoutRef, ElementType } from 'react';

export type DesignElementProps<Element extends ElementType> = Omit<
  ComponentPropsWithoutRef<Element>,
  'className' | 'style'
>;
