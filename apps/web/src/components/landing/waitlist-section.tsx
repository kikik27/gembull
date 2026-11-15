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
    <div className="rc-waitlist-action" id="waitlist">
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
          className="waitlist-dialog"
          overlayClassName="waitlist-dialog-overlay"
        >
          <DialogHeader className="waitlist-dialog-header">
            <div className="waitlist-dialog-brand">
              <BrandMark size={34} />
              <span className="tag tag-dot">NEAR TESTNET · 5,000 GEMBULL</span>
            </div>
            <DialogTitle>Join the Herd.</DialogTitle>
            <DialogDescription>
              Join the official GemBull Telegram group & submit your wallet to claim 5,000 Testnet GEMBULL for the daily ritual.
            </DialogDescription>
          </DialogHeader>

          <div className="waitlist-dialog-body">
            {status.isPending ? (
              <p className="waitlist-dialog-status" role="status">Checking request status…</p>
            ) : connectedTestnet && status.data?.joined ? (
              <div className="waitlist-dialog-joined" role="status">
                <CheckCircle2 aria-hidden="true" size={24} />
                <div>
                  <strong>You’re in the queue!</strong>
                  <p>
                    {accountId} is recorded. Our team reviews community membership and distributes test GEMBULL shortly.
                  </p>
                </div>
              </div>
            ) : !connectedTestnet ? (
              <div className="waitlist-dialog-connect">
                {accountId && network !== "testnet" ? (
                  <p className="waitlist-dialog-error">Switch your wallet to NEAR Testnet first.</p>
                ) : (
                  <>
                    <p>Connect your NEAR Testnet wallet first to automatically verify your account ID.</p>
                    <Button
                      className="btn btn-lime btn-block"
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
              <div className="waitlist-content-flow">
                {/* Step 1: Telegram Community */}
                <div className="waitlist-step-group">
                  <div className="waitlist-step-label">Step 1 · Join Community</div>
                  <div className="waitlist-tg-card">
                    <div className="waitlist-tg-header">
                      <div className="waitlist-tg-icon-wrap">
                        <TelegramIcon size={22} />
                      </div>
                      <div className="waitlist-tg-titles">
                        <h4 className="waitlist-tg-title">GemBull Telegram Group</h4>
                        <p className="waitlist-tg-sub">
                          Official group for community chats, updates, and daily ritual alerts
                        </p>
                      </div>
                    </div>
                    <a
                      href={TELEGRAM_COMMUNITY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="waitlist-tg-btn"
                    >
                      <span>Join Telegram Group</span>
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </div>
                </div>

                {/* Step 2: Distribution Form */}
                <div className="waitlist-step-group">
                  <div className="waitlist-step-label">Step 2 · Submit Your Account</div>
                  <form
                    className="waitlist-dialog-form"
                    onSubmit={form.handleSubmit((value) => join.mutate(value))}
                  >
                    <div className="waitlist-input-group">
                      <label htmlFor="waitlist-account-display">NEAR Testnet Wallet</label>
                      <div className="waitlist-account-readonly" id="waitlist-account-display">
                        <span>{accountId}</span>
                        <span className="waitlist-account-tag">
                          <ShieldCheck size={13} className="inline mr-1" />
                          Connected
                        </span>
                      </div>
                      <input type="hidden" {...form.register("accountId")} />
                    </div>

                    <div className="waitlist-input-group">
                      <label htmlFor="waitlist-telegram">Your Telegram Username</label>
                      <Input
                        id="waitlist-telegram"
                        className="waitlist-dialog-input"
                        placeholder="@username"
                        aria-invalid={Boolean(form.formState.errors.telegram)}
                        {...form.register("telegram")}
                      />
                      {form.formState.errors.telegram && (
                        <p className="waitlist-dialog-error" role="alert">
                          {form.formState.errors.telegram.message}
                        </p>
                      )}
                    </div>

                    <div className="waitlist-dialog-honeypot" aria-hidden="true">
                      <label htmlFor="waitlist-website">Website</label>
                      <Input
                        id="waitlist-website"
                        tabIndex={-1}
                        autoComplete="off"
                        {...form.register("website")}
                      />
                    </div>

                    <Button className="btn btn-lime btn-block" type="submit" disabled={join.isPending}>
                      {join.isPending ? "Submitting request…" : "Claim 5,000 GEMBULL"}
                      {!join.isPending && <ArrowUpRight aria-hidden="true" size={17} />}
                    </Button>
                    {join.isError && (
                      <p className="waitlist-dialog-error" role="alert">
                        {join.error instanceof Error ? join.error.message : "Request failed. Try again."}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>

          <p className="waitlist-dialog-disclosure">
            Community testnet faucet · manual review via Telegram admin bot · 5,000 GEMBULL per tester.
            Never share your seed phrase or private key.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
