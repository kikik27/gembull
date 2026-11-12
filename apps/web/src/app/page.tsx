"use client";

import { RITUAL_CONTRACT_ID as CONTRACT_ID } from "@/constants/ritual";
import { useRitualActions } from "@/hooks/use-ritual-actions";
import { useRitualData } from "@/hooks/use-ritual-data";
import { useTransactionSync } from "@/hooks/use-transaction-sync";
import { PROPOSED_TREASURY, resolveRules } from "@/lib/ritual-params";
import { useRitualUiStore } from "@/stores/ritual-ui-store";
import { ToastContainer } from "@/components/ui/toast-container";
import { EndSection } from "@/components/landing/closing-section";
import { Hero } from "@/components/landing/hero";
import { HistorySection } from "@/components/landing/history-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RitualCalculator } from "@/components/landing/ritual-calculator";
import { RitualSection } from "@/components/landing/ritual-section";
import { RolesSection } from "@/components/landing/roles-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { RulesSection } from "@/components/landing/rules-section";
import { SiteHeader } from "@/components/landing/site-header";
import { StickerPackSection } from "@/components/landing/sticker-pack-section";
import { SupplySection } from "@/components/landing/supply-section";
import { VaultSection } from "@/components/landing/vault-section";
import { SceneStack } from "@/components/scene/scene-stack";

export default function Home() {
  const {
    loading: walletLoading,
    signedAccountId,
    network,
    signIn,
    signOut,
    act,
  } = useRitualActions();
  useTransactionSync();
  const {
    historyLimit,
    showOlder,
    showThroughDay,
    busyAction: busy,
    actionError,
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
      <ToastContainer />
      <SceneStack />
      <SiteHeader
        accountId={signedAccountId}
        loading={walletLoading}
        signIn={signIn}
        signOut={signOut}
      />

      <main className="page">
        <Hero />
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
          history={history}
          busy={busy}
          error={error}
          loading={data.isLoading}
          act={act}
        />
        <HowItWorks resolved={resolved} />
        <RitualCalculator
          resolved={resolved}
          treasury={treasury}
          treasuryIsLive={Boolean(global)}
        />
        <RolesSection />
        <div id="under">
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
          <RoadmapSection />
          <StickerPackSection />
        </div>
        <EndSection explorer={explorer} />
      </main>
    </div>
  );
}
