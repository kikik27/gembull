import Image from "next/image";
import { formatRitl } from "@/lib/ritual-format";
import type { ResolvedRules } from "@/lib/ritual-params";
import type { GlobalState } from "@/schemas/ritual";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";
import { SimulationChart } from "./simulation-chart";

type Props = { global?: GlobalState; resolved: ResolvedRules };

export function SupplySection({ global, resolved }: Props) {
  const { rules, isLive } = resolved;
  const rows: Array<{ label: string; note: string; value: string }> = [
    {
      label: "Genesis supply",
      note: isLive ? "Fixed at contract initialization" : "Proposed launch amount",
      value: formatRitl(rules.initial_supply),
    },
    {
      label: "Total supply",
      note: "GEMBULL in circulation",
      value: formatRitl(global?.total_supply),
    },
    {
      label: "Ritual treasury",
      note: "GEMBULL held by the contract",
      value: formatRitl(global?.ritual_treasury_balance),
    },
    {
      label: "Rewards minted",
      note: "GEMBULL claimed by participants",
      value: formatRitl(global?.cumulative_rewards_minted),
    },
    {
      label: "Treasury burned",
      note: "GEMBULL removed after misses",
      value: formatRitl(global?.cumulative_treasury_burned),
    },
    {
      label: "Max supply",
      note: isLive ? "Hard emission cap" : "Hard emission cap · proposed",
      value: formatRitl(rules.max_supply, 0),
    },
    {
      label: "Reserved for claims",
      note: "Held back for today’s check-ins",
      value: formatRitl(global?.reserved_mint_capacity),
    },
    {
      label: "Free mint capacity",
      note: "Room left under the cap",
      value: formatRitl(global?.remaining_mint_capacity),
    },
  ];

  return (
    <section className="section" id="treasury" aria-labelledby="supply-title">
      <div className="frame">
        <SectionHead
          title={<span id="supply-title">Every number leaves a trace.</span>}
          aside="The contract reports the supply on the left. The separate 60-day simulation on the right shows how these rules could move it."
        />
        <div className="supply-grid">
          <Reveal className="panel watch">
            <div className="panel-head">
              <span>On-chain supply</span>
              <span className={`tag ${global ? "tag-live" : ""} tag-dot`}>
                {global ? "Testnet" : "Awaiting contract"}
              </span>
            </div>
            <dl className="watch-rows">
              {rows.map((row) => (
                <div className="watch-row" key={row.label}>
                  <dt>
                    {row.label}
                    <small>{row.note}</small>
                  </dt>
                  <dd>
                    {row.value}
                    {row.value !== "—" && <small>GEMBULL</small>}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="panel sim" delay={0.1}>
            <div className="panel-head">
              <span>60-day net supply change</span>
              <span className="tag tag-sim">Simulation</span>
            </div>
            <SimulationChart resolved={resolved} />
            <p className="sim-foot">
              Deterministic participation patterns from{" "}
              <code>docs/simulation</code>, run on the displayed rules from a
              150,000,000 GEMBULL treasury. Every eligible participant is assumed
              to claim. This is supply movement, not a price chart or a
              forecast.
            </p>
          </Reveal>
        </div>

        <Reveal className="panel-campaign-coin glass" delay={0.15}>
          <Image
            src="/brand/coins/gembull-campaign-coin.png"
            width={96}
            height={96}
            alt="GemBull campaign coin artwork"
            className="campaign-coin-img"
          />
          <div className="campaign-coin-body">
            <div className="campaign-coin-head">
              <strong>GemBull Genesis Artwork</strong>
              <span className="tag tag-sim">Campaign artwork · Not token metadata</span>
            </div>
            <p>
              The 3D campaign coin represents the ritual narrative. On-chain token metadata at{" "}
              <code>gembull-core.testnet</code> is verified NEP-141 / NEP-148 <b>GemBull</b> (18 decimals).
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
