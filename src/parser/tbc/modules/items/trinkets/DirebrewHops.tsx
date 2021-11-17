import { Options } from 'parser/core/Analyzer';

import ThroughputTrinket from './ThroughputTrinket';

export const DIREBREW_HOPS_SPELL = 51954;
export const DIREBREW_HOPS_ITEM = 38288;

class DirebrewHops extends ThroughputTrinket {
  static dependencies = {
    ...ThroughputTrinket.dependencies,
  };

  constructor(options: Options) {
    super({
      ...options,
      name: 'Direbrew Hops',
      spellID: DIREBREW_HOPS_SPELL,
      itemID: DIREBREW_HOPS_ITEM,
      cooldown: 120,
      bonusHealing: 297,
      bonusSpellpower: 99,
    });
  }
}

export default DirebrewHops;
