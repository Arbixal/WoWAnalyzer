import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic';
import { SpellLink } from 'interface';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  BeginCastEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class Eclipse extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  constructor(options: Options) {
    super(options);

    this.active = true;

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell([SPELLS.ECLIPSE_SOLAR, SPELLS.ECLIPSE_LUNAR]),
      this.onEclipseApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell([SPELLS.ECLIPSE_SOLAR, SPELLS.ECLIPSE_LUNAR]),
      this.onEclipseRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.onBeginCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  cast: number = -1;
  eclipseProcs: EclipseProc[] = [];

  onEclipseApply(event: ApplyBuffEvent) {
    this.cast = this.eclipseProcs.length;
    this.eclipseProcs[this.cast] = {
      start: event.timestamp,
      end: Math.min(event.timestamp + 15000, this.owner.fight.end_time),
      spellId: event.ability.guid,
      badCasts: 0,
      totalDamage: 0,
    };
  }

  onEclipseRemove(event: RemoveBuffEvent) {
    this.eclipseProcs[this.cast].end = event.timestamp;
    this.cast = -1;
  }

  onBeginCast(event: BeginCastEvent) {
    if (this.cast === -1) {
      return;
    }

    if (
      this.eclipseProcs[this.cast].spellId === SPELLS.ECLIPSE_SOLAR.id &&
      event.ability.guid === SPELLS.STARFIRE.id
    ) {
      this.eclipseProcs[this.cast].badCasts += 1;
      const castEvent = event.castEvent;
      if (castEvent) {
        castEvent.meta = castEvent.meta || {};
        castEvent.meta.isInefficientCast = true;
        castEvent.meta.inefficientCastReason = (
          <>
            <SpellLink id={SPELLS.WRATH} /> has higher crit chance during{' '}
            <SpellLink id={SPELLS.ECLIPSE_SOLAR} />.
          </>
        );
      }
    }

    if (
      this.eclipseProcs[this.cast].spellId === SPELLS.ECLIPSE_LUNAR.id &&
      event.ability.guid === SPELLS.WRATH.id
    ) {
      this.eclipseProcs[this.cast].badCasts += 1;
      const castEvent = event.castEvent;
      if (castEvent) {
        castEvent.meta = castEvent.meta || {};
        castEvent.meta.isInefficientCast = true;
        castEvent.meta.inefficientCastReason = (
          <>
            <SpellLink id={SPELLS.STARFIRE} /> has higher crit chance during{' '}
            <SpellLink id={SPELLS.ECLIPSE_LUNAR} />.
          </>
        );
      }
    }
  }

  onCast(event: CastEvent) {
    if (
      this.cast === -1 ||
      event.ability.guid === SPELLS.ECLIPSE_SOLAR.id ||
      event.ability.guid === SPELLS.ECLIPSE_LUNAR.id
    ) {
      return;
    }

    if (event.ability.guid === 53908) {
      if (this.eclipseProcs[this.cast].spellId === SPELLS.ECLIPSE_LUNAR.id) {
        event.meta = event.meta || {};
        event.meta.isEnhancedCast = true;
        event.meta.enhancedCastReason = (
          <>
            During <SpellLink id={SPELLS.ECLIPSE_LUNAR} /> is the best time to use haste increasing
            items.
          </>
        );
      } else {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = (
          <>
            <SpellLink id={53908} /> is mostly wasted on <SpellLink id={SPELLS.ECLIPSE_SOLAR} /> as{' '}
            <SpellLink id={SPELLS.WRATH} /> is almost haste capped already.
          </>
        );
      }
    }

    if (event.ability.guid === SPELLS.HYPERSPEED_ACCELERATION.id) {
      if (this.eclipseProcs[this.cast].spellId === SPELLS.ECLIPSE_LUNAR.id) {
        event.meta = event.meta || {};
        event.meta.isEnhancedCast = true;
        event.meta.enhancedCastReason = (
          <>
            During <SpellLink id={SPELLS.ECLIPSE_LUNAR} /> is the best time to use haste increasing
            items.
          </>
        );
      } else {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = (
          <>
            <SpellLink id={SPELLS.HYPERSPEED_ACCELERATION.id} /> is mostly wasted on{' '}
            <SpellLink id={SPELLS.ECLIPSE_SOLAR} /> as <SpellLink id={SPELLS.WRATH} /> is almost
            haste capped already.
          </>
        );
      }
    }

    /* if (this.eclipseProcs[this.cast].spellId === SPELLS.ECLIPSE_SOLAR.id && event.ability.guid === SPELLS.STARFIRE.id) {
      this.eclipseProcs[this.cast].badCasts += 1;
      event.meta = event.meta || {}
      event.meta.isInefficientCast= true;
      event.meta.inefficientCastReason= <><SpellLink id={SPELLS.WRATH} /> has higher crit chance during <SpellLink id={SPELLS.ECLIPSE_SOLAR} />.</>;
    }

    if (this.eclipseProcs[this.cast].spellId === SPELLS.ECLIPSE_LUNAR.id && event.ability.guid === SPELLS.WRATH.id) {
      this.eclipseProcs[this.cast].badCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = <><SpellLink id={SPELLS.STARFIRE} /> has higher crit chance during <SpellLink id={SPELLS.ECLIPSE_LUNAR} />.</>;
    }  */
    //this.eclipseProcs[this.cast].casts.push(event);
  }

  onDamage(event: DamageEvent) {
    if (this.cast === -1) {
      return;
    }

    this.eclipseProcs[this.cast].totalDamage += event.amount;
  }

  get eclipseEvents(): EclipseProc[] {
    return this.eclipseProcs;
  }

  get eclipsePerformance(): BoxRowEntry[] {
    return this.eclipseProcs.map((proc) => {
      let performance = QualitativePerformance.Ok;
      if (proc.badCasts === 0) {
        performance = QualitativePerformance.Good;
      }

      if (proc.badCasts > 1) {
        performance = QualitativePerformance.Fail;
      }

      return {
        value: performance,
        tooltip: (
          <>
            @ {this.owner.formatTimestamp(proc.start)}
            <SpellLink id={proc.spellId} /> ({formatNumber(proc.totalDamage)} damage)
          </>
        ),
      };
    });
  }
}

export default Eclipse;

export interface EclipseProc {
  start: number;
  end: number;
  spellId: number;
  totalDamage: number;
  badCasts: number;
}
