import type { Subject } from "@/lib/types";

const LEXICONS: Record<Exclude<Subject, "auto">, string[]> = {
  mathematics: [
    "equation",
    "algebra",
    "theorem",
    "integral",
    "derivative",
    "matrix",
    "geometry",
    "proof",
    "polynomial",
    "function",
    "quadratic",
    "trigonometry",
  ],
  "computer-science": [
    "algorithm",
    "function",
    "variable",
    "loop",
    "array",
    "compiler",
    "database",
    "class",
    "object",
    "python",
    "javascript",
    "complexity",
    "syntax",
  ],
  biology: [
    "cell",
    "organism",
    "photosynthesis",
    "enzyme",
    "dna",
    "protein",
    "tissue",
    "mitosis",
    "chromosome",
    "ecosystem",
    "respiration",
  ],
  chemistry: [
    "molecule",
    "atom",
    "reaction",
    "compound",
    "acid",
    "base",
    "mole",
    "oxidation",
    "bond",
    "element",
    "catalyst",
  ],
  physics: [
    "force",
    "velocity",
    "acceleration",
    "energy",
    "momentum",
    "voltage",
    "current",
    "gravity",
    "wave",
    "mass",
    "newton",
  ],
  history: [
    "century",
    "empire",
    "war",
    "revolution",
    "king",
    "treaty",
    "civilization",
    "colony",
    "independence",
    "dynasty",
  ],
  general: [],
};

export function detectSubject(text: string): Exclude<Subject, "auto"> {
  const lower = text.toLowerCase();
  let best: Exclude<Subject, "auto"> = "general";
  let bestScore = 0;
  for (const [subject, words] of Object.entries(LEXICONS) as Array<
    [Exclude<Subject, "auto">, string[]]
  >) {
    if (subject === "general") continue;
    const score = words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = subject;
    }
  }
  return bestScore >= 2 ? best : "general";
}
