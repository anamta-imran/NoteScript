import type { PaperTexture } from "./types";

/** Deterministic SVG texture overlays — no AI, crisp when printed/scaled. */
export function textureDataUri(texture: PaperTexture, dark = false): string | null {
  if (texture === "none") return null;

  const stroke = dark ? "rgba(255,255,255,0.06)" : "rgba(60,40,20,0.06)";
  const stroke2 = dark ? "rgba(255,255,255,0.04)" : "rgba(80,55,30,0.045)";

  const svgs: Record<Exclude<PaperTexture, "none">, string> = {
    grain: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter>
      <rect width="120" height="120" filter="url(#n)" opacity="0.18"/>
    </svg>`,
    fiber: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
      <g stroke="${stroke}" stroke-width="0.6" fill="none">
        <path d="M0 20 Q40 18 80 22 T160 20"/>
        <path d="M0 55 Q50 60 100 52 T160 55"/>
        <path d="M0 95 Q45 90 90 98 T160 95"/>
        <path d="M0 130 Q55 135 110 128 T160 130"/>
        <path d="M20 0 Q22 40 18 80 T20 160"/>
        <path d="M70 0 Q68 50 74 100 T70 160"/>
        <path d="M120 0 Q125 45 118 95 T120 160"/>
      </g>
    </svg>`,
    aged: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch"/></filter>
      <rect width="200" height="200" filter="url(#n)" opacity="0.22"/>
      <circle cx="30" cy="40" r="18" fill="${stroke2}"/>
      <circle cx="160" cy="150" r="22" fill="${stroke2}"/>
      <circle cx="110" cy="60" r="10" fill="${stroke}"/>
    </svg>`,
    kraft: `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>
      <rect width="140" height="140" filter="url(#n)" opacity="0.28"/>
      <g fill="${stroke}">
        <circle cx="20" cy="30" r="1.2"/><circle cx="55" cy="80" r="1"/><circle cx="100" cy="40" r="1.4"/>
        <circle cx="75" cy="120" r="1"/><circle cx="125" cy="95" r="1.1"/>
      </g>
    </svg>`,
    recycled: `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
      <rect width="150" height="150" filter="url(#n)" opacity="0.2"/>
      <g stroke="${stroke}" stroke-width="0.5" fill="none" opacity="0.7">
        <path d="M10 40h40M60 90h35M100 25h30"/>
        <path d="M25 10v35M90 50v40"/>
      </g>
    </svg>`,
    handmade: `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" stitchTiles="stitch"/></filter>
      <rect width="180" height="180" filter="url(#n)" opacity="0.16"/>
      <path d="M0 40 Q45 35 90 42 T180 40" stroke="${stroke}" fill="none" stroke-width="1"/>
      <path d="M0 100 Q60 108 120 98 T180 100" stroke="${stroke2}" fill="none" stroke-width="1.2"/>
      <path d="M0 150 Q50 145 100 152 T180 150" stroke="${stroke}" fill="none" stroke-width="0.8"/>
    </svg>`,
    chalkboard: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter>
      <rect width="160" height="160" filter="url(#n)" opacity="0.25"/>
      <g stroke="rgba(255,255,255,0.05)" stroke-width="1" fill="none">
        <path d="M0 30h160M0 80h160M0 130h160"/>
      </g>
    </svg>`,
  };

  const svg = svgs[texture];
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

export function isometricPattern(size: number, color: string): string {
  const h = size * Math.sin(Math.PI / 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${h * 2}">
    <path d="M0 ${h} L${size} 0 L${size * 2} ${h} L${size} ${h * 2} Z M${size} 0 V${h * 2} M0 ${h} H${size * 2}"
      fill="none" stroke="${color}" stroke-width="0.8"/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}
