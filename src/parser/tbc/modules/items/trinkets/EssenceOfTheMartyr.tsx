import { Options } from 'parser/core/Analyzer';

import ThroughputTrinket from './ThroughputTrinket';

export const ESSENCE_OF_THE_MARTYR_SPELL = 35165;
export const ESSENCE_OF_THE_MARTYR_ITEM = 29376;

class EssenceOfTheMartyr extends ThroughputTrinket {
  static dependencies = {
    ...ThroughputTrinket.dependencies,
  };

  constructor(options: Options) {
    super({
      ...options,
      name: 'Essence of the Martyr',
      spellID: ESSENCE_OF_THE_MARTYR_SPELL,
      itemID: ESSENCE_OF_THE_MARTYR_ITEM,
      cooldown: 120,
      bonusHealing: 297,
      bonusSpellpower: 99,
    });
  }
}

export default EssenceOfTheMartyr;
