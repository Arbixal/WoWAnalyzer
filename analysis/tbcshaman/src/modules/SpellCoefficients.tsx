import Abilities from 'parser/core/modules/Abilities';
import Combatants from 'parser/shared/modules/Combatants';
import BaseSpellCoefficients, { CoefficientMultiplier } from 'parser/tbc/modules/SpellCoefficients';

import { Build } from '../CONFIG';
import lowRankSpells, { downrankInfo } from '../lowRankSpells';
import * as SPELL_EFFECTS from '../SPELL_EFFECTS';
import * as SPELLS from '../SPELLS';

class SpellCoefficients extends BaseSpellCoefficients {
  static dependencies = {
    ...BaseSpellCoefficients.dependencies,
    abilities: Abilities,
    combatants: Combatants,
  };

  abilities!: Abilities;
  combatants!: Combatants;

  protected multipliers: CoefficientMultiplier[] = [
    this._applyDownrankMultiplier,
    this._applyPurification,
    this._applyImprovedChainHeal,
    this._applyHealingWay,
    this._applyRestorativeTotems,
    this._applyConcussion,
  ];

  _applyDownrankMultiplier(spellID: number, targetID: number, coefficient: number) {
    const downrankPenalty = downrankInfo[spellID] ?? 1;

    return coefficient * downrankPenalty;
  }

  _applyPurification(spellID: number, targetID: number, coefficient: number) {
    if (this.owner.build !== Build.DEFAULT) {
      return coefficient;
    }

    return coefficient * 1.1;
  }

  _applyImprovedChainHeal(
    spellID: number,
    targetID: number,
    coefficient: number,
    timestamp: number,
    bounceNumber: number,
  ) {
    if (![SPELLS.CHAIN_HEAL, ...lowRankSpells[SPELLS.CHAIN_HEAL]].includes(spellID)) {
      return coefficient;
    }

    let multiplier = coefficient;

    // Improved chain heal
    if (this.owner.build === Build.DEFAULT) {
      multiplier = multiplier * 1.2;
    }

    // 2nd bounce is half the healing power
    if (bounceNumber >= 2) {
      multiplier = multiplier / 2;
    }

    // 3rd bounce if half again
    if (bounceNumber === 3) {
      multiplier = multiplier / 2;
    }

    return multiplier;
  }

  _applyConcussion(
    spellID: number,
    targetID: number,
    coefficient: number,
    timestamp: number,
    bounceNumber: number,
  ) {
    if (this.owner.build !== Build.ELEMENTAL) {
      return coefficient;
    }

    const validSpellIDs = [
      SPELLS.LIGHTNING_BOLT,
      ...lowRankSpells[SPELLS.LIGHTNING_BOLT],
      SPELLS.CHAIN_LIGHTNING,
      ...lowRankSpells[SPELLS.CHAIN_LIGHTNING],
      SPELLS.EARTH_SHOCK,
      ...lowRankSpells[SPELLS.EARTH_SHOCK],
      SPELLS.FLAME_SHOCK,
      ...lowRankSpells[SPELLS.FLAME_SHOCK],
      SPELLS.FROST_SHOCK,
      ...lowRankSpells[SPELLS.FROST_SHOCK],
    ];

    if (!validSpellIDs.includes(spellID)) {
      return coefficient;
    }

    let multiplier = coefficient * 1.05;

    // 2nd bounce (only applies to chain lightning)
    if (bounceNumber >= 2) {
      multiplier = multiplier * 0.7;
    }

    // 3rd bounce (only aplies to chain lightning)
    if (bounceNumber === 3) {
      multiplier = multiplier * 0.7;
    }

    return multiplier;
  }

  _applyHealingWay(spellID: number, targetID: number, coefficient: number, timestamp: number) {
    if (
      this.owner.build !== Build.DEFAULT ||
      ![SPELLS.HEALING_WAVE, ...lowRankSpells[SPELLS.HEALING_WAVE]].includes(spellID)
    ) {
      return coefficient;
    }

    const healingWayStacks = this.combatants.players[targetID].getBuffStacks(
      SPELL_EFFECTS.HEALING_WAY,
      timestamp,
    );

    return coefficient * (1 + 0.06 * healingWayStacks);
  }

  _applyRestorativeTotems(
    spellID: number,
    targetID: number,
    coefficient: number,
    timestamp: number,
  ) {
    if (
      this.owner.build !== Build.DEFAULT ||
      ![
        SPELL_EFFECTS.HEALING_STREAM_TOTEM_HEAL,
        ...SPELL_EFFECTS.lowRankSpellEffects[SPELL_EFFECTS.HEALING_STREAM_TOTEM_HEAL],
      ].includes(spellID)
    ) {
      return coefficient;
    }
    return coefficient * 1.25;
  }

  bySpellID(spellID: number, targetID: number, timestamp: number, eventNumber: number): number {
    if (spellID === SPELL_EFFECTS.EARTH_SHIELD_HEAL) {
      spellID = SPELLS.EARTH_SHIELD;
    }

    return super.bySpellID(spellID, targetID, timestamp, eventNumber);
  }
}

export default SpellCoefficients;
