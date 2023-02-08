import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/classic/druid';
import { SpellLink } from 'interface';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { formatNumber } from 'common/format';

class Starfall extends Analyzer {
  static dependencies = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.talentPoints[0] >= 51;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFALL),
      this.onStarfallCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([{ id: 53190 }, { id: 53195 }]),
      this.onStarfallDamage,
    );
  }

  cast: number = 0;
  starfallCasts: StarfallCast[] = [];

  onStarfallCast(event: CastEvent) {
    this.cast += 1;
    this.starfallCasts[this.cast] = { timestamp: event.timestamp, totalDamage: 0, enemies: {} };
  }

  onStarfallDamage(event: DamageEvent) {
    const cast = this.starfallCasts[this.cast];

    cast.totalDamage += event.amount;
    if (!cast.enemies[event.targetID]) {
      cast.enemies[event.targetID] = event.amount;
    } else {
      cast.enemies[event.targetID] += event.amount;
    }
  }

  /** Guide fragment showing a breakdown of each Starfall cast */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink id={SPELLS.STARFALL} />
          </strong>{' '}
          is a huge AOE ability on a 1.5min cooldown (1 minute when glyphed). It hits all targets
          within 30 yards. Use careful positioning in order to not aggro mobs you are not in combat
          with.
        </p>
        <p>
          This should be used on cooldown unless it is being saved for times of big AoE packs during
          an encounter. It accounts for a decent portion of boomkin damage.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        {this.starfallCasts.map((cast, ix) => (
          <div key={'starfall_cast_' + cast.timestamp}>
            @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
            <SpellLink id={SPELLS.STARFALL} /> ({formatNumber(cast.totalDamage)} damage over{' '}
            {Object.entries(cast.enemies).length} mobs)
          </div>
        ))}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

interface StarfallCast {
  timestamp: number;
  totalDamage: number;
  enemies: { [id: number]: number };
}

export default Starfall;
