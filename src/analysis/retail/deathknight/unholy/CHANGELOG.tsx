import { change, date } from 'common/changelog';
import { Vetyst, Khazak, Brandrewsss } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';

export default [
  change(date(2025, 6, 8), 'Update Unholy Death Knight Abilities and Talents for Patch 11.1.5', Brandrewsss),
  change(date(2024, 12, 9), 'Update spec config to reflect lack of long term maintainers', Khazak),
  change(date(2024, 10, 7), <>Correct GCD and cooldown of <SpellLink spell={SPELLS.ANTI_MAGIC_SHELL.id} /> when paired with <SpellLink spell={TALENTS.ANTI_MAGIC_BARRIER_TALENT.id} /> and <SpellLink spell={TALENTS.UNYIELDING_WILL_TALENT.id} />.</>, Vetyst),
  change(date(2024, 10, 4), 'Enable Core Foundation of Unholy DK for TWW.', Vetyst),
];
