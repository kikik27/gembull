"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { waitlistRequestSchema, type WaitlistRequest } from "@/schemas/waitlist";
import { getWaitlistStatus, joinWaitlist } from "@/services/waitlist-service";
import { BrandMark } from "./brand-mark";

const TELEGRAM_COMMUNITY_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL || "https://t.me/+Yxk2dzpzbtAzYTA1";

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
    </svg>
  );
}

type Props = {
  accountId?: string | null;
  network?: string | null;
  signIn: () => void;
};

export function WaitlistSection({ accountId, network, signIn }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<WaitlistRequest>({
    resolver: zodResolver(waitlistRequestSchema),
    defaultValues: { accountId: "", telegram: "", website: "" },
  });
  const { setValue } = form;
  const connectedTestnet = network === "testnet" && Boolean(accountId);

  useEffect(() => {
    setValue("accountId", connectedTestnet ? accountId ?? "" : "");
  }, [accountId, connectedTestnet, setValue]);

  const status = useQuery({
    queryKey: ["waitlist", accountId],
    queryFn: () => getWaitlistStatus(connectedTestnet ? accountId ?? undefined : undefined),
    enabled: open,
    retry: false,
  });
  const join = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["waitlist", accountId] });
    },
  });

  return (
    <div className="w-full" id="waitlist">
      <Button
        className="btn btn-quiet btn-block"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Users aria-hidden="true" size={17} />
        Join Community & Claim GEMBULL
        <ArrowUpRight aria-hidden="true" size={17} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[440px] w-[calc(100%-2rem)] rounded-2xl border border-[#2b382e] bg-[#101611] p-6 text-[#f4f7f2] shadow-2xl sm:max-w-[440px] gap-5"
          overlayClassName="bg-black/80 backdrop-blur-md"
        >
          <DialogHeader className="gap-2 text-left pr-6">
            <div className="flex items-center gap-3 mb-1">
              <BrandMark size={34} />
              <span className="tag tag-dot">TESTNET · 5,000 GEMBULL</span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              Join the Herd.
            </DialogTitle>
            <DialogDescription className="text-sm text-[#a4aea6] leading-relaxed">
              Join the official GemBull Telegram group & submit your wallet to claim 5,000 Testnet GEMBULL for the daily ritual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 min-h-[60px]">
            {status.isPending ? (
              <p className="text-sm text-[#a4aea6] py-2">Checking request status…</p>
            ) : connectedTestnet && status.data?.joined ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-200">
                <CheckCircle2 aria-hidden="true" size={24} className="shrink-0 text-emerald-400 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <strong className="text-sm font-bold text-white">You’re in the queue!</strong>
                  <p className="text-xs text-[#a4aea6] leading-relaxed m-0">
                    <span className="font-mono text-emerald-300">{accountId}</span> is recorded. Our team reviews community membership and distributes test GEMBULL shortly.
                  </p>
                </div>
              </div>
            ) : !connectedTestnet ? (
              <div className="flex flex-col gap-3 py-2 text-center">
                {accountId && network !== "testnet" ? (
                  <p className="text-xs text-rose-400 font-medium">Switch your wallet to NEAR Testnet first.</p>
                ) : (
                  <>
                    <p className="text-sm text-[#a4aea6]">
                      Connect your NEAR Testnet wallet first to automatically verify your account ID.
                    </p>
                    <Button
                      className="btn btn-lime btn-block h-11 w-full text-sm font-bold cursor-pointer"
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        signIn();
                      }}
                    >
                      Connect wallet <ArrowUpRight aria-hidden="true" size={17} />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Step 1: Telegram Community Card */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#a4aea6]">
                    <span>Step 1 · Join Community</span>
                    <div className="h-[1px] flex-1 bg-[#2b382e]" />
                  </div>
                  <div className="flex flex-col gap-3 rounded-2xl border border-[#229ed9]/30 bg-gradient-to-br from-[#229ed9]/15 via-[#151e18] to-[#101611] p-4 shadow-lg shadow-black/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#229ed9] text-white shadow-md shadow-[#229ed9]/30">
                        <TelegramIcon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-bold text-white tracking-tight m-0">
                          GemBull Telegram Group
                        </h4>
                        <p className="text-xs text-[#a4aea6] leading-snug m-0 mt-0.5">
                          Official community for daily ritual alerts & alpha
                        </p>
                      </div>
                    </div>
                    <a
                      href={TELEGRAM_COMMUNITY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#229ed9] hover:bg-[#2ab2f3] active:scale-[0.99] py-3 px-4 text-sm font-bold text-white shadow-md shadow-[#229ed9]/25 transition-all cursor-pointer no-underline"
                    >
                      <span>Join Telegram Group</span>
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </div>
                </div>

                {/* Step 2: Distribution Form */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#a4aea6]">
                    <span>Step 2 · Submit Your Account</span>
                    <div className="h-[1px] flex-1 bg-[#2b382e]" />
                  </div>
                  <form
                    className="flex flex-col gap-3.5"
                    onSubmit={form.handleSubmit((value) => join.mutate(value))}
                  >
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="waitlist-account-display" className="text-xs font-semibold text-[#f4f7f2]">
                        NEAR Testnet Wallet
                      </label>
                      <div
                        className="flex items-center justify-between rounded-xl border border-[#2b382e] bg-[#151e18] px-3.5 py-2.5 font-mono text-sm text-[#f4f7f2]"
                        id="waitlist-account-display"
                      >
                        <span className="truncate">{accountId}</span>
                        <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#123b27] border border-[#00b85a]/30 px-2 py-0.5 text-[11px] font-bold text-[#00b85a]">
                          <ShieldCheck size={13} />
                          Connected
                        </span>
                      </div>
                      <input type="hidden" {...form.register("accountId")} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="waitlist-telegram" className="text-xs font-semibold text-[#f4f7f2]">
                        Your Telegram Username
                      </label>
                      <Input
                        id="waitlist-telegram"
                        className="h-11 rounded-xl border-[#435246] bg-[#151e18] px-3.5 text-sm text-white placeholder:text-[#78847b] focus-visible:border-[#b7ff16] focus-visible:ring-1 focus-visible:ring-[#b7ff16]"
                        placeholder="@username"
                        aria-invalid={Boolean(form.formState.errors.telegram)}
                        {...form.register("telegram")}
                      />
                      {form.formState.errors.telegram && (
                        <p className="text-xs text-rose-400 m-0" role="alert">
                          {form.formState.errors.telegram.message}
                        </p>
                      )}
                    </div>

                    <div className="absolute w-[1px] h-[1px] overflow-hidden whitespace-nowrap" aria-hidden="true">
                      <label htmlFor="waitlist-website">Website</label>
                      <Input
                        id="waitlist-website"
                        tabIndex={-1}
                        autoComplete="off"
                        {...form.register("website")}
                      />
                    </div>

                    <Button
                      className="btn btn-lime btn-block h-12 w-full text-sm font-bold cursor-pointer mt-1"
                      type="submit"
                      disabled={join.isPending}
                    >
                      {join.isPending ? "Submitting request…" : "Claim 5,000 GEMBULL"}
                      {!join.isPending && <ArrowUpRight aria-hidden="true" size={17} />}
                    </Button>
                    {join.isError && (
                      <p className="text-xs text-rose-400 m-0" role="alert">
                        {join.error instanceof Error ? join.error.message : "Request failed. Try again."}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>

          <p className="border-t border-[#2b382e] pt-3 text-[11px] text-[#78847b] leading-relaxed m-0">
            Community testnet faucet · manual review via Telegram admin bot · 5,000 GEMBULL per tester.
            Never share your seed phrase or private key.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
