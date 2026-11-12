import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";

/**
 * The hero is deliberately sparse: the fixed scene (pond + coin) is the picture.
 * Entrance motion is CSS-only (see [data-intro] in globals.css) so it runs without hydration.
 */
export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <Image
            className="hero-logo"
            src="/brand/gembull-logo.png"
            width={1536}
            height={1024}
            sizes="(max-width: 640px) 108px, 140px"
            alt="GemBull bull logo"
            priority
          />
          <span className="tag tag-dot" data-intro="sub">
            NEAR memecoin · Testnet prototype
          </span>
          <h1 id="hero-title">
            <span className="mask">
              <span data-intro="line-1">The meme runs</span>
            </span>
            <span className="mask">
              <span data-intro="line-2">
                on <em>rituals.</em>
              </span>
            </span>
          </h1>
          <p className="hero-sub" data-intro="sub">
            A meme with a memory. Show up once a day on NEAR Testnet. The
            contract records the ritual; a successful day opens eligible reward claims,
            while a missed day burns a slice of the ritual treasury.
          </p>
          <div className="hero-actions" data-intro="actions">
            <a className="btn btn-lime" href="#dash">
              Enter the ritual <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            <a className="btn btn-ghost" href="#rules">
              Read the rules
            </a>
          </div>
        </div>

        <a className="scroll-card" href="#ritual" data-intro="card">
          <span>Explore the ritual</span>
          <ArrowDown className="scroll-arrow" aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}
