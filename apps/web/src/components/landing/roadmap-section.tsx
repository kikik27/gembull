import { Reveal } from "./reveal";

const milestones = [
  {
    status: "LIVE ON TESTNET",
    title: "GemBull contract and supply model",
    detail: "Verified GEMBULL metadata and genesis balances at gembull-core.testnet. Daily check-ins, claims, and treasury burns are enforced by the contract.",
  },
  {
    status: "NEXT",
    title: "Demonstrate the live ritual",
    detail: "Fund eligible Testnet participants, record a real wallet check-in, and capture the transaction history. Sandbox covers success and missed days.",
  },
  {
    status: "PLANNED",
    title: "Stock-reserve simulation",
    detail: "Design a separate two-source mock reserve and activity-point allocations. Fees, graduation surplus, and stock rewards remain PROPOSED or SIMULATED; no receipt token in the MVP.",
  },
];

export function RoadmapSection() {
  return (
    <section className="section" id="roadmap" aria-labelledby="roadmap-title">
      <div className="sec-head">
        <Reveal><h2 className="h2" id="roadmap-title">What ships next.</h2></Reveal>
        <Reveal delay={0.1}><p>Implementation status, not a promise of returns or a token launch date.</p></Reveal>
      </div>
      <ol className="roadmap-list">
        {milestones.map((item, index) => (
          <li key={item.title}>
            <Reveal className="roadmap-item" delay={index * 0.06}>
              <span className="roadmap-status">{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
