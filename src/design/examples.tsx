import {
  Button,
  ButtonLink,
  Field,
  FieldGrid,
  Notice,
  PageShell,
  Panel,
  Rail,
  Row,
  RowList,
  Tag,
  TagList,
  TextArea,
  TextInput,
} from './components';

export function DesignLibraryExample() {
  return (
    <PageShell>
      <Panel title="Design Library" eyebrow="Canonical Example">
        <RowList>
          <Row
            title="Founder Breakfast"
            meta="JUN 04 / DOWNTOWN FREDERICTON / OPEN"
            actions={<ButtonLink href="/events">Register externally</ButtonLink>}
          >
            Row grammar uses title first, short utility copy, monospace metadata, and explicit
            action.
          </Row>
          <Row
            title="Person row"
            meta="FOUNDER / RIVER SIGNAL LABS / CONSENTED"
            actions={<TagList items={['AI', 'B2B SaaS']} />}
          >
            People rows are public-safe context, not social profiles.
          </Row>
        </RowList>
        <FieldGrid>
          <Field label="Email">
            <TextInput placeholder="you@company.com" />
          </Field>
          <Field label="Context">
            <TextArea rows={3} placeholder="Short public-safe context" />
          </Field>
          <Button type="button">Submit</Button>
        </FieldGrid>
        <Notice>Notice surfaces are for bounded warnings and review-state messages.</Notice>
      </Panel>
      <Rail
        title="Design contract"
        copy="App code consumes exported primitives. Token, CSS, and ff-* class ownership stays inside src/design."
        stats={[
          { value: '17', label: 'Components' },
          { value: '01', label: 'Token source' },
        ]}
      >
        <div className="ff-rail-section">
          <Tag tone="accent">Canonical</Tag>
        </div>
      </Rail>
    </PageShell>
  );
}
