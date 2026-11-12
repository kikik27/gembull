import { Reveal } from "./reveal";

const milestones = [
  {
    status: "BUILT LOCALLY",
    title: "Ritual contract and supply model",
    detail: "NEP-141 contract source, daily check-in rules, reward claims, treasury burn, and the reproducible 60-day simulation.",
  },
  {
    status: "NEXT",
    title: "Verify and deploy GemBull on Testnet",
    detail: "Run Rust unit and Sandbox tests, deploy the new GEMBULL metadata, then document a real wallet check-in and claim.",
  },
  {
    status: "PLANNED",
    title: "Stock-reserve simulation",
    detail: "Build a separate mock vault and receipt flow. Any broker or equity figures stay visibly SIMULATED.",
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
