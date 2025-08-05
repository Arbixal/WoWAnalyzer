import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      //Cooldowns
      {
        spellId: SPELLS.VOIDFORM_BUFF.id,
        triggeredBySpellId: TALENTS.VOID_ERUPTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.DARK_ASCENSION_TALENT.id,
        triggeredBySpellId: TALENTS.DARK_ASCENSION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DARK_ASCENSION_TALENT),
        timelineHighlight: true,
      },

      //Talents
      {
        spellId: SPELLS.SHADOWY_INSIGHT_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DARK_EVANGELISM_TALENT_BUFF.id,
        triggeredBySpellId: [
          SPELLS.MIND_FLAY.id,
          SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.id,
          TALENTS.VOID_TORRENT_TALENT.id,
        ],
        enabled: combatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.DEATH_AND_MADNESS_TALENT_BUFF.id,
        triggeredBySpellId: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DEATHSPEAKER_TALENT_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT),
        timelineHighlight: true,
      },

      //Utility and Defensive
      {
        spellId: TALENTS.VAMPIRIC_EMBRACE_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: TALENTS.DISPERSION_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.POWER_WORD_SHIELD.id,
        triggeredBySpellId: SPELLS.POWER_WORD_SHIELD.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.FADE.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.DESPERATE_PRAYER.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.MIND_CONTROL.id,
        timelineHighlight: true,
      },
      //Bloodlust
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
