import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS'
import TALENTS from 'common/TALENTS/mage';
import { Sharrq, emallson, SyncSubaru, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2024, 1, 16), <>Updated spec compatability to partial 10.2.5 support. More work is needed, but this should cover the bulk of it, I think.</>, Sharrq),
  change(date(2024, 1, 16), <>Turns out doing a find/replace to change Arcane Power to <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> is bad, imagine that. Rewrote a bunch of <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> tooltips to make sense again.</>, Sharrq),
  change(date(2024, 1, 16), <><SpellLink spell={TALENTS.SIPHON_STORM_TALENT} /> buff is now being tracked on the timeline.</>, Sharrq),
  change(date(2024, 1, 16), <><SpellLink spell={TALENTS.ARCANE_ECHO_TALENT} /> checks disabled for now until I can rewrite it, if its still needed.</>, Sharrq),
  change(date(2024, 1, 16), <><SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> now tracks overlap with <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />.</>, Sharrq),
  change(date(2024, 1, 16), <><SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> Pre Reqs adjusted to support the new rotation.</>, Sharrq),
  change(date(2024, 1, 16), <><SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> adjusted to count casts without <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} /> as a mistake.</>, Sharrq),
  change(date(2023, 7, 10), 'Remove references to 10.1.5 removed talents.', Sharrq),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 27), <>Added <SpellLink spell={TALENTS.TEMPORAL_WARP_TALENT} /> to list of Bloodlust Buffs.</>, Sharrq),
  change(date(2023, 1, 17), <>Fixed outdated reference to the Shadowlands version of <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />.</>, emallson),
  change(date(2023, 3, 19), <>Fixed utilisation percentage for <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> under <SpellLink spell={TALENTS.ARCANE_ECHO_TALENT} />.</>, SyncSubaru),
  change(date(2023, 3, 26), <>Renamed old Arcane Power into <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> in preparation for new analysis modules.</>, SyncSubaru),
  change(date(2023, 3, 25), <><SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> now shows on the timeline when active.</>, SyncSubaru),
  change(date(2023, 3, 19), <>Created anaylser for <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} /> ramp phases.</>, SyncSubaru),
  change(date(2023, 3, 14), <><SpellLink spell={TALENTS.ARCANE_HARMONY_TALENT} /> now shows Bonus Damage under Statistics.</>, SyncSubaru),
  change(date(2023, 3, 13), <>Updated bonus damage multiplier of <SpellLink spell={TALENTS.ARCANE_HARMONY_TALENT} />.</>, SyncSubaru),
  change(date(2023, 1, 17), <>Fixed outdated reference to the Shadowlands version of <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />.</>, emallson),
  change(date(2022, 10, 30), `Update Dragonflight SPELLS, Abilities, and Buffs`, Sharrq),
  change(date(2022, 9, 29), 'Initial Dragonflight support', Sharrq),
];
