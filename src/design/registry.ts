export type DesignComponentCategory = 'primitive' | 'composite' | 'pattern';
export type DesignComponentStatus = 'canonical' | 'experimental' | 'deprecated';

export interface DesignComponentDefinition {
  name: string;
  category: DesignComponentCategory;
  status: DesignComponentStatus;
  purpose: string;
  allowedInRoutes: boolean;
}

export const designComponentRegistry = [
  {
    name: 'Button',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Action button with tone-controlled design-system styling.',
    allowedInRoutes: true,
  },
  {
    name: 'ButtonLink',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Link action styled as a design-system button.',
    allowedInRoutes: true,
  },
  {
    name: 'Meta',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Monospace uppercase metadata line.',
    allowedInRoutes: true,
  },
  {
    name: 'Notice',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Inline warning/status/info box.',
    allowedInRoutes: true,
  },
  {
    name: 'Tag',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Compact metadata chip.',
    allowedInRoutes: true,
  },
  {
    name: 'TextArea',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Multiline input with design-system styling.',
    allowedInRoutes: true,
  },
  {
    name: 'TextInput',
    category: 'primitive',
    status: 'canonical',
    purpose: 'Text-like input with design-system styling.',
    allowedInRoutes: true,
  },
  {
    name: 'AuthEntryShell',
    category: 'composite',
    status: 'canonical',
    purpose: 'Centered public auth entry shell for login and application access pages.',
    allowedInRoutes: true,
  },
  {
    name: 'AppChrome',
    category: 'composite',
    status: 'canonical',
    purpose: 'Application-level shell and global visual texture.',
    allowedInRoutes: true,
  },
  {
    name: 'BoardAside',
    category: 'composite',
    status: 'canonical',
    purpose: 'Right-side operational board column for specs, filters, and field lists.',
    allowedInRoutes: true,
  },
  {
    name: 'BoardColumn',
    category: 'composite',
    status: 'canonical',
    purpose: 'Primary operational board column for stacked sections.',
    allowedInRoutes: true,
  },
  {
    name: 'BoardSection',
    category: 'composite',
    status: 'canonical',
    purpose: 'Compartmentalized section with bracketed industrial header.',
    allowedInRoutes: true,
  },
  {
    name: 'ChipBar',
    category: 'composite',
    status: 'canonical',
    purpose: 'Compact filter/action chip strip.',
    allowedInRoutes: true,
  },
  {
    name: 'Field',
    category: 'composite',
    status: 'canonical',
    purpose: 'Label and control pairing for forms.',
    allowedInRoutes: true,
  },
  {
    name: 'FieldGrid',
    category: 'composite',
    status: 'canonical',
    purpose: 'Canonical stacked form layout.',
    allowedInRoutes: true,
  },
  {
    name: 'FieldList',
    category: 'composite',
    status: 'canonical',
    purpose: 'Numbered technical field list for explaining row contents.',
    allowedInRoutes: true,
  },
  {
    name: 'PageShell',
    category: 'composite',
    status: 'canonical',
    purpose: 'Page-level stripe and public two-column grid frame.',
    allowedInRoutes: true,
  },
  {
    name: 'Panel',
    category: 'composite',
    status: 'canonical',
    purpose: 'Primary bounded content region with industrial panel header.',
    allowedInRoutes: true,
  },
  {
    name: 'Rail',
    category: 'composite',
    status: 'canonical',
    purpose: 'Right-side context rail with copy and lightweight stats.',
    allowedInRoutes: true,
  },
  {
    name: 'ScheduleMarker',
    category: 'composite',
    status: 'canonical',
    purpose: 'Stacked date/time marker for schedule rows.',
    allowedInRoutes: true,
  },
  {
    name: 'ScheduleRow',
    category: 'composite',
    status: 'canonical',
    purpose: 'Dense event/schedule row with date marker, metadata, tags, and actions.',
    allowedInRoutes: true,
  },
  {
    name: 'SpecPanel',
    category: 'composite',
    status: 'canonical',
    purpose: 'Right-rail specification panel with macro title, context, notes, and stats.',
    allowedInRoutes: true,
  },
  {
    name: 'StatGrid',
    category: 'composite',
    status: 'canonical',
    purpose: 'Two-up numeric telemetry/stat block.',
    allowedInRoutes: true,
  },
  {
    name: 'RailSection',
    category: 'composite',
    status: 'canonical',
    purpose: 'Canonical content section inside a right-side rail.',
    allowedInRoutes: true,
  },
  {
    name: 'Row',
    category: 'composite',
    status: 'canonical',
    purpose: 'Canonical list item grammar for events, people, companies, and admin rows.',
    allowedInRoutes: true,
  },
  {
    name: 'RowList',
    category: 'composite',
    status: 'canonical',
    purpose: 'Dense directory/list row container.',
    allowedInRoutes: true,
  },
  {
    name: 'TagList',
    category: 'composite',
    status: 'canonical',
    purpose: 'Wrapped collection of tags.',
    allowedInRoutes: true,
  },
  {
    name: 'Topbar',
    category: 'composite',
    status: 'canonical',
    purpose: 'Freddy Founders brand and primary navigation surface.',
    allowedInRoutes: true,
  },
  {
    name: 'DesignLibraryExample',
    category: 'pattern',
    status: 'experimental',
    purpose: 'Build-only catalog example for visual and API review without Storybook ceremony.',
    allowedInRoutes: false,
  },
] satisfies DesignComponentDefinition[];

export const designTaxonomy = {
  primitive: designComponentRegistry.filter((component) => component.category === 'primitive'),
  composite: designComponentRegistry.filter((component) => component.category === 'composite'),
  pattern: designComponentRegistry.filter((component) => component.category === 'pattern'),
} as const;
