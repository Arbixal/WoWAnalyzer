import Expansion from './Expansion';
import GameBranch from './GameBranch';

// The current version of the game. Used to check spec patch compatibility and as a caching key.
const VERSIONS: Record<GameBranch, string> = {
  [GameBranch.Classic]: '5.5.0',
  [GameBranch.Retail]: '11.2.0',
};

export default VERSIONS;

export const wclGameVersionToExpansion = (gameVersion: number): Expansion => {
  switch (gameVersion) {
    case 2:
      return Expansion.Vanilla;
    case 3:
      return Expansion.TheBurningCrusade;
    case 4:
      return Expansion.WrathOfTheLichKing;
    case 5:
      return Expansion.Cataclysm;
    case 6:
      return Expansion.MistsOfPandaria;
    default:
      return Expansion.TheWarWithin;
  }
};

export const wclGameVersionToBranch = (gameVersion: number): GameBranch => {
  if (gameVersion === 1) {
    return GameBranch.Retail;
  } else {
    return GameBranch.Classic;
  }
};

export const isUnsupportedClassicVersion = (gameVersion: number): boolean => {
  return gameVersion > 1 && gameVersion <= 5;
};
