"use client";

import { RITUAL_CONTRACT_ID as CONTRACT_ID } from "@/constants/ritual";
import { useRitualActions } from "@/hooks/use-ritual-actions";
import { useRitualData } from "@/hooks/use-ritual-data";
import { PROPOSED_TREASURY, resolveRules } from "@/lib/ritual-params";
import { useRitualUiStore } from "@/stores/ritual-ui-store";
import { ClosingSection } from "@/components/landing/closing-section";
import { Hero } from "@/components/landing/hero";
import { HistorySection } from "@/components/landing/history-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RitualCalculator } from "@/components/landing/ritual-calculator";
import { RitualSection } from "@/components/landing/ritual-section";
import { RulesSection } from "@/components/landing/rules-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { SupplySection } from "@/components/landing/supply-section";
import { TickerTape } from "@/components/landing/ticker-tape";
import { VaultSection } from "@/components/landing/vault-section";

export default function Home() {
  const {
    loading: walletLoading,
    signedAccountId,
    network,
    signIn,
    signOut,
    act,
  } = useRitualActions();
  const {
    historyLimit,
    showOlder,
    showThroughDay,
    busyAction: busy,
    actionError,
    notice,
  } = useRitualUiStore();
  const data = useRitualData(signedAccountId, historyLimit);
  const {
    rules,
    global,
    today,
    account,
    balance,
    registered,
    storageMin,
    history,
  } = data;
  const error = actionError ?? data.error;
  const explorer = CONTRACT_ID
    ? `https://testnet.nearblocks.io/address/${encodeURIComponent(CONTRACT_ID)}`
    : "";
  const resolved = resolveRules(rules);
  const treasury = global
    ? BigInt(global.ritual_treasury_balance)
    : PROPOSED_TREASURY;

  return (
    <div className="site">
      <SiteHeader
        accountId={signedAccountId}
        loading={walletLoading}
        signIn={signIn}
        signOut={signOut}
      />
      <TickerTape resolved={resolved} />

      <main>
        <Hero resolved={resolved} />
        <RitualSection
          rules={rules}
          resolved={resolved}
          global={global}
          today={today}
          account={account}
          accountId={signedAccountId}
          network={network}
          balance={balance}
          registered={registered}
          storageMin={storageMin}
          busy={busy}
          error={error}
          notice={notice}
          loading={data.isLoading}
          act={act}
        />
        <HowItWorks resolved={resolved} />
        <RitualCalculator
          resolved={resolved}
          treasury={treasury}
          treasuryIsLive={Boolean(global)}
        />
        <SupplySection global={global} resolved={resolved} />
        <HistorySection
          rows={history}
          lastDay={global?.last_finalized_day}
          historyLimit={historyLimit}
          rewardPerCheckin={rules?.reward_per_checkin}
          busy={Boolean(busy)}
          explorer={explorer}
          loading={data.isLoading}
          onClaim={(dayId) =>
            act({
              label: `Claim day ${dayId}`,
              method: "claim_reward",
              args: { day_id: dayId },
            })
          }
          onShowOlder={showOlder}
          onJumpToDay={(dayId) => {
            if (global?.last_finalized_day != null)
              showThroughDay(global.last_finalized_day, dayId);
          }}
        />
        <RulesSection resolved={resolved} />
        <VaultSection />
        <ClosingSection />
      </main>
      <SiteFooter explorer={explorer} />
    </div>
  );
}
