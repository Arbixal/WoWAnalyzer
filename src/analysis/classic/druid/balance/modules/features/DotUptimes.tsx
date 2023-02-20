import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import MoonfireUptime from 'analysis/classic/druid/balance/modules/spells/Moonfire';
import InsectSwarmUptime from 'analysis/classic/druid/balance/modules/spells/InsectSwarm';
import FairieFireUptime from 'analysis/classic/druid/balance/modules/spells/FaerieFire';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import SPELLS from 'common/SPELLS/classic/druid';
import { SpellLink } from 'interface';

/**
 * Wide statistics box for tracking the most important Balance DoT uptimes
 */
class DotUptimes extends Analyzer {
  static dependencies = {
    moonfireUptime: MoonfireUptime,
    insectSwarmUptime: InsectSwarmUptime,
    faerieFireUptime: FairieFireUptime,
  };

  protected moonfireUptime!: MoonfireUptime;
  protected insectSwarmUptime!: InsectSwarmUptime;
  protected faerieFireUptime!: FairieFireUptime;

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          Maintaining your two DoTs (<SpellLink id={SPELLS.INSECT_SWARM} />, and
          <SpellLink id={SPELLS.MOONFIRE} />) as well as <SpellLink id={SPELLS.FAERIE_FIRE} />{' '}
          throughout the fight is important for maximum DPS.
        </p>
        {this.selectedCombatant.talentPoints[0] >= 21 && (
          <p>
            <SpellLink id={SPELLS.INSECT_SWARM} /> should be maintained throughout the fight but
            allow it to fall off before reapplying. Do not reapply if there are less than 7 seconds
            remaining on <SpellLink id={SPELLS.ECLIPSE_LUNAR} />, wait for the eclipse to expire.
          </p>
        )}
        <p>
          <SpellLink id={SPELLS.MOONFIRE} /> should be recast immediately after
          <SpellLink id={SPELLS.ECLIPSE_SOLAR} /> expires and while on the move (if not already
          applied).
        </p>
      </>
    );

    const data = (
      <RoundedPanel>
        <strong>DoT Uptimes</strong>
        {this.moonfireUptime.subStatistic()}
        {this.selectedCombatant.talentPoints[0] >= 21 && this.insectSwarmUptime.subStatistic()}
        {this.faerieFireUptime.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <UptimeMultiBarStatistic
        title={
          <>
            <UptimeIcon /> DoT Uptimes
          </>
        }
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={<>These uptime bars show the times your DoT was active on at least one target.</>}
      >
        {this.moonfireUptime.subStatistic()}
        {this.selectedCombatant.talentPoints[0] >= 21 && this.insectSwarmUptime.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}

export default DotUptimes;
