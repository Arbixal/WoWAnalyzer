import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/classic/druid';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#A70E9D';

class FaerieFire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = false;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.FAERIE_FIRE.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.FAERIE_FIRE],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default FaerieFire;
