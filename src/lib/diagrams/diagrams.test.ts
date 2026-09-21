import { describe, expect, it } from "vitest";
import { matchScientificTopic } from "@/lib/diagrams/matcher";
import { SCIENTIFIC_TEMPLATES } from "@/lib/diagrams/registry";
import { buildFlowchartLayout } from "@/lib/diagrams/flowchart";
import { buildDiagramBlocks } from "@/lib/engine/diagramService";
import { palette, sanitizeDiagramText } from "@/lib/diagrams/types";

describe("scientific matcher", () => {
  it("matches kidney aliases", () => {
    for (const topic of ["Kidney", "HUMAN KIDNEY", "kidney anatomy", "Renal system kidney"]) {
      const m = matchScientificTopic(topic);
      expect(m.ok).toBe(true);
      if (m.ok) expect(m.id).toBe("sci-kidney");
    }
  });

  it("returns suggestions for unsupported topics", () => {
    const m = matchScientificTopic("unicorn anatomy");
    expect(m.ok).toBe(false);
    if (!m.ok) expect(m.suggestions.length).toBeGreaterThan(0);
  });

  it("registers 18 scientific templates", () => {
    expect(SCIENTIFIC_TEMPLATES.length).toBe(18);
  });
});

describe("flowchart layout", () => {
  it("builds a vertical multi-step flowchart", () => {
    const layout = buildFlowchartLayout("photosynthesis");
    expect(layout.nodes.length).toBeGreaterThanOrEqual(4);
    expect(layout.nodes[0].kind).toBe("start");
    expect(layout.nodes.at(-1)?.kind).toBe("end");
    expect(layout.edges.length).toBe(layout.nodes.length - 1);
  });

  it("supports horizontal orientation", () => {
    const layout = buildFlowchartLayout("login process", "horizontal");
    expect(layout.orientation).toBe("horizontal");
    expect(layout.nodes.length).toBeGreaterThan(3);
  });
});

describe("buildDiagramBlocks", () => {
  it("builds kidney color labelled scientific note", () => {
    const blocks = buildDiagramBlocks({
      prompt: "Human Kidney",
      style: "clean-study",
      kind: "scientific",
      colorMode: "color",
      labelled: true,
    });
    const diagram = blocks.find((b) => b.type === "diagram");
    expect(diagram?.type).toBe("diagram");
    if (diagram?.type === "diagram") {
      expect(diagram.templateId).toBe("sci-kidney");
      expect(diagram.colorMode).toBe("color");
      expect(diagram.labelled).toBe(true);
      expect(diagram.kind).toBe("scientific");
    }
  });

  it("builds kidney bw unlabelled", () => {
    const blocks = buildDiagramBlocks({
      prompt: "Kidney",
      style: "clean-study",
      kind: "scientific",
      colorMode: "bw",
      labelled: false,
    });
    const diagram = blocks.find((b) => b.type === "diagram");
    if (diagram?.type === "diagram") {
      expect(diagram.colorMode).toBe("bw");
      expect(diagram.labelled).toBe(false);
    }
  });

  it("throws friendly error for unsupported scientific topic", () => {
    expect(() =>
      buildDiagramBlocks({
        prompt: "Martian volcano",
        style: "clean-study",
        kind: "scientific",
      }),
    ).toThrow(/isn't available yet/i);
  });

  it("builds flowchart blocks", () => {
    const blocks = buildDiagramBlocks({
      prompt: "Water cycle",
      style: "handwritten",
      kind: "flowchart",
    });
    const diagram = blocks.find((b) => b.type === "diagram");
    if (diagram?.type === "diagram") {
      expect(diagram.templateId).toBe("flowchart");
      expect(diagram.kind).toBe("flowchart");
    }
  });
});

describe("palette + sanitize", () => {
  it("bw palette is printable", () => {
    const p = palette("bw");
    expect(p.bg).toBe("#ffffff");
    expect(p.outline).toBe("#111111");
    expect(p.text).toBe("#111111");
  });

  it("sanitizes unsafe label text", () => {
    expect(sanitizeDiagramText('<script>alert("x")</script> kidney')).not.toMatch(/[<>]/);
  });
});
