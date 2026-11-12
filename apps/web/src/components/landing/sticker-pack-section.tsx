import Image from "next/image";
import { Download } from "lucide-react";
import { Reveal } from "./reveal";

const stickers = [
  {
    name: "GM",
    file: "/brand/stickers/gembull-gm.png",
    description: "Say good morning to the community.",
  },
  {
    name: "Checked in",
    file: "/brand/stickers/gembull-checked-in.png",
    description: "Celebrate a confirmed daily ritual.",
  },
  {
    name: "Streak",
    file: "/brand/stickers/gembull-streak.png",
    description: "Keep showing up, one epoch at a time.",
  },
  {
    name: "Target hit",
    file: "/brand/stickers/gembull-target-hit.png",
    description: "The community reached its daily target.",
  },
] as const;

export function StickerPackSection() {
  return (
    <section className="section" id="stickers" aria-labelledby="stickers-title">
      <div className="sec-head">
        <Reveal>
          <h2 className="h2" id="stickers-title">Give the ritual a face.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p>Four little marks for the days you show up. Download a transparent PNG and share the moment with your community.</p>
        </Reveal>
      </div>
      <div className="sticker-pack-grid">
        {stickers.map((sticker, index) => (
          <Reveal className="sticker-pack-card" key={sticker.file} delay={index * 0.05}>
            <div className="sticker-pack-preview">
              <Image
                src={sticker.file}
                width={220}
                height={220}
                sizes="(max-width: 640px) 42vw, (max-width: 1000px) 22vw, 220px"
                alt={`GemBull bull sticker: ${sticker.name}`}
              />
            </div>
            <div className="sticker-pack-info">
              <h3>{sticker.name}</h3>
              <p>{sticker.description}</p>
              <a href={sticker.file} download={sticker.file.split("/").at(-1)}>
                Download PNG <Download aria-hidden="true" size={15} />
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
