import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/paladin';
import { SpellbookAura } from 'parser/core/modules/Aura';

class Buffs extends CoreAuras {
  static dependencies = {
    ...CoreAuras.dependencies,
  };

  auras(): SpellbookAura[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spellId: SPELLS.EMPYREAN_POWER_TALENT_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.EMPYREAN_POWER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DIVINE_PURPOSE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_PURPOSE_RETRIBUTION_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FIRES_OF_JUSTICE_BUFF.id,
      },
      {
        spellId: SPELLS.RIGHTEOUS_VERDICT_BUFF.id,
      },
      // Throughput cooldowns
      {
        spellId: TALENTS.AVENGING_WRATH_TALENT.id,
        enabled: !combatant.hasTalent(TALENTS.CRUSADE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.CRUSADE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CRUSADE_TALENT),
        timelineHighlight: true,
      },
      // Utility
      {
        spellId: [
          SPELLS.DIVINE_STEED_BUFF.id,
          SPELLS.DIVINE_STEED_BUFF_ALT.id,
          SPELLS.DIVINE_STEED_BUFF_ALT_2.id,
          SPELLS.DIVINE_STEED_BUFF_ALT_3.id,
        ],
        triggeredBySpellId: TALENTS.DIVINE_STEED_TALENT.id,
      },
      {
        spellId: SPELLS.DIVINE_SHIELD.id,
      },
      {
        spellId: TALENTS.SHIELD_OF_VENGEANCE_TALENT.id,
      },
      {
        spellId: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
      },
      {
        spellId: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
