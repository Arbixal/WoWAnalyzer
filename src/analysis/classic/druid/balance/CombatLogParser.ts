// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import { lowRankSpells, Haste, CelestialFocus, GiftOfTheEarthmother } from '../shared';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DotUptimes from './modules/features/DotUptimes';
import Eclipse from './modules/features/Eclipse';
// Spells
import FaerieFire from './modules/spells/FaerieFire';
import ForceOfNature from './modules/spells/ForceOfNature';
import InsectSwarm from './modules/spells/InsectSwarm';
import Moonfire from './modules/spells/Moonfire';
import Starfall from './modules/spells/Starfall';

import Guide from './Guide';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaTracker: ManaTracker,
    manaUsageChart: ManaUsageChart,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    dotUptimes: DotUptimes,
    eclipse: Eclipse,
    // Spells
    faerieFire: FaerieFire,
    forceOfNature: ForceOfNature,
    insectSwarm: InsectSwarm,
    moonfire: Moonfire,
    starfall: Starfall,
    // Talents
    celestialFocus: CelestialFocus,
    giftOfTheEarthmother: GiftOfTheEarthmother,
  };

  static guide = Guide;
}

export default CombatLogParser;
