import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/druid';
import SHAMAN_SPELLS from 'common/SPELLS/classic/shaman';
import { SpellLink } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DeathEvent,
  SummonEvent,
  DamageEvent,
  ApplyBuffEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class ForceOfNature extends Analyzer {
  static dependencies = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.talentPoints[0] >= 41;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FORCE_OF_NATURE),
      this.onTreantCast,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.FORCE_OF_NATURE),
      this.onTreantSummon,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.onTreantDeath);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onTreantDamage);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER_PET).spell(SHAMAN_SPELLS.BLOODLUST),
      this.onTreantBloodlust,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SHAMAN_SPELLS.BLOODLUST),
      this.onPlayerLust,
    );
  }

  cast: number = 0;
  treantCasts: ForceOfNatureCast[] = [];
  missedBloodlust = false;

  onTreantCast(event: CastEvent) {
    // Did they get lust
    // Did they last the full 30sec
    // Were they placed well (start attacking immediately)
    this.cast += 1;

    this.treantCasts[this.cast] = {
      timestamp: event.timestamp,
      treantStats: {},
      attackDelay: -1,
      totalDamage: 0,
      lustCheck: this.missedBloodlust ? false : undefined,
    };
  }

  onTreantSummon(event: SummonEvent) {
    this.treantCasts[this.cast].treantStats[event.targetInstance] = { ttl: 0, totalDamage: 0 };
  }

  onTreantDeath(event: DeathEvent) {
    if (event.targetInstance) {
      this.treantCasts[this.cast].treantStats[event.targetInstance].ttl =
        event.timestamp - this.treantCasts[this.cast].timestamp;
    }
  }

  onTreantDamage(event: DamageEvent) {
    if (!event.sourceInstance || !event.sourceIsFriendly) {
      return;
    }

    if (this.treantCasts[this.cast].attackDelay === -1) {
      this.treantCasts[this.cast].attackDelay =
        event.timestamp - this.treantCasts[this.cast].timestamp;
    }

    this.treantCasts[this.cast].treantStats[event.sourceInstance].totalDamage += event.amount;
    this.treantCasts[this.cast].totalDamage += event.amount;
  }

  onTreantBloodlust(event: ApplyBuffEvent) {
    if (!event.targetInstance) {
      return;
    }

    this.treantCasts[this.cast].lustCheck = true;
  }

  onPlayerLust(event: ApplyBuffEvent) {
    if (this.cast === 0 || event.timestamp - this.treantCasts[this.cast].timestamp > 30000) {
      // No treants yet or treants died already
      this.missedBloodlust = true;
    }
  }

  /** Guide fragment showing a breakdown of each Force of Nature cast */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink id={SPELLS.FORCE_OF_NATURE} />
          </strong>{' '}
          otherwise called "Trees" or "Treants", summon 3 treants to attack for 30 seconds on a 3
          minute cooldown. It is best if your treants survive the full 30 seconds, so try to avoid
          summoning them just prior to a period of high incoming damage.
        </p>
        <p>
          <strong>Note:</strong> The treants ARE buffed by{' '}
          <SpellLink id={SHAMAN_SPELLS.BLOODLUST} />/<SpellLink id={SHAMAN_SPELLS.HEROISM} />. Drop
          them early and close to the boss so that they can take advantage of the bonus haste.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.treantCasts.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={SPELLS.FORCE_OF_NATURE.id} /> ({formatNumber(cast.totalDamage)} damage)
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];

          checklistItems.push({
            label: 'Good Placement',
            result: <PassFailCheckmark pass={cast.attackDelay !== -1 && cast.attackDelay < 1000} />,
          });

          if (cast.lustCheck !== undefined) {
            checklistItems.push({
              label: (
                <>
                  Got <SpellLink id={SHAMAN_SPELLS.BLOODLUST} /> /{' '}
                  <SpellLink id={SHAMAN_SPELLS.HEROISM} />?
                </>
              ),
              result: <PassFailCheckmark pass={cast.lustCheck} />,
            });
          }

          let anySurvivors = false;

          Object.entries(cast.treantStats).forEach(([key, stats]) => {
            if (stats.ttl >= 30000) {
              anySurvivors = true;
            }

            checklistItems.push({
              label: 'Treant ' + key,
              result: <PassFailCheckmark pass={stats.ttl >= 30000} />,
              details: <>(lasted {formatNumber(stats.ttl / 1000)} secs)</>,
            });
          });

          const overallPerf =
            anySurvivors && cast.attackDelay !== -1 && cast.attackDelay < 1000
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

interface ForceOfNatureCast {
  timestamp: number;
  treantStats: { [treantId: number]: TreantStats };
  attackDelay: number;
  totalDamage: number;
  lustCheck?: boolean;
}

interface TreantStats {
  ttl: number;
  totalDamage: number;
}

export default ForceOfNature;
