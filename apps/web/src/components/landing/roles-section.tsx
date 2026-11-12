import { ArrowRight, Braces, ShieldCheck, Users, Wallet } from "lucide-react";
import { Reveal } from "./reveal";

const roles = [
  {
    icon: Wallet,
    title: "Holder",
    body: "Hold the minimum, check in once an epoch, claim when the community hits the target.",
    chips: ["Minimum holding", "One per epoch"],
    href: "#ritual",
    cta: "Enter the ritual",
  },
  {
    icon: Users,
    title: "Community",
    body: "Participation is the number that matters. The streak belongs to everyone, not one wallet.",
    chips: ["Shared streak", "Public history"],
    href: "#history",
    cta: "See the history",
  },
  {
    icon: ShieldCheck,
    title: "Judge",
    body: "Inspect every parameter, mint and burn. No setters, no hidden mint, no trust required.",
    chips: ["get_rules()", "Event logs"],
    href: "#rules",
    cta: "Read the rules",
  },
  {
    icon: Braces,
    title: "Builder",
    body: "Read the contract views, run the 60-day simulation and fork the mechanic.",
    chips: ["Open views", "Simulation"],
    href: "#treasury",
    cta: "See the supply",
  },
];

export function RolesSection() {
  return (
    <section className="roles" id="roles" aria-labelledby="roles-title">
      <div className="roles-head">
        <Reveal>
          <h2 className="h2" id="roles-title">
            Built for everyone
            <br />
            who <em>shows up.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="lede">
            One ritual, four ways in. Every role gets the controls it needs,
            and nothing it doesn’t.
          </p>
        </Reveal>
      </div>
      <ol className="stairs">
        {roles.map((role, index) => (
          <li className="stair" key={role.title}>
            <Reveal className="role glass" delay={index * 0.06}>
              <div className="role-top">
                <span className="role-tag">ROLE</span>
                <role.icon className="role-icon" aria-hidden="true" size={24} strokeWidth={1.4} />
              </div>
              <h3>{role.title}</h3>
              <p>{role.body}</p>
              <div className="chips">
                {role.chips.map((chip) => (
                  <span className="chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
              <a className="text-link role-link" href={role.href}>
                {role.cta} <ArrowRight aria-hidden="true" size={16} />
              </a>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
