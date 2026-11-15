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
          className="waitlist-dialog"
          overlayClassName="waitlist-dialog-overlay"
        >
          <DialogHeader className="waitlist-dialog-header">
            <div className="waitlist-dialog-brand">
              <BrandMark size={36} />
              <span className="tag tag-dot tag-live">TESTNET · 5,000 GEMBULL</span>
            </div>
            <DialogTitle className="waitlist-dialog-title">
              Join the Community
            </DialogTitle>
            <DialogDescription className="waitlist-dialog-desc">
              Join our official GemBull Telegram and claim 5,000 Testnet GEMBULL to test the daily ritual.
            </DialogDescription>
          </DialogHeader>

          <div className="waitlist-dialog-body">
            {status.isPending ? (
              <p className="waitlist-dialog-desc">Checking request status…</p>
            ) : connectedTestnet && status.data?.joined ? (
              <div className="waitlist-dialog-joined">
                <CheckCircle2 aria-hidden="true" size={24} />
                <div>
                  <strong>Request submitted!</strong>
                  <p>
                    <span className="font-mono text-white">{accountId}</span> is recorded. Our Telegram admin bot will distribute 5,000 GEMBULL shortly.
                  </p>
                </div>
              </div>
            ) : !connectedTestnet ? (
              <div className="waitlist-dialog-connect">
                {accountId && network !== "testnet" ? (
                  <p className="waitlist-dialog-error">Switch your wallet to NEAR Testnet first.</p>
                ) : (
                  <>
                    <p>
                      Connect your NEAR Testnet wallet first to automatically verify your account ID and claim tokens.
                    </p>
                    <Button
                      className="btn btn-lime btn-block"
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        signIn();
                      }}
                    >
                      Connect Wallet <ArrowUpRight aria-hidden="true" size={17} />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="waitlist-telegram-banner"
                >
                  <div className="waitlist-telegram-left">
                    <div className="waitlist-telegram-icon">
                      <TelegramIcon size={20} />
                    </div>
                    <div className="waitlist-telegram-meta">
                      <div className="waitlist-telegram-title">Official Telegram Group</div>
                      <div className="waitlist-telegram-sub">Community chat, updates & daily alerts</div>
                    </div>
                  </div>
                  <span className="waitlist-telegram-pill">
                    Join <ArrowUpRight size={13} />
                  </span>
                </a>

                <form
                  className="waitlist-dialog-form"
                  onSubmit={form.handleSubmit((value) => join.mutate(value))}
                >
                  <div className="waitlist-field">
                    <label htmlFor="waitlist-account-display">NEAR Testnet Wallet</label>
                    <div className="waitlist-account-box" id="waitlist-account-display">
                      <span className="waitlist-account-id font-mono">{accountId}</span>
                      <span className="tag tag-dot tag-live waitlist-account-tag">
                        <ShieldCheck size={12} />
                        Connected
                      </span>
                    </div>
                    <input type="hidden" {...form.register("accountId")} />
                  </div>

                  <div className="waitlist-field">
                    <label htmlFor="waitlist-telegram">Telegram Username</label>
                    <input
                      id="waitlist-telegram"
                      className="waitlist-dialog-input"
                      placeholder="@username"
                      autoComplete="off"
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
                    <input
                      id="waitlist-website"
                      tabIndex={-1}
                      autoComplete="off"
                      {...form.register("website")}
                    />
                  </div>

                  <Button
                    className="btn btn-lime btn-block"
                    type="submit"
                    disabled={join.isPending}
                  >
                    {join.isPending ? "Submitting request…" : "Claim 5,000 GEMBULL"}
                    {!join.isPending && <ArrowUpRight aria-hidden="true" size={17} />}
                  </Button>
                  {join.isError && (
                    <p className="waitlist-dialog-error" role="alert">
                      {join.error instanceof Error ? join.error.message : "Request failed. Try again."}
                    </p>
                  )}
                </form>
              </>
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
