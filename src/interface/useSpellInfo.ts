import * as Sentry from '@sentry/browser';
import makeApiUrl from 'common/makeApiUrl';
import SPELLS from 'common/SPELLS';
import { useEffect } from 'react';
import useSWR from 'swr';
import Spell from 'common/SPELLS/Spell';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { getSpellId } from 'common/getSpellId';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());

const useSpellInfo = (spell: number | Spell) => {
  const { expansion } = useExpansionContext();
  const spellId = getSpellId(spell);
  const argumentAsSpell =
    typeof spell === 'number' ? maybeGetTalentOrSpell(spellId, expansion) : spell;

  const { data, error } = useSWR<Spell>(makeApiUrl(`spell/${spellId}`), {
    fetcher,
    isPaused: () => argumentAsSpell !== undefined,
  });

  useEffect(() => {
    if (data) {
      SPELLS[spellId] = data;
    }
  }, [data, spellId]);

  if (error) {
    Sentry.captureException(error);
    console.error(error);
    return argumentAsSpell;
  }

  return argumentAsSpell ?? data;
};

export default useSpellInfo;
