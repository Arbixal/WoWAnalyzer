import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { Icon, ItemLink } from 'interface';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  CastEvent,
  DamageEvent,
  EventType,
  HealEvent,
  Item,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import BoringValue from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import SpellCoefficients from '../../SpellCoefficients';

abstract class ThroughputTrinket extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    spellCoefficients: SpellCoefficients,
  };

  protected totalHeal = 0;
  protected effectiveHeal = 0;
  protected totalDamage = 0;

  protected eventsByCast: { [key: number]: number | null } = {};

  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected spellCoefficients!: SpellCoefficients;

  protected name: string;
  protected item: Item | undefined;
  protected spellID: number;
  protected itemID: number;
  protected cooldown: number;
  protected bonusHealing: number;
  protected bonusSpellpower: number;

  constructor(options: Options) {
    super(options);

    this.name = options.name as string;
    this.spellID = options.spellID as number;
    this.itemID = options.itemID as number;
    this.cooldown = options.cooldown as number;
    this.bonusHealing = options.bonusHealing as number;
    this.bonusSpellpower = options.bonusSpellpower as number;

    this.active = this.selectedCombatant.hasTrinket(this.itemID);
    if (!this.active) {
      return;
    }

    this.item = this.selectedCombatant.getItem(this.itemID);

    (options.buffs as Buffs).add({
      spellId: this.spellID,
      timelineHighlight: true,
    });

    (options.abilities as Abilities).add({
      spell: this.spellID,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: this.cooldown,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER_PET), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onCast(event: CastEvent) {
    const ability = this.abilities.getAbility(event.ability.guid);
    const abilityId = ability?.primarySpell;
    if (!abilityId) {
      this.warn(`Could not find spell ${event.ability.name} [${event.ability.guid}].`);
      return;
    }

    if (!this.selectedCombatant.hasBuff(this.spellID, event.timestamp)) {
      this.eventsByCast[abilityId] = null;
      return;
    }

    this.log(`${formatMilliseconds(event.timestamp)}: Cast ${event.ability.name}`);

    this.eventsByCast[abilityId] = 0;
  }

  onHeal(event: HealEvent | AbsorbedEvent) {
    const ability = this.abilities.getAbility(event.ability.guid);
    const abilityId = ability?.primarySpell;
    if (!abilityId) {
      this.warn(`Could not find spell ${event.ability.name} [${event.ability.guid}].`);
      return;
    }

    let eventCount = this.eventsByCast[abilityId];
    if (eventCount === null || eventCount === undefined) {
      return;
    }

    eventCount = eventCount + 1;
    this.eventsByCast[abilityId] = eventCount;

    const spellCoefficient = this.spellCoefficients.bySpellID(
      event.ability.guid,
      event.targetID,
      event.timestamp,
      eventCount,
    );

    let healingContribution = Math.round(spellCoefficient * this.bonusHealing);

    if (event.type === EventType.Heal && event.hitType === HIT_TYPES.CRIT) {
      healingContribution = healingContribution * 2;
    }

    this.totalHeal = this.totalHeal + healingContribution;

    this.log(
      `${formatMilliseconds(event.timestamp)}: ${healingContribution} healing from ${
        event.ability.name
      } (${event.ability.guid}) [${eventCount}].`,
    );

    if (event.type === EventType.Heal && event.overheal) {
      healingContribution = Math.max(0, healingContribution - event.overheal);
    }

    this.effectiveHeal = this.effectiveHeal + healingContribution;
  }

  onDamage(event: DamageEvent) {
    const ability = this.abilities.getAbility(event.ability.guid);
    const abilityId = ability?.primarySpell;
    if (!abilityId) {
      this.warn(`Could not find spell ${event.ability.name} [${event.ability.guid}].`);
      return;
    }

    let eventCount = this.eventsByCast[abilityId];
    if (eventCount === null) {
      return;
    }

    eventCount = eventCount + 1;
    this.eventsByCast[abilityId] = eventCount;

    const spellCoefficient = this.spellCoefficients.bySpellID(
      event.ability.guid,
      event.targetID,
      event.timestamp,
      eventCount,
    );

    if (spellCoefficient === 0) {
      this.warn(
        `Could not find spell coefficient for ${event.ability.name} [${event.ability.guid}].`,
      );
    }

    const damageContribution = Math.round(spellCoefficient * this.bonusSpellpower);

    this.log(
      `${formatMilliseconds(event.timestamp)}: ${damageContribution} damage from ${
        event.ability.name
      } [${eventCount}].`,
    );

    this.totalDamage = this.totalDamage + damageContribution;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(this.spellID) / this.owner.fightDuration;
  }

  get healAmount() {
    return this.totalHeal;
  }

  get effectiveHealAmount() {
    return this.effectiveHeal;
  }

  get damageAmount() {
    return this.totalDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <p>
              This is the on-use contribution from the trinket on top of your regular
              healing/damage.
            </p>
            {this.healAmount > 0 && (
              <>
                <p>
                  Any overhealing done will be removed from the amount provided by the trinket (as
                  that is additional healing that wouldn't normally be present).
                </p>
                <p>
                  Use of this trinket added an additional raw{' '}
                  <strong>{formatNumber(this.healAmount)}</strong> healing, of which{' '}
                  <strong>{formatNumber(this.effectiveHealAmount)}</strong> was not lost to
                  overheal.
                </p>
              </>
            )}
            {this.damageAmount > 0 && (
              <p>
                Use of this trinket added an additional{' '}
                <strong>{formatNumber(this.damageAmount)}</strong> damage.
              </p>
            )}
          </>
        }
      >
        <BoringValue
          label={
            <ItemLink id={this.itemID} icon={false}>
              <Icon icon={this.item?.icon} /> {this.name}
            </ItemLink>
          }
        >
          {/* <Haste /> {formatPercentage(this.hastePercentGained * this.uptime)}%{' '}
          <small>average Haste</small>
          <br /> */}
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
          {this.healAmount > 0 && (
            <>
              <br />
              <ItemHealingDone amount={this.effectiveHealAmount} />
            </>
          )}
          {this.damageAmount > 0 && (
            <>
              <br />
              <ItemDamageDone amount={this.damageAmount} />
            </>
          )}
        </BoringValue>
      </Statistic>
    );
  }
}

export default ThroughputTrinket;
