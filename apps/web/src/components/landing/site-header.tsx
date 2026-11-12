"use client";

import { Button } from "@/components/ui/button";
import { shortAccount } from "@/lib/ritual-format";
import { RITUAL_CONTRACT_ID } from "@/constants/ritual";
import { BrandWord } from "./brand-mark";

type Props = {
  accountId: string | null | undefined;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
};

const links = [
  { href: "#ritual", label: "Ritual" },
  { href: "#how", label: "How it works" },
  { href: "#treasury", label: "Supply" },
  { href: "#rules", label: "Rules" },
];

export function SiteHeader({ accountId, loading, signIn, signOut }: Props) {
  return (
    <header className="nav" data-intro="nav">
      <a className="nav-logo" href="#top" aria-label="GemBull home">
        <BrandWord size={34} />
      </a>
      <nav className="nav-menu" aria-label="Main navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <span className={`tag tag-dot nav-network ${RITUAL_CONTRACT_ID ? "tag-live" : ""}`}>
          {RITUAL_CONTRACT_ID ? "NEAR Testnet" : "Preview"}
        </span>
        <Button
          className="pill pill-dark"
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
    </header>
  );
}
