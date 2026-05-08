export type DesignComponentStatus = 'canonical' | 'experimental' | 'deprecated';

export interface DesignComponentDefinition {
  name: string;
  status: DesignComponentStatus;
  purpose: string;
  allowedInAppCode: boolean;
}

export const designComponentRegistry = [
  {
    name: 'AppChrome',
    status: 'canonical',
    purpose: 'Application-level shell and global visual texture.',
    allowedInAppCode: true,
  },
  {
    name: 'Topbar',
    status: 'canonical',
    purpose: 'Freddy Founders brand and primary navigation surface.',
    allowedInAppCode: true,
  },
  {
    name: 'PageShell',
    status: 'canonical',
    purpose: 'Page-level stripe and public two-column grid frame.',
    allowedInAppCode: true,
  },
  {
    name: 'Panel',
    status: 'canonical',
    purpose: 'Primary bounded content region with industrial panel header.',
    allowedInAppCode: true,
  },
  {
    name: 'Rail',
    status: 'canonical',
    purpose: 'Right-side context rail with copy and lightweight stats.',
    allowedInAppCode: true,
  },
  {
    name: 'RowList',
    status: 'canonical',
    purpose: 'Dense directory/list row container.',
    allowedInAppCode: true,
  },
  {
    name: 'Row',
    status: 'canonical',
    purpose: 'Canonical list item grammar for events, people, companies, and admin rows.',
    allowedInAppCode: true,
  },
  {
    name: 'Meta',
    status: 'canonical',
    purpose: 'Monospace uppercase metadata line.',
    allowedInAppCode: true,
  },
  {
    name: 'Button',
    status: 'canonical',
    purpose: 'Action button with tone-controlled design-system styling.',
    allowedInAppCode: true,
  },
  {
    name: 'ButtonLink',
    status: 'canonical',
    purpose: 'Link action styled as a design-system button.',
    allowedInAppCode: true,
  },
  {
    name: 'Tag',
    status: 'canonical',
    purpose: 'Compact metadata chip.',
    allowedInAppCode: true,
  },
  {
    name: 'TagList',
    status: 'canonical',
    purpose: 'Wrapped collection of tags.',
    allowedInAppCode: true,
  },
  {
    name: 'FieldGrid',
    status: 'canonical',
    purpose: 'Canonical stacked form layout.',
    allowedInAppCode: true,
  },
  {
    name: 'Field',
    status: 'canonical',
    purpose: 'Label and control pairing for forms.',
    allowedInAppCode: true,
  },
  {
    name: 'TextInput',
    status: 'canonical',
    purpose: 'Text-like input with design-system styling.',
    allowedInAppCode: true,
  },
  {
    name: 'TextArea',
    status: 'canonical',
    purpose: 'Multiline input with design-system styling.',
    allowedInAppCode: true,
  },
  {
    name: 'Notice',
    status: 'canonical',
    purpose: 'Inline warning/status/info box.',
    allowedInAppCode: true,
  },
] satisfies DesignComponentDefinition[];
