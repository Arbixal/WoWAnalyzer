import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/classic/druid';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

class Moonfire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = false;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.MOONFIRE],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default Moonfire;
