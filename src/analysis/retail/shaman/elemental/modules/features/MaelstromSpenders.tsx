import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, {
  CastEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import MaelstromTracker from '../resources/MaelstromTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ReactNode } from 'react';

interface SpenderCast {
  event: CastEvent;
  hasMoTE: boolean;
  hasEchoesOfGreatSunderingBuff: boolean;
  currentMaelstrom: number;
  lavaBurstAvailableDuration: number;
}

interface SelectedTalents {
  echoesOfGreatSundering: boolean;
  masterOfTheElements: boolean;
}

class MaelstromSpenders extends Analyzer.withDependencies({
  maelstromTracker: MaelstromTracker,
  spellUsable: SpellUsable,
}) {
  spenderCasts: SpenderCast[] = [];

  enabledTalents!: SelectedTalents;

  oneChargeLavaBurstTimestamp: number | null = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);

    this.enabledTalents = {
      echoesOfGreatSundering: this.selectedCombatant.hasTalent(
        TALENTS.ECHOES_OF_GREAT_SUNDERING_TALENT,
      ),
      masterOfTheElements: this.selectedCombatant.hasTalent(
        TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT,
      ),
    };

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS.EARTH_SHOCK_TALENT,
          TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
          TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT,
          TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT,
        ]),
      this.onSpenderCast,
    );

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.LAVA_BURST_TALENT),
      this.onLavaBustUsable,
    );
  }

  /**
   * Get the maelstrom cap for the selected combatant, taking into account any talents that modify it.
   */
  get maelstromCap(): number {
    let cap = 100;
    if (this.selectedCombatant.hasTalent(TALENTS.SWELLING_MAELSTROM_TALENT)) {
      cap += 50;
    }
    if (this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_CAPACITY_TALENT)) {
      cap += 25;
    }
    return cap;
  }

  /**
   * Get the primary spender spell ID for the selected combatant.
   */
  get primarySpender(): number {
    if (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT)) {
      return TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id;
    }
    return TALENTS.EARTH_SHOCK_TALENT.id;
  }

  onLavaBustUsable(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.RestoreCharge && event.chargesAvailable === 1) {
      this.oneChargeLavaBurstTimestamp = event.timestamp;
    }

    if (event.updateType === UpdateSpellUsableType.UseCharge && event.chargesAvailable === 0) {
      this.oneChargeLavaBurstTimestamp = null;
    }
  }

  onSpenderCast(event: CastEvent) {
    const cast: SpenderCast = {
      event: event,
      hasMoTE:
        this.enabledTalents.masterOfTheElements &&
        this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id, event.timestamp),
      hasEchoesOfGreatSunderingBuff:
        this.enabledTalents.echoesOfGreatSundering &&
        this.selectedCombatant.hasBuff(
          SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF.id,
          event.timestamp,
          25,
        ),
      currentMaelstrom:
        this.deps.maelstromTracker.current +
        (this.deps.maelstromTracker.lastSpenderInfo?.amount ?? 0),
      lavaBurstAvailableDuration: this.oneChargeLavaBurstTimestamp
        ? event.timestamp - this.oneChargeLavaBurstTimestamp
        : 0,
    };
    this.spenderCasts.push(cast);
  }

  // Create a checklist item for Master of the Elements state
  private createMoteChecklistItem(cast: SpenderCast): ChecklistUsageInfo {
    const explanation = (
      <>
        <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} /> was{' '}
        {cast.hasMoTE ? 'active' : 'not active'}
      </>
    );
    return {
      timestamp: cast.event.timestamp,
      summary: explanation,
      check: 'has-mote',
      performance: cast.hasMoTE ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      details: <div>{explanation}</div>,
    };
  }

  // Create a comprehensive checklist item for spender selection (merging Echoes and spender logic)
  private createSpenderSelectionChecklistItem(cast: SpenderCast): ChecklistUsageInfo {
    const isEarthquake = this.isEarthquake(cast.event.ability.guid);
    let performance = QualitativePerformance.Perfect;
    let explanation: ReactNode;

    if (this.enabledTalents.echoesOfGreatSundering) {
      // Check if the correct spender was used based on Echoes buff state
      if (isEarthquake && !cast.hasEchoesOfGreatSunderingBuff) {
        performance = QualitativePerformance.Fail;
        explanation = (
          <>
            <SpellLink spell={cast.event.ability.guid} /> was cast without the{' '}
            <SpellLink spell={SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF} /> buff
          </>
        );
      } else if (!isEarthquake && cast.hasEchoesOfGreatSunderingBuff) {
        performance = QualitativePerformance.Fail;
        explanation = (
          <>
            <SpellLink spell={cast.event.ability.guid} /> was cast while the{' '}
            <SpellLink spell={SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF} /> buff was active.
          </>
        );
      } else {
        // Correct usage based on Echoes talent
        performance = QualitativePerformance.Perfect;
        explanation = (
          <>
            <SpellLink spell={cast.event.ability.guid} /> was cast{' '}
            {isEarthquake ? 'with' : 'without'} the{' '}
            <SpellLink spell={SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF} /> buff.
          </>
        );
      }
    } else {
      // No Echoes talent, just show which spender was used
      explanation = (
        <>
          <SpellLink spell={cast.event.ability.guid} /> was cast.
        </>
      );
    }

    return {
      timestamp: cast.event.timestamp,
      summary: (
        <>
          <SpellLink spell={cast.event.ability.guid} /> cast
          {this.enabledTalents.echoesOfGreatSundering
            ? (isEarthquake ? ' with ' : ' without ') + 'Echoes buff'
            : ''}
        </>
      ),
      check: 'spender-type',
      performance: performance,
      details: <div>{explanation}</div>,
    };
  }

  // Create a checklist item for Lava Burst charges state
  private createLavaBurstChecklistItem(cast: SpenderCast): ChecklistUsageInfo {
    let performance: QualitativePerformance;
    let details: ReactNode;

    if (cast.lavaBurstAvailableDuration < 10) {
      performance = QualitativePerformance.Perfect;
      details = (
        <>
          <div>
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> was unavailable.
          </div>
        </>
      );
    } else if (cast.lavaBurstAvailableDuration < 1000) {
      // It's okay if LvB just became available or we're about to cap
      performance = QualitativePerformance.Ok;
      details = (
        <>
          <div>
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> was available for less than{' '}
            <strong>{formatSeconds(cast.lavaBurstAvailableDuration, 1)}s</strong>.
          </div>
        </>
      );
    } else {
      performance = QualitativePerformance.Fail;
      details = (
        <>
          <div>
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} />: One or more charges available for{' '}
            <strong>{formatSeconds(cast.lavaBurstAvailableDuration, 1)}s</strong> prior to spender
            cast.
          </div>
        </>
      );
    }

    return {
      timestamp: cast.event.timestamp,
      summary: (
        <>
          <SpellLink spell={TALENTS.LAVA_BURST_TALENT} />{' '}
          {cast.lavaBurstAvailableDuration > 0 ? 'available' : 'not available'}
        </>
      ),
      check: 'lava-burst',
      performance: performance,
      details: details,
    };
  }

  // Create a checklist item for Maelstrom cap state
  private createMaelstromCapChecklistItem(cast: SpenderCast): ChecklistUsageInfo {
    const nearCap = this.nearMaelstromCap(cast.currentMaelstrom);
    return {
      timestamp: cast.event.timestamp,
      summary: (
        <>
          <strong>{cast.currentMaelstrom}</strong> <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />
        </>
      ),
      check: 'maelstrom',
      performance: nearCap ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      details: (
        <div>
          <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />:{' '}
          <strong>
            {formatNumber(cast.currentMaelstrom)}/{formatNumber(this.maelstromCap)}{' '}
          </strong>
        </div>
      ),
    };
  }

  calculateCastPerformance(cast: SpenderCast): QualitativePerformance {
    // Check Echoes of Great Sundering first if applicable
    if (this.enabledTalents.echoesOfGreatSundering) {
      if (this.isEarthquake(cast.event.ability.guid) && !cast.hasEchoesOfGreatSunderingBuff) {
        return QualitativePerformance.Fail; // Using EQ without the buff is bad
      }
      if (!this.isEarthquake(cast.event.ability.guid) && cast.hasEchoesOfGreatSunderingBuff) {
        return QualitativePerformance.Fail; // Using ES/EB with the buff is bad
      }
    }

    // Then the normal MoTE checks
    if (cast.hasMoTE) {
      return QualitativePerformance.Perfect;
    } else {
      if (this.nearMaelstromCap(cast.currentMaelstrom)) {
        return cast.lavaBurstAvailableDuration < 1000
          ? QualitativePerformance.Good
          : QualitativePerformance.Ok;
      } else {
        return QualitativePerformance.Fail;
      }
    }
  }

  guideSubsection() {
    if (this.spenderCasts.length === 0) {
      return null;
    }

    const spellUses: SpellUse[] = this.spenderCasts.map((cast) => {
      // Create all potential checklist items
      const isEarthquake = this.isEarthquake(cast.event.ability.guid);

      const moteChecklistItem = this.createMoteChecklistItem(cast);
      const maelstromCapChecklistItem = this.createMaelstromCapChecklistItem(cast);
      const lavaBurstCharges = this.createLavaBurstChecklistItem(cast);
      const spenderSelectionChecklistItem = this.createSpenderSelectionChecklistItem(cast);

      const checks = [];

      // Add spender selection check first
      if (this.enabledTalents.echoesOfGreatSundering) {
        checks.push(spenderSelectionChecklistItem);
      }

      // Add MoTE check
      if (this.enabledTalents.masterOfTheElements) {
        checks.push(moteChecklistItem);
      }

      let extraDetail: ReactNode | null = null;
      const performance = this.calculateCastPerformance(cast);
      // If not perfect, add additional details
      if (performance !== QualitativePerformance.Perfect) {
        checks.push(maelstromCapChecklistItem);

        if (!cast.hasMoTE) {
          checks.push(lavaBurstCharges);
        }

        const warnings: ReactNode[] = [];
        warnings.push(<li key="maelstrom-warning">{this.getMaelstromWarning(cast)}</li>);

        if (cast.lavaBurstAvailableDuration > 1000 && this.enabledTalents.masterOfTheElements) {
          warnings.push(
            <li key="lava-burst-warning">
              One or more charges of <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> were available
              for <strong>{formatSeconds(cast.lavaBurstAvailableDuration, 1)}s</strong> - you should
              have cast it earlier to have{' '}
              <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} /> active.
            </li>,
          );
        }

        if (this.enabledTalents.echoesOfGreatSundering) {
          if (isEarthquake && !cast.hasEchoesOfGreatSunderingBuff) {
            warnings.push(
              <li key="echoes-warning">
                You cast <SpellLink spell={TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT} /> without the{' '}
                <SpellLink spell={SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF} /> buff. With{' '}
                <SpellLink spell={TALENTS.ECHOES_OF_GREAT_SUNDERING_TALENT} />, you should only cast
                Earthquake when the buff is active.
              </li>,
            );
          } else if (!isEarthquake && cast.hasEchoesOfGreatSunderingBuff) {
            warnings.push(
              <li key="echoes-warning">
                You cast <SpellLink spell={cast.event.ability.guid} /> with the{' '}
                <SpellLink spell={SPELLS.ECHOES_OF_GREAT_SUNDERING_BUFF} /> buff active. You should
                have cast <SpellLink spell={TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT} /> instead.
              </li>,
            );
          }
        }

        extraDetail = (
          <>
            Try improving on one or more of the following to maximize your damage output:
            <ul>{warnings}</ul>
          </>
        );
      }

      const use: SpellUse = {
        event: cast.event,
        checklistItems: checks,
        performance: performance,
        extraDetails: extraDetail,
      };
      return use;
    });

    const performances: BoxRowEntry[] = spellUses.map((use) => {
      const tooltipText =
        use.performance === QualitativePerformance.Perfect
          ? 'Perfect cast'
          : 'Inefficient cast, see details';

      return {
        value: use.performance,
        tooltip: tooltipText,
      };
    });

    const explanation = (
      <>
        <p>
          {this.enabledTalents.masterOfTheElements ? (
            <>
              You should aim to cast your <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> spenders
              with the <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} /> buff
              active to maximize your damage output, or to avoid overcapping{' '}
              <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> (within 15 of your maximum).
            </>
          ) : (
            <>
              You should aim to cast your <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> spenders
              to avoid overcapping <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> (within 15 of
              your maximum).
            </>
          )}
        </p>
        {this.enabledTalents.echoesOfGreatSundering && (
          <p>
            With <SpellLink spell={TALENTS.ECHOES_OF_GREAT_SUNDERING_TALENT} />, you should:
            <ul>
              <li>
                Cast <SpellLink spell={TALENTS.EARTH_SHOCK_TALENT} /> or{' '}
                <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> when you don't have
                the buff
              </li>
              <li>
                Cast <SpellLink spell={TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT} /> only when you have
                the buff
              </li>
            </ul>
            This alternating pattern maximizes your damage and ensures you get full value from the
            talent.
          </p>
        )}
      </>
    );

    return (
      <SpellUsageSubSection
        title="Maelstrom Spender Usage"
        explanation={explanation}
        performances={performances}
        uses={spellUses}
      />
    );
  }

  getMaelstromWarning(cast: SpenderCast): ReactNode {
    if (cast.currentMaelstrom > this.maelstromCap - 15) {
      return (
        <>
          You were {cast.currentMaelstrom === this.maelstromCap ? 'at' : 'near'} the{' '}
          <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> cap. Spend earlier to avoid overcapping
          and wasting <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />.
        </>
      );
    } else {
      return (
        <>
          You were not near the <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> cap and did not
          need to spend <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />.
        </>
      );
    }
  }

  // Calculate effective cap threshold (where it becomes ok to spend without MoTE)
  nearMaelstromCap(current: number): boolean {
    return current >= this.maelstromCap - 15;
  }

  isEarthquake(spellId: number): boolean {
    return [
      TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
      TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id,
    ].includes(spellId);
  }
}

/**
 * Formats a duration in milliseconds as seconds with a specified precision.
 * @param durationMs - The duration in milliseconds to format.
 * @param precision - The number of decimal places to include in the result.
 * @returns The formatted duration in seconds, rounded to the specified precision.
 */
function formatSeconds(durationMs: number, precision: number): number {
  return Math.round((durationMs * Math.pow(10, precision)) / 1000) / Math.pow(10, precision);
}

export default MaelstromSpenders;
