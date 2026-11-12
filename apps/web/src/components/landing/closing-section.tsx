import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { BrandWord } from "./brand-mark";
import { Reveal } from "./reveal";

const columns = [
  {
    title: "Ritual",
    links: [
      { href: "#ritual", label: "Today’s ritual" },
      { href: "#how", label: "How it works" },
      { href: "#calculator", label: "Calculator" },
    ],
  },
  {
    title: "Transparency",
    links: [
      { href: "#treasury", label: "Supply" },
      { href: "#history", label: "Epoch history" },
      { href: "#rules", label: "Rules" },
      { href: "#roadmap", label: "Roadmap" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "#roles", label: "Who it’s for" },
      { href: "#join", label: "Join the ritual" },
      { href: "#top", label: "Back to top" },
    ],
  },
  {
    title: "Simulation",
    links: [{ href: "#vault", label: "Stock vault · simulated" }],
  },
];

/** Call to action and footer share one section so the scene can fade to night behind both. */
export function EndSection({ explorer }: { explorer: string }) {
  return (
    <section className="end" id="end">
      <Reveal className="cta glass" id="join" y={40}>
        <Image
          className="cta-avatar"
          src="/brand/icons/gembull-app-icon.png"
          width={72}
          height={72}
          alt="The GemBull mascot"
        />
        <h2 className="cta-title">
          Check in. <em>Keep the streak.</em>
        </h2>
        <p className="lede">
          One transaction a day. The contract keeps score, so nobody has to take
          our word for it.
        </p>
        <div className="cta-actions">
          <a className="btn btn-lime" href="#dash">
            Enter the ritual <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          <a className="btn btn-ghost" href="#rules">
            Read the rules
          </a>
        </div>
        <p className="cta-note">
          Testnet only <i>·</i> No price promises <i>·</i> Stock layer is a
          simulation
        </p>
      </Reveal>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label="GemBull home">
              <BrandWord size={28} />
            </a>
            <p>
              GemBull is a NEAR Testnet hackathon prototype at
              gembull-core.testnet. Its token is a community meme, not an equity
              claim. The stock reserve is a simulation with no real shares,
              custody or redemption.
            </p>
            <span className={`tag tag-dot ${explorer ? "tag-live" : ""}`}>
              {explorer ? "NEAR Testnet" : "Local preview"}
            </span>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
                {column.title === "Transparency" &&
                  (explorer ? (
                    <li>
                      <a href={explorer} target="_blank" rel="noreferrer">
                        Contract explorer ↗
                      </a>
                    </li>
                  ) : (
                    <li className="footer-muted">No contract configured</li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-legal">
          <span>©2026 GemBull · Built for NEAR Hackathon Track 11</span>
          <span>Not financial advice.</span>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          GemBull
        </div>
      </footer>
    </section>
  );
}
