import { ControlledExpandable, SpellLink } from 'interface';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import SPELLS from 'common/SPELLS/classic';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { useState } from 'react';

export default function EclipseGuideSection(): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(false);

  const explanation = (
    <>
      <p>
        A boomkin's DPS is based around management of <SpellLink id={48525} />. Whenever you crit
        using <SpellLink id={SPELLS.STARFIRE} /> you gain <SpellLink id={48517} /> which increases
        crit chance for your <SpellLink id={SPELLS.WRATH} /> casts. Likewise when
        <SpellLink id={SPELLS.WRATH} /> crits you gain <SpellLink id={48518} />, increasing the crit
        chance on your <SpellLink id={SPELLS.STARFIRE} /> casts.
      </p>
      <p>
        Once cooldowns and DoTs have been applied, settle into a standard rotation or spamming
        <SpellLink id={SPELLS.WRATH} /> until you proc a <SpellLink id={48518} />.
      </p>
      <p>
        Make use of any haste increasing items (<SpellLink id={SPELLS.HYPERSPEED_ACCELERATION} /> or{' '}
        <SpellLink id={53908} />) at the start of the Lunar Eclipse and switch to spamming
        <SpellLink id={SPELLS.STARFIRE} />.
      </p>
      <p>
        Continue spamming <SpellLink id={SPELLS.STARFIRE} /> after the eclipse has finished until
        you proc <SpellLink id={48517} /> and revert back to spamming{' '}
        <SpellLink id={SPELLS.WRATH} />.
      </p>
    </>
  );

  const data = (
    <>
      <RoundedPanel>
        <strong>
          <SpellLink id={48518} />
        </strong>
        <ControlledExpandable
          header={<>@ here</>}
          element="section"
          expanded={isExpanded}
          inverseExpanded={() => setIsExpanded(!isExpanded)}
        >
          <div></div>
        </ControlledExpandable>

        <strong>
          <SpellLink id={48517} />
        </strong>
      </RoundedPanel>
    </>
  );

  return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
}
