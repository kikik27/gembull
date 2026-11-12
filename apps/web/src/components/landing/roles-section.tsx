import { ArrowRight, Braces, ShieldCheck, Users, Wallet } from "lucide-react";
import { Reveal } from "./reveal";

const roles = [
  {
    icon: Wallet,
    title: "Holder",
    body: "A single check-in joins a larger count. Hold the minimum, show up once, and claim if the day succeeds.",
    chips: ["Minimum holding", "One per epoch"],
    href: "#ritual",
    cta: "Enter the ritual",
  },
  {
    icon: Users,
    title: "Community",
    body: "The streak is written together, one eligible account at a time. Its history stays open to everyone.",
    chips: ["Shared streak", "Public history"],
    href: "#history",
    cta: "See the history",
  },
  {
    icon: ShieldCheck,
    title: "Judge",
    body: "Follow every parameter, claim and burn to the contract. The ritual is meant to be checked, not taken on faith.",
    chips: ["get_rules()", "Event logs"],
    href: "#rules",
    cta: "Read the rules",
  },
  {
    icon: Braces,
    title: "Builder",
    body: "Read the contract views, run the 60-day simulation, and build on the mechanic.",
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
            One ritual. Many ways
            <br />
            to <em>show up.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="lede">
            Whether you hold, gather, inspect, or build, the same public rules
            give every role a place in the story.
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
