import Image from "next/image";

/** GemBull mark, approved for use on the landing page. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <Image
      src="/brand/icons/gembull-app-icon.png"
      width={size}
      height={size}
      alt=""
      className="brand-mark"
    />
  );
}

export function BrandWord({ size = 34 }: { size?: number }) {
  return (
    <span className="brand-word">
      <BrandMark size={size} />
      <span>
        Gem<b>Bull</b>
      </span>
    </span>
  );
}
