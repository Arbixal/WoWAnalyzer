import { Options } from 'parser/core/Analyzer';

import ThroughputTrinket from './ThroughputTrinket';

export const ICON_OF_THE_SILVER_CRESCENT_SPELL = 35163;
export const ICON_OF_THE_SILVER_CRESCENT_ITEM = 29370;

class IconOfTheSilverCrescent extends ThroughputTrinket {
  static dependencies = {
    ...ThroughputTrinket.dependencies,
  };

  constructor(options: Options) {
    super({
      ...options,
      name: 'Icon of the Silver Crescent',
      spellID: ICON_OF_THE_SILVER_CRESCENT_SPELL,
      itemID: ICON_OF_THE_SILVER_CRESCENT_ITEM,
      cooldown: 120,
      bonusHealing: 155,
      bonusSpellpower: 155,
    });
  }
}

export default IconOfTheSilverCrescent;
