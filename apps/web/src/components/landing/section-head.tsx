import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type Props = { title: ReactNode; aside?: ReactNode };

export function SectionHead({ title, aside }: Props) {
  return (
    <div className="sec-head">
      <Reveal>
        <h2 className="h2">{title}</h2>
      </Reveal>
      {aside ? (
        <Reveal delay={0.1}>
          <p>{aside}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
