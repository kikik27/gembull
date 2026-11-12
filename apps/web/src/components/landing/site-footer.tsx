type Props = { explorer: string };

export function SiteFooter({ explorer }: Props) {
  return (
    <footer className="footer field-ground">
      <div className="frame">
        <div className="footer-top">
          <p>
            StonkRitual is a hackathon prototype on NEAR Testnet. RITL is a
            community meme token, not an equity claim. The stock reserve is a
            simulation with no real shares, custody or redemption. Name and
            ticker are working candidates.
          </p>
          <div>
            <h3>Explore</h3>
            <ul>
              <li>
                <a href="#ritual">Today’s ritual</a>
              </li>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <a href="#treasury">Supply</a>
              </li>
              <li>
                <a href="#rules">Rules</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Verify</h3>
            <ul>
              <li>
                <a href="#history">Epoch history</a>
              </li>
              {explorer ? (
                <li>
                  <a href={explorer} target="_blank" rel="noreferrer">
                    Contract explorer ↗
                  </a>
                </li>
              ) : (
                <li className="muted">No contract configured</li>
              )}
              <li>
                <a href="#top">Back to top ↑</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-mark" aria-hidden="true">
          Stonk<span>Ritual</span>
        </div>
        <div className="footer-base">
          <span>Built for NEAR Hackathon Track 11 · Testnet development</span>
          <span>Not financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
