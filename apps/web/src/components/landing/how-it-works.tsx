import { ArrowRight, CalendarCheck, Flame, Target } from "lucide-react";
import {
  bpsToPercent,
  epochHours,
  type ResolvedRules,
} from "@/lib/ritual-params";
import { formatRitl } from "@/lib/ritual-format";
import { Reveal } from "./reveal";
import { TypedCall } from "./typed-call";

export function HowItWorks({ resolved }: { resolved: ResolvedRules }) {
  const { rules } = resolved;
  const hours = epochHours(rules);
  const cards = [
    {
      index: "01",
      icon: CalendarCheck,
      eyebrow: "CHECK IN",
      title: "Show up once per epoch.",
      body: `Any NEAR account holding at least ${formatRitl(rules.min_holding, 0)} GEMBULL checks in once per ${hours}-hour epoch. One transaction, recorded on-chain.`,
      caption: "Epoch length",
      metric: `${hours}h`,
      href: "#dash",
      cta: "Try it",
      lead: true,
    },
    {
      index: "02",
      icon: Target,
      eyebrow: "HIT THE TARGET",
      title: `Reach ${rules.daily_target} together.`,
      body: `If ${rules.daily_target} accounts check in before the epoch closes, the day succeeds and the community streak goes up by one.`,
      caption: "Daily target",
      metric: String(rules.daily_target),
      href: "#calculator",
      cta: "Run the numbers",
    },
    {
      index: "03",
      icon: Flame,
      eyebrow: "MINT OR BURN",
      title: "Claim or burn.",
      body: `On success every participant claims ${formatRitl(rules.reward_per_checkin, 0)} GEMBULL, minted by the contract. On a miss the ritual treasury burns ${bpsToPercent(rules.treasury_burn_bps)}. No admin can change either number.`,
      caption: "Missed-day burn",
      metric: bpsToPercent(rules.treasury_burn_bps),
      href: "#rules",
      cta: "See the rules",
    },
  ];
  const steps = [
    {
      lead: "Connect a NEAR wallet",
      rest: "A Testnet account holding the minimum GEMBULL.",
    },
    {
      lead: "Check in once",
      rest: "One transaction per epoch, recorded on-chain.",
    },
    {
      lead: "Claim after finalization",
      rest: "Rewards are minted only after a successful epoch.",
    },
  ];

  return (
    <section className="how" id="how" aria-labelledby="how-title">
      <div className="split">
        <div className="split-copy">
          <Reveal>
            <span className="tag tag-dot">How it works</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2" id="how-title">
              One day, <em>three steps.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede">
              The whole mechanic fits on one screen. Everything below it is the
              contract showing its work.
            </p>
          </Reveal>
          <Reveal className="split-actions" delay={0.15}>
            <a className="btn btn-white" href="#calculator">
              Open the calculator
            </a>
            <a className="btn btn-dk" href="#rules">
              Read the rules
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <TypedCall />
        </Reveal>
      </div>

      <div className="packs">
        {cards.map((card, index) => (
          <Reveal
            key={card.index}
            className={`pack glass${card.lead ? " pack-lead" : ""}`}
            delay={index * 0.08}
          >
            <div className="pack-top">
              <span className="pack-index">{card.index}</span>
              <card.icon
                className="pack-icon"
                aria-hidden="true"
                size={24}
                strokeWidth={1.4}
              />
            </div>
            <p className="pack-eyebrow">{card.eyebrow}</p>
            <h3>{card.title}</h3>
            <p className="pack-body">{card.body}</p>
            <div className="pack-meta">
              <div>
                <span>{card.caption}</span>
                <strong className="tabular">{card.metric}</strong>
              </div>
              <a className="text-link" href={card.href}>
                {card.cta} <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <ol className="steps">
          {steps.map((step) => (
            <li key={step.lead}>
              <span>
                <b>{step.lead}</b> {step.rest}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
