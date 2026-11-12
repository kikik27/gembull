import Image from "next/image";
import { bpsToPercent, epochHours, type ResolvedRules } from "@/lib/ritual-params";
import { formatRitl } from "@/lib/ritual-format";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

export function HowItWorks({ resolved }: { resolved: ResolvedRules }) {
  const { rules } = resolved;
  const steps = [
    {
      title: "Check in.",
      body: `Any NEAR account holding at least ${formatRitl(rules.min_holding, 0)} RITL checks in once per ${epochHours(rules)}-hour epoch. One transaction, recorded on-chain.`,
      image: "/brand/stickers/sticker-gm.png",
      alt: "Bull mascot giving a thumbs up with GM",
      contain: false,
    },
    {
      title: `Hit ${rules.daily_target}.`,
      body: `If ${rules.daily_target} accounts check in before the epoch closes, the day succeeds and the community streak goes up by one.`,
      image: "/brand/stickers/sticker-streak.png",
      alt: "Bull mascot meditating in green flames with the word Streak",
      contain: false,
    },
    {
      title: "Mint or burn.",
      body: `On success every participant claims ${formatRitl(rules.reward_per_checkin, 0)} RITL, minted by the contract. On a miss the ritual treasury burns ${bpsToPercent(rules.treasury_burn_bps)}. No admin can change either number.`,
      image: "/brand/icons/icon-burn-256.png",
      alt: "Lime flame icon for the treasury burn",
      contain: true,
    },
  ];

  return (
    <section className="section field-paper" id="how" aria-labelledby="how-title">
      <div className="frame">
        <SectionHead title={<span id="how-title">One day, three steps.</span>} aside="The whole mechanic fits on one screen. Everything below it is the contract showing its work." />
        <ol className="how-list">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Reveal className="how-step" delay={index * 0.06}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <div className="how-media">
                  <Image className={step.contain ? "contain" : undefined} src={step.image} width={420} height={560} alt={step.alt} />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
