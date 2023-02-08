import SPELLS from 'common/SPELLS/classic/druid';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: [SPELLS.WRATH.id, ...SPELLS.WRATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STARFIRE.id, ...SPELLS.STARFIRE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MOONFIRE.id, ...SPELLS.MOONFIRE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.INSECT_SWARM.id, ...SPELLS.INSECT_SWARM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.TYPHOON.id, ...SPELLS.TYPHOON.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HURRICANE.id, ...SPELLS.HURRICANE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.FORCE_OF_NATURE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.STARFALL.id, ...SPELLS.STARFALL.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 60, // Actually 90s standard, but I'm assuming any boomie is going to have it glyphed.
      },
      {
        spell: [SPELLS.INNERVATE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.REBIRTH.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.TRANQUILITY.id, ...SPELLS.TRANQUILITY.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      // Defensive
      {
        spell: [SPELLS.BARKSKIN.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.ENTANGLING_ROOTS.id, ...SPELLS.ENTANGLING_ROOTS.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CYCLONE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      // Other spells (not apart of the normal rotation)

      // Utility
      {
        spell: [SPELLS.REMOVE_CURSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ABOLISH_POISON.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CURE_POISON.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FAERIE_FIRE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
