import { GuideProps, Section, SubSection } from 'interface/guide';

import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import Expansion from 'game/Expansion';
import EclipseGuide from './modules/core/EclipseGuide';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS/classic/druid';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        <SubSection title="Eclipse">
          <EclipseGuide />
        </SubSection>
        <SubSection title="DoTs and Debuffs">{modules.dotUptimes.guideSubsection}</SubSection>
      </Section>
      <Section title="Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
        <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
        <PreparationSection expansion={Expansion.WrathOfTheLichKing} />
      </Section>
    </>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.talentPoints[0] >= 51 && (
        <CastEfficiencyBar
          spellId={SPELLS.STARFALL.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.talentPoints[0] >= 41 && (
        <CastEfficiencyBar
          spellId={SPELLS.FORCE_OF_NATURE.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      <br />
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Spell Breakdowns</strong>
      <p />
      {info.combatant.talentPoints[0] >= 41 && modules.forceOfNature.guideCastBreakdown}
      {info.combatant.talentPoints[0] >= 51 && modules.starfall.guideCastBreakdown}
    </SubSection>
  );
}
