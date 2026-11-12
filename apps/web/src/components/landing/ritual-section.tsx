"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RITUAL_CONTRACT_ID } from "@/constants/ritual";
import type { RitualAction } from "@/hooks/use-ritual-actions";
import { epochCountdown, formatRitl } from "@/lib/ritual-format";
import type { ResolvedRules } from "@/lib/ritual-params";
import type {
  AccountStatus,
  Epoch,
  GlobalState,
  Rules,
} from "@/schemas/ritual";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

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
  busy: string | null;
  error: string | null;
  notice: string | null;
  loading: boolean;
  act: (action: RitualAction) => void;
};

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

  return (
    <section
      className="section field-ground"
      id="ritual"
      aria-labelledby="ritual-title"
    >
      <div className="frame">
        <SectionHead
          title={<span id="ritual-title">Show up. Move the supply.</span>}
          aside="Today’s epoch, read straight from the contract. Participation is the number that matters here, not a price."
        />

        {!RITUAL_CONTRACT_ID && (
          <div className="notice">
            <strong>LOCAL PREVIEW</strong>
            <span>
              Set <code>NEXT_PUBLIC_RITL_CONTRACT_ID</code> to a reviewed NEAR
              Testnet deployment to load live on-chain data. No contract is
              configured in this local build.
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

        <div className="ritual-grid">
          <Reveal className="board">
            <div className="board-top">
              <span className="epoch">
                <Image
                  src="/brand/icons/icon-daily-checkin-256.png"
                  width={40}
                  height={40}
                  alt=""
                />
                Current epoch · Day {global?.current_day_id ?? "—"}
              </span>
              <span
                className={`tag ${RITUAL_CONTRACT_ID ? "tag-live" : ""} tag-dot`}
              >
                {RITUAL_CONTRACT_ID ? "Testnet" : "Preview"}
              </span>
            </div>
            <div>
              <div className="board-count">
                {today?.checkin_count ?? "—"}
                <span>/ {shown.daily_target}</span>
              </div>
              <p className="board-caption">eligible accounts checked in</p>
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
            <div className="board-meta">
              <div>
                <span>Time remaining · estimate</span>
                <strong className="countdown">{timeLabel}</strong>
              </div>
              <div>
                <span>Your balance</span>
                <strong>
                  {formatRitl(balance)}
                  <small>RITL</small>
                </strong>
              </div>
            </div>
            <div className="board-actions">
              {accountId && registered === false && (
                <Button
                  className="btn btn-quiet btn-block"
                  disabled={Boolean(busy) || !storageMin}
                  onClick={() =>
                    act({
                      label: "Storage registration",
                      method: "storage_deposit",
                      args: { account_id: accountId, registration_only: true },
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
                onClick={() => act({ label: "Check-in", method: "check_in" })}
              >
                {checkInLabel}
                {!account?.checked_in && accountId && busy !== "Check-in" ? (
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                ) : null}
              </Button>
              {awaitingSettlement && global && (
                <Button
                  className="btn btn-quiet btn-block"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    act({
                      label: "Epoch settlement",
                      method: "finalize_day",
                      args: { day_id: (global.last_finalized_day ?? -1) + 1 },
                    })
                  }
                >
                  Settle day {(global.last_finalized_day ?? -1) + 1}{" "}
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </Button>
              )}
              <p className="board-help">
                Minimum {formatRitl(shown.min_holding)} RITL at check-in. One
                check-in per account per epoch. Ritual writes attach 0.05
                Testnet NEAR for contract storage; excess remains with the
                contract.
              </p>
            </div>
          </Reveal>

          <div className="ritual-side">
            <Reveal className="streak-card" delay={0.1}>
              <div className="card-title">
                <Image
                  src="/brand/icons/icon-longest-streak-256.png"
                  width={44}
                  height={44}
                  alt=""
                />
                The streak
              </div>
              <div className="streak-value">
                {global?.current_streak ?? "—"}
                <span>days</span>
              </div>
              <p>
                Consecutive successful epochs. A missed day resets the count.
              </p>
              <div className="streak-record">
                <span>Longest streak</span>
                <strong>{global?.longest_streak ?? "—"} days</strong>
              </div>
            </Reveal>
            <Reveal className="reward-card" delay={0.18}>
              <div className="card-title">
                <Image
                  src="/brand/icons/icon-community-256.png"
                  width={44}
                  height={44}
                  alt=""
                />
                Reward per successful check-in
              </div>
              <div className="reward-value">
                {formatRitl(shown.reward_per_checkin)}
                <span>RITL</span>
              </div>
              <p>
                Claim after a successful epoch is finalized. No automatic bulk
                mint.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
