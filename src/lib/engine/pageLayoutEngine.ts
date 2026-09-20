import type { NoteBlock, NotePage } from "@/lib/types";

const PAGE_HEIGHT = 980;
const MARGIN = 40;

function estimateHeight(block: NoteBlock): number {
  switch (block.type) {
    case "heading":
      return block.level === 1 ? 72 : block.level === 2 ? 56 : 44;
    case "paragraph":
      return 28 + Math.ceil(block.text.length / 72) * 26;
    case "bullets":
    case "numbered":
      return 16 + block.items.length * 28;
    case "definition":
      return 88;
    case "formula":
    case "chemistry-equation":
      return 72;
    case "example":
      return 36 + Math.ceil(block.text.length / 70) * 24;
    case "math-problem":
      return 180 + block.steps.length * 24;
    case "cs-concept":
      return 160;
    case "timeline":
      return 40 + block.events.length * 36;
    case "code":
      return 48 + Math.ceil(block.code.length / 60) * 20;
    case "diagram":
      return 220;
    case "timestamp":
      return 36;
    case "callout":
      return 80;
    default:
      return 40;
  }
}

export function paginateNote(blocks: NoteBlock[], maxPages: number, seed = 1): NotePage[] {
  const pages: NotePage[] = [];
  let current: NoteBlock[] = [];
  let height = MARGIN;

  const pushPage = () => {
    if (!current.length) return;
    pages.push({ index: pages.length, blocks: current, seed });
    current = [];
    height = MARGIN;
  };

  for (const block of blocks) {
    if (pages.length >= maxPages) break;
    const h = estimateHeight(block);
    if (height + h > PAGE_HEIGHT && current.length) {
      if (block.type === "heading" && current.length) {
        pushPage();
      } else {
        pushPage();
      }
    }
    if (pages.length >= maxPages) break;
    current.push(block);
    height += h;
  }
  pushPage();
  if (!pages.length) {
    pages.push({ index: 0, blocks: [], seed });
  }
  return pages.slice(0, maxPages);
}

export function regeneratePageLayout(page: NotePage, allBlocks: NoteBlock[]): NotePage {
  const nextSeed = page.seed + 1;
  const rotated = [...page.blocks.slice(1), ...page.blocks.slice(0, 1)];
  const blocks = rotated.length ? rotated : page.blocks;
  return { ...page, blocks: blocks.length ? blocks : allBlocks.slice(0, 4), seed: nextSeed };
}
