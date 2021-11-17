import Module from 'parser/core/Module';
import Abilities from 'parser/core/modules/Abilities';
import Ability from 'parser/core/modules/Ability';

export type CoefficientMultiplier = (
  spellID: number,
  targetID: number,
  coefficient: number,
  timestamp: number,
  bounceNumber: number,
) => number;

class SpellCoefficients extends Module {
  static dependencies = {
    abilities: Abilities,
  };

  abilities!: Abilities;

  protected multipliers: CoefficientMultiplier[] = [];

  bySpellID(spellID: number, targetID: number, timestamp: number, eventNumber: number): number {
    const ability: Ability | undefined = this.abilities.getAbility(spellID);

    if (!ability) {
      return 0;
    }

    let spellCoefficient = ability.primaryCoefficient ?? 0;

    this.multipliers.forEach(
      (multiplier) =>
        (spellCoefficient = multiplier.bind(this)(
          spellID,
          targetID,
          spellCoefficient,
          timestamp,
          eventNumber,
        )),
    );

    return spellCoefficient;
  }
}

export default SpellCoefficients;
