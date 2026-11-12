"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { shortAccount } from "@/lib/ritual-format";

type Props = {
  accountId: string | null | undefined;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
};

export function SiteHeader({ accountId, loading, signIn, signOut }: Props) {
  return (
    <header className="bar">
      <div className="frame bar-inner">
        <a className="bar-logo" href="#top" aria-label="StonkRitual home">
          <Image
            src="/brand/stonkritual-primary-logo.svg"
            width={220}
            height={60}
            alt="StonkRitual — The meme runs on rituals"
            priority
          />
        </a>
        <nav aria-label="Main navigation">
          <a href="#ritual">Ritual</a>
          <a href="#how">How it works</a>
          <a href="#treasury">Supply</a>
          <a href="#rules">Rules</a>
        </nav>
        <div className="bar-actions">
          <span className="tag tag-live tag-dot">NEAR Testnet</span>
          <Button
            className="btn btn-quiet btn-sm"
            type="button"
            onClick={() => (accountId ? signOut() : signIn())}
            disabled={loading}
          >
            {loading
              ? "Connecting…"
              : accountId
                ? shortAccount(accountId)
                : "Connect wallet"}
          </Button>
        </div>
      </div>
    </header>
  );
}
