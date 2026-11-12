"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  Coins,
  Flame,
  FlaskConical,
  History,
  Layers,
  LayoutDashboard,
  Trophy,
  Vault,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RITUAL_CONTRACT_ID } from "@/constants/ritual";
import type { RitualAction } from "@/hooks/use-ritual-actions";
import { epochCountdown, formatRitl, shortAccount } from "@/lib/ritual-format";
import {
  bpsToPercent,
  epochHours,
  type ResolvedRules,
} from "@/lib/ritual-params";
import type {
  AccountStatus,
  Epoch,
  GlobalState,
  HistoryRow,
  Rules,
} from "@/schemas/ritual";
import { BrandMark } from "./brand-mark";
import { EpochBars, OutcomeMix } from "./dashboard-charts";
import { Reveal } from "./reveal";

type Props = {
  /** Live get_rules() output; undefined until a configured contract answers. Gates every write. */
  rules?: Rules;
  /** Live-or-proposed rules, used for display only. */
  resolved: ResolvedRules;
  global?: GlobalState;
  today?: Epoch;
  account?: AccountStatus;
  accountId?: string | null;
  network?: string | null;
  balance?: string | null;
  registered: boolean | null;
  storageMin?: string;
  history: HistoryRow[];
  busy: string | null;
  error: string | null;
  notice: string | null;
  loading: boolean;
  act: (action: RitualAction) => void;
};

type SideItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
};

const sidebar: Array<{ group: string; items: SideItem[] }> = [
  {
    group: "Workspace",
    items: [
      { href: "#dash", label: "Ritual", icon: LayoutDashboard, active: true },
      { href: "#history", label: "Epoch history", icon: History },
      { href: "#treasury", label: "Supply", icon: Layers },
      { href: "#rules", label: "Rules", icon: BookOpen },
    ],
  },
  {
    group: "Library",
    items: [
      { href: "#calculator", label: "Calculator", icon: FlaskConical },
      { href: "#vault", label: "Stock vault", icon: Vault, badge: "SIM" },
    ],
  },
];

export function RitualSection({
  rules,
  resolved,
  global,
  today,
  account,
  accountId,
  network,
  balance,
  registered,
  storageMin,
  history,
  busy,
  error,
  notice,
  loading,
  act,
}: Props) {
  const [nowMs, setNowMs] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const shown = resolved.rules;
  const progress =
    rules && today && rules.daily_target > 0
      ? Math.min(100, (today.checkin_count / rules.daily_target) * 100)
      : 0;
  const canCheckIn = Boolean(
    accountId &&
    network === "testnet" &&
    registered &&
    account &&
    !account.checked_in &&
    balance &&
    rules &&
    BigInt(balance) >= BigInt(rules.min_holding) &&
    today &&
    today.checkin_count < rules.max_participants &&
    global &&
    !global.ritual_ended &&
    global.current_day_id === (global.last_finalized_day ?? -1) + 1,
  );
  const awaitingSettlement = Boolean(
    global && global.current_day_id > (global.last_finalized_day ?? -1) + 1,
  );
  const timeLabel = useMemo(
    () =>
      rules && global && nowMs
        ? epochCountdown(
            global.launch_timestamp_ns,
            rules.epoch_duration_ns,
            global.current_day_id,
            nowMs,
          )
        : "—",
    [rules, global, nowMs],
  );

  const checkInLabel =
    busy === "Check-in"
      ? "Waiting for wallet…"
      : account?.checked_in
        ? "Checked in for this epoch ✓"
        : !accountId
          ? "Connect wallet to check in"
          : "Check in now";

  const stats = [
    {
      value: String(shown.daily_target),
      caption: ["check-ins needed", "for a successful day"],
    },
    {
      value: `${epochHours(shown)}h`,
      caption: ["fixed epoch length", "set by the contract"],
    },
    {
      value: formatRitl(shown.reward_per_checkin, 0),
      unit: "GEMBULL",
      caption: ["minted per participant", "after a successful epoch"],
    },
    {
      value: bpsToPercent(shown.treasury_burn_bps),
      caption: ["of the ritual treasury", "burned on a missed day"],
    },
  ];

  return (
    <section className="studio" id="ritual" aria-labelledby="ritual-title">
      <div className="studio-head">
        <Reveal>
          <span className="tag tag-dot">Daily ritual</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="h2" id="ritual-title">
            The memecoin where <em>showing up</em>
            <br />
            sets the supply.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede">
            Check in once per epoch. Hit the target and everyone who showed up
            claims a reward. Miss it and the contract burns part of the ritual
            treasury. No admin can change the numbers.
          </p>
        </Reveal>
        <Reveal className="studio-actions" delay={0.15}>
          <a className="btn btn-lime" href="#dash">
            Check in today <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          <a className="btn btn-ghost" href="#rules">
            Read the rules
          </a>
        </Reveal>
      </div>

      <Reveal className="stats" delay={0.05}>
        <dl className="stats-grid">
          {stats.map((stat) => (
            <div className="stat" key={stat.caption[0]}>
              <dt>
                {stat.caption[0]}
                <br />
                {stat.caption[1]}
              </dt>
              <dd>
                {stat.value}
                {stat.unit ? <small>{stat.unit}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="stats-source">
          <span
            className={`tag ${resolved.isLive ? "tag-live tag-dot" : "tag-sim"}`}
          >
            {resolved.sourceLabel}
          </span>
        </p>
      </Reveal>

      <Reveal className="dash" id="dash" y={40}>
        <div className="dash-bar">
          <span className="dash-brand">
            <BrandMark size={22} />
            GemBull
          </span>
          <span className="dash-crumb">
            Ritual <i>/</i> <b>Day {global?.current_day_id ?? "—"}</b>
          </span>
          <span className="dash-spacer" />
          <span
            className={`tag tag-dot ${RITUAL_CONTRACT_ID ? "tag-live" : ""}`}
          >
            {RITUAL_CONTRACT_ID ? "Testnet" : "Preview"}
          </span>
          <span className="dash-user">
            <Image
              src="/brand/icons/gembull-app-icon.png"
              width={32}
              height={32}
              alt=""
            />
            <span>{accountId ? shortAccount(accountId) : "Not connected"}</span>
          </span>
        </div>

        <div className="dash-body">
          <aside className="dash-side" aria-label="Page sections">
            {sidebar.map((group) => (
              <div key={group.group}>
                <p className="side-group">{group.group}</p>
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="side-item"
                    aria-current={item.active ? "true" : undefined}
                  >
                    <item.icon aria-hidden="true" size={16} />
                    {item.label}
                    {item.badge ? (
                      <span className="side-count">{item.badge}</span>
                    ) : null}
                  </a>
                ))}
              </div>
            ))}
          </aside>

          <div className="dash-main">
            <div className="dash-title">
              <h3>Today’s ritual</h3>
              <span className="tag">
                {today?.status ? today.status.toLowerCase() : "no live data"}
              </span>
            </div>

            {!RITUAL_CONTRACT_ID && (
              <div className="notice">
                <strong>LOCAL PREVIEW</strong>
                <span>
                  Set <code>NEXT_PUBLIC_GEMBULL_CONTRACT_ID</code> to a reviewed
                  NEAR Testnet deployment to load live on-chain data. No
                  contract is configured in this local build.
                </span>
              </div>
            )}
            {loading && (
              <div className="loading-state" role="status">
                <Skeleton className="h-4 w-28" />
                <span>Loading contract state…</span>
              </div>
            )}
            {error && (
              <div className="notice notice-error" role="alert">
                <strong>FAILED</strong>
                <span>{error}</span>
              </div>
            )}
            {notice && (
              <div className="notice notice-success" role="status">
                <strong>CONFIRMED</strong>
                <span>{notice}</span>
              </div>
            )}

            <div className="rc-grid">
              <div className="rc">
                <div className="rc-count-row">
                  <div>
                    <div className="rc-count">
                      {today?.checkin_count ?? "—"}
                      <span>/ {shown.daily_target}</span>
                    </div>
                    <p className="rc-caption">eligible accounts checked in</p>
                  </div>
                  <div className="rc-time">
                    <span>Time remaining · estimate</span>
                    <strong className="countdown tabular">{timeLabel}</strong>
                  </div>
                </div>

                <div>
                  <div
                    className="meter"
                    role="progressbar"
                    aria-valuenow={today?.checkin_count ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={shown.daily_target}
                    aria-label="Daily check-in progress"
                  >
                    <span
                      className="meter-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="meter-foot">
                    <span>
                      {progress >= 100 ? "Target reached" : "Building momentum"}
                    </span>
                    <span>Max {shown.max_participants} participants</span>
                  </div>
                </div>

                <div className="rc-balance">
                  <span>Your balance</span>
                  <strong className="tabular">
                    {formatRitl(balance)}
                    <small>GEMBULL</small>
                  </strong>
                </div>

                <div className="rc-actions">
                  {accountId && registered === false && (
                    <Button
                      className="btn btn-quiet btn-block"
                      disabled={Boolean(busy) || !storageMin}
                      onClick={() =>
                        act({
                          label: "Storage registration",
                          method: "storage_deposit",
                          args: {
                            account_id: accountId,
                            registration_only: true,
                          },
                          deposit: storageMin ?? "0",
                        })
                      }
                    >
                      Register token storage
                    </Button>
                  )}
                  <Button
                    className="btn btn-lime btn-block"
                    disabled={!canCheckIn || Boolean(busy)}
                    onClick={() =>
                      act({ label: "Check-in", method: "check_in" })
                    }
                  >
                    {checkInLabel}
                  </Button>
                  {awaitingSettlement && global && (
                    <Button
                      className="btn btn-quiet btn-block"
                      disabled={Boolean(busy)}
                      onClick={() =>
                        act({
                          label: "Epoch settlement",
                          method: "finalize_day",
                          args: {
                            day_id: (global.last_finalized_day ?? -1) + 1,
                          },
                        })
                      }
                    >
                      Settle day {(global.last_finalized_day ?? -1) + 1}
                    </Button>
                  )}
                  <p className="rc-help">
                    Minimum {formatRitl(shown.min_holding)} GEMBULL at check-in.
                    One check-in per account per epoch. Ritual writes attach
                    0.05 Testnet NEAR for contract storage; excess remains with
                    the contract.
                  </p>
                </div>
              </div>

              <div className="kpis">
                <div className="kpi">
                  <span className="kpi-label">
                    <Flame aria-hidden="true" size={16} /> Current streak
                  </span>
                  <strong className="tabular">
                    {global?.current_streak ?? "—"}
                    <small>days</small>
                  </strong>
                  <p>Consecutive successful epochs. A miss resets it.</p>
                </div>
                <div className="kpi">
                  <span className="kpi-label">
                    <Trophy aria-hidden="true" size={16} /> Longest streak
                  </span>
                  <strong className="tabular">
                    {global?.longest_streak ?? "—"}
                    <small>days</small>
                  </strong>
                  <p>The best run so far, separate from the current one.</p>
                </div>
                <div className="kpi">
                  <span className="kpi-label">
                    <Coins aria-hidden="true" size={16} /> Reward per check-in
                  </span>
                  <strong className="tabular">
                    {formatRitl(shown.reward_per_checkin)}
                    <small>GEMBULL</small>
                  </strong>
                  <p>Claimed after finalization. No bulk mint.</p>
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="pane">
                <div className="pane-head">
                  <span>Check-ins per finalized epoch</span>
                  <span className="pane-legend">
                    <i className="hit" /> Hit <i className="miss" /> Missed
                  </span>
                </div>
                <EpochBars rows={history} target={shown.daily_target} />
              </div>
              <div className="pane">
                <div className="pane-head">
                  <span>Epoch outcomes</span>
                </div>
                <OutcomeMix global={global} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
