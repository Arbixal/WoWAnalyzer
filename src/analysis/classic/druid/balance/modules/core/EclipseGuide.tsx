import { SpellLink } from 'interface';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import SPELLS from 'common/SPELLS/classic';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { useCallback, useState } from 'react';
import Explanation from 'interface/guide/components/Explanation';
import { SubSection, useAnalyzer, useEvents, useInfo } from 'interface/guide';
import styled from '@emotion/styled';
import { EclipseProc } from '../features/Eclipse';
import EclipseAnalyzer from '../features/Eclipse';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import { EventType } from 'parser/core/Events';
import { formatDuration, formatNumber } from 'common/format';

const EclipseUsageDetailsContainer = styled.div`
  display: grid;
  grid-template-rows: max-content max-content max-content 1fr;

  & .performance-block.selected {
    height: 1em;
  }
`;

const NoData = styled.div`
  color: #999;
`;

const EclipseDetailsContainer = styled.div`
  display: grid;
  margin-top: 1rem;
  grid-template-areas: 'talent source';
  grid-template-columns: 40% 1fr;

  gap: 1rem;
  height: 100%;
  align-items: start;

  ${NoData} {
    justify-self: center;
    align-self: center;
    grid-column: 1 / -1;
  }

  & > table {
    width: 100%;
  }
  & > table td {
    padding-right: 1rem;

    &:first-of-type {
      max-width: 14em;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const EclipseDetailsHeader = styled.div`
  margin-top: 20px;
`;

const EclipseDetails = ({ eclipse }: { eclipse?: EclipseProc }) => {
  const events = useEvents();
  const info = useInfo()!;

  if (!eclipse) {
    return (
      <EclipseDetailsContainer>
        <NoData>Click on a box in the cast breakdown to view details.</NoData>
      </EclipseDetailsContainer>
    );
  }

  const filteredEvents = [
    ...events
      .filter(isApplicableEvent(info.playerId))
      .filter(({ timestamp }) => timestamp > eclipse.start && timestamp <= eclipse.end)
      .filter(
        (e) =>
          e.type !== EventType.Cast ||
          (e.ability.guid !== SPELLS.WRATH.id && e.ability.guid !== SPELLS.STARFIRE.id),
      ),
  ];

  return (
    <>
      <EclipseDetailsHeader>
        <table>
          <tbody>
            <tr>
              <th>Time</th>
              <td>
                {formatDuration(eclipse.start - info.fightStart)} -{' '}
                {formatDuration(eclipse.end - info.fightStart)}
              </td>
            </tr>
            <tr>
              <th>Type</th>
              <td>
                <SpellLink id={eclipse.spellId} />
              </td>
            </tr>
            <tr>
              <th>Damage</th>
              <td>
                {formatNumber(eclipse.totalDamage)} ({formatNumber(eclipse.totalDamage / 15)} dps)
              </td>
            </tr>
          </tbody>
        </table>
      </EclipseDetailsHeader>
      <EclipseDetailsContainer>
        <EmbeddedTimelineContainer secondWidth={40} secondsShown={15}>
          <SpellTimeline>
            <Casts
              start={filteredEvents[0].timestamp}
              movement={undefined}
              secondWidth={40}
              events={filteredEvents}
            />
          </SpellTimeline>
        </EmbeddedTimelineContainer>
      </EclipseDetailsContainer>
    </>
  );
};

export default function EclipseGuideSection(): JSX.Element | null {
  const [selectedEclipse, setSelectedEclipse] = useState<number | undefined>();
  const analyzer = useAnalyzer(EclipseAnalyzer);

  const explanation = (
    <>
      <p>
        A boomkin's DPS is based around management of <SpellLink id={48525} />. Whenever you crit
        using <SpellLink id={SPELLS.STARFIRE} /> you gain <SpellLink id={48517} /> which increases
        crit chance for your <SpellLink id={SPELLS.WRATH} /> casts. Likewise when
        <SpellLink id={SPELLS.WRATH} /> crits you gain <SpellLink id={48518} />, increasing the crit
        chance on your <SpellLink id={SPELLS.STARFIRE} /> casts.
      </p>
      <p>
        Once cooldowns and DoTs have been applied, settle into a standard rotation or spamming
        <SpellLink id={SPELLS.WRATH} /> until you proc a <SpellLink id={48518} />.
      </p>
      <p>
        Make use of any haste increasing items (<SpellLink id={SPELLS.HYPERSPEED_ACCELERATION} /> or{' '}
        <SpellLink id={53908} />) at the start of the Lunar Eclipse and switch to spamming
        <SpellLink id={SPELLS.STARFIRE} />.
      </p>
      <p>
        Continue spamming <SpellLink id={SPELLS.STARFIRE} /> after the eclipse has finished until
        you proc <SpellLink id={48517} /> and revert back to spamming{' '}
        <SpellLink id={SPELLS.WRATH} />.
      </p>
    </>
  );

  const eclipseProcs = analyzer?.eclipseEvents ?? [];
  const eclipsePerformance = analyzer?.eclipsePerformance ?? [];

  const onClickBox = useCallback(
    (index) => {
      if (index >= eclipseProcs.length) {
        setSelectedEclipse(undefined);
      } else {
        setSelectedEclipse(index);
      }
    },
    [eclipseProcs.length],
  );

  const data = (
    <>
      <div>
        <strong>Eclipse Breakdown</strong>{' '}
        <small>
          - These boxes represent each Eclipse proc, colored by how well the proc was used.
        </small>
      </div>
      <PerformanceBoxRow
        values={eclipsePerformance.map((perf, ix) =>
          ix === selectedEclipse ? { ...perf, className: 'selected' } : perf,
        )}
        onClickBox={onClickBox}
      />
      <EclipseDetails
        eclipse={selectedEclipse !== undefined ? eclipseProcs[selectedEclipse] : undefined}
      />
    </>
  );

  return (
    <SubSection>
      <ExplanationRow leftPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <Explanation>{explanation}</Explanation>
        <EclipseUsageDetailsContainer>{data}</EclipseUsageDetailsContainer>
      </ExplanationRow>
    </SubSection>
  );
}
