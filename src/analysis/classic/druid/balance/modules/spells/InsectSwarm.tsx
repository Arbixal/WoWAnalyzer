import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/classic/druid';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#B1D859';

class InsectSwarm extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.talentPoints[0] >= 21;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.INSECT_SWARM.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.INSECT_SWARM],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default InsectSwarm;
