import { Options } from 'parser/core/Analyzer';

import ThroughputTrinket from './ThroughputTrinket';

export const DARK_IRON_SMOKING_PIPE_SPELL = 51953;
export const DARK_IRON_SMOKING_PIPE_ITEM = 38290;

class DarkIronSmokingPipe extends ThroughputTrinket {
  static dependencies = {
    ...ThroughputTrinket.dependencies,
  };

  constructor(options: Options) {
    super({
      ...options,
      name: 'Dark Iron Smoking Pipe',
      spellID: DARK_IRON_SMOKING_PIPE_SPELL,
      itemID: DARK_IRON_SMOKING_PIPE_ITEM,
      cooldown: 120,
      bonusHealing: 155,
      bonusSpellpower: 155,
    });
  }
}

export default DarkIronSmokingPipe;
