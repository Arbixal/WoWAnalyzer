import { Spec } from 'game/SPECS';
import { Race } from 'game/RACES';
import PhaseConfig from 'parser/core/PhaseConfig';
import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import MythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';
import MythicPlusSeasonThree from 'game/raids/mythicplusseasonthree';
import NerubarPalace from 'game/raids/nerubarpalace';
import Undermine from 'game/raids/undermine';
import {
  msv as MogushanVaults,
  hof as HeartOfFear,
  toes as TerraceOfEndlessSpring,
} from './mop_msv_hof_toes';
import ManaforgeOmega from 'game/raids/manaforge-omega';

interface EncounterConfig {
  vantusRuneBuffId?: number;
  softMitigationChecks?: {
    physical: [];
    magical: [];
  };
  resultsWarning?: string;
  phases?: Record<string, PhaseConfig>;
  raceTranslation?: (race: Race, spec?: Spec) => Race;
  disableDeathSuggestion?: boolean;
  disableDowntimeSuggestion?: boolean;
  disableDowntimeStatistic?: boolean;
  timeline?: {
    abilities?: EncounterTimelineAbility[];
    debuffs?: EncounterTimelineDebuff[];
  };
}

export interface EncounterTimelineAbility {
  id: number;
  type: 'begincast' | 'cast' | 'summon';
  bossOnly?: boolean;
}

export interface EncounterTimelineDebuff {
  id: number;
  /**
   * Whether this logs as a buff or debuff. Default is `debuff`.
   */
  type?: 'debuff' | 'buff';
}

interface Encounter {
  id: number;
  name: string;
  background?: string;
  backgroundPosition?: string;
  headshot?: string;
  icon?: string;
}

export interface Boss extends Encounter {
  fight: EncounterConfig;
}

export interface Raid {
  name: string;
  background?: string;
  bosses: Record<string, Boss>;
}
export interface Phase extends PhaseConfig {
  start: number[];
  end: number[];
}

const dungeons = {
  // The War Within
  MythicPlusSeasonOne,
  MythicPlusSeasonTwo,
  MythicPlusSeasonThree,
};

const raids = {
  NerubarPalace, // TWW S1
  Undermine, // TWW S2
  ManaforgeOmega, // TWW S3
  // Mists of Pandaria (Classic)
  MogushanVaults,
  HeartOfFear,
  TerraceOfEndlessSpring,
};

function findByDungeonBossId(id: number) {
  return Object.values(dungeons)
    .flatMap((dungeon) => Object.values(dungeon.bosses))
    .find((boss) => boss.id === id);
}

function findByRaidBossId(id: number) {
  return Object.values(raids)
    .flatMap((raid) => Object.values(raid.bosses))
    .find((boss) => boss.id === id);
}

export function findByBossId(id: number) {
  return findByRaidBossId(id) ?? findByDungeonBossId(id) ?? null;
}

export function findZoneByBossId(id: number): Raid | undefined {
  return Object.values(raids as Record<string, Raid>)
    .concat(Object.values(dungeons as Record<string, Raid>))
    .find((zone) => Object.values(zone.bosses).some((boss) => boss.id === id));
}
