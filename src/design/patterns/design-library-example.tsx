import {
  BoardAside,
  BoardColumn,
  BoardSection,
  ChipBar,
  FieldList,
  PageShell,
  ScheduleMarker,
  ScheduleRow,
  SpecPanel,
} from '../composites';
import { Button, ButtonLink } from '../primitives';

export function DesignLibraryExample() {
  return (
    <PageShell>
      <BoardColumn>
        <BoardSection label="Upcoming Events" meta="Default List">
          <ScheduleRow
            marker={<ScheduleMarker day="13" month="Jun" time="18:30" weekday="Thu" />}
            title="June Operator Dinner: AI Workflows in Local Services"
            meta="Fredericton / public / open"
            tags={[{ label: 'open', tone: 'success' }, { label: 'register first' }]}
            actions={
              <>
                <ButtonLink href="/events">RSVP</ButtonLink>
                <Button type="button" tone="neutral">
                  Details
                </Button>
              </>
            }
          >
            Small dinner for founders and operators building repeatable sales and AI-assisted
            workflows.
          </ScheduleRow>
        </BoardSection>
        <BoardSection label="Past" meta="Archive" tone="black">
          <ScheduleRow
            marker={<ScheduleMarker day="22" month="May" weekday="Thu" />}
            title="Local Services Operator Roundtable"
            meta="Past / Fredericton / archived"
            actions={
              <Button type="button" tone="neutral">
                Past
              </Button>
            }
          />
        </BoardSection>
      </BoardColumn>
      <BoardAside>
        <SpecPanel
          eyebrow="Events"
          title="Events"
          context="Plain rows, useful metadata, RSVP/register first. No feed, no comments, no ranking."
          notes={['Default public front page', 'Public / no login needed']}
          stats={[
            { value: '03', label: 'Upcoming events' },
            { value: '42', label: 'Public people' },
          ]}
        />
        <BoardSection label="Filters" meta="Events" tone="black">
          <ChipBar
            chips={[{ label: 'Upcoming', active: true }, { label: 'Open' }, { label: 'Remote' }]}
          />
        </BoardSection>
        <BoardSection label="Rows Show" meta="Event Fields" tone="black">
          <FieldList
            items={[
              'Date/time, location or format, host, and status.',
              'Fit/context plus RSVP/register action.',
            ]}
          />
        </BoardSection>
      </BoardAside>
    </PageShell>
  );
}
